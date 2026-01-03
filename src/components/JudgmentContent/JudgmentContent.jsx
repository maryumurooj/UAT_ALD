import React, { useRef, useState, useEffect } from "react";
import styles from "./JudgmentContent.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import IsolatedEditModal from "./IsolatedEditModal";

const JudgmentContent = ({
  judgmentData,
  setReferredCitation,
  searchTerms = [],
}) => {
  const paraRefs = useRef({});
  const [loading, setLoading] = useState(true);
  const [modalKey, setModalKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalHasLink, setModalHasLink] = useState(false);

  // Edit state management
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editLinkValue, setEditLinkValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [localJudgmentData, setLocalJudgmentData] = useState(judgmentData);
  const [hoveredField, setHoveredField] = useState(null);

  // Selection & Merge state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedParas, setSelectedParas] = useState([]);
  const [selectionType, setSelectionType] = useState(null);

  // Status management (add after existing states)
  const [judgmentStatus, setJudgmentStatus] = useState(null); // null = not loaded yet
  const [lastEditedAt, setLastEditedAt] = useState(null);

  // Fetch status on load
  useEffect(() => {
    const fetchStatus = async () => {
      if (!localJudgmentData?.judgmentId) return;

      try {
        const response = await fetch(
          `${API_BASE}/judgment-status/${localJudgmentData.judgmentId}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("📊 Status loaded:", data.status);
          setJudgmentStatus(data.status);
          setLastEditedAt(data.lastEditedAt);
        } else {
          console.error("Failed to fetch status");
          setJudgmentStatus("error"); // Show error state
        }
      } catch (error) {
        console.error("Error:", error);
        setJudgmentStatus("error");
      }
    };

    fetchStatus();
  }, [localJudgmentData?.judgmentId]);

  // Update status
  const updateStatus = async (newStatus) => {
    try {
      const response = await fetch(
        `${API_BASE}/judgment-status/${localJudgmentData.judgmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setJudgmentStatus(data.status);
        setLastEditedAt(data.lastEditedAt);
        console.log("✅ Status updated to:", newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [judgmentData]);

  // ✅ Only sync when judgmentData changes (new judgment loaded)
  useEffect(() => {
    if (judgmentData) {
      setLocalJudgmentData(judgmentData);
    }
  }, [judgmentData?.judgmentId]); // Only when ID changes, not on every prop change

  useEffect(() => {
    console.log('🔵 localJudgmentData CHANGED:', {
      judgmentId: localJudgmentData?.judgmentId,
      courtText: localJudgmentData?.judgmentCourtText?.substring(0, 50),
      shortNotesCount: localJudgmentData?.ShortNotes?.length,
    });
  }, [localJudgmentData]);
  
  useEffect(() => {
    console.log('🔴 PARENT judgmentData prop changed:', {
      judgmentId: judgmentData?.judgmentId,
      courtText: judgmentData?.judgmentCourtText?.substring(0, 50),
    });
  }, [judgmentData]);
  
  // API Base URL
  const API_BASE = "http://61.246.67.74:4001/api/uat";

  // Selection handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedParas([]);
    setSelectionType(null);
  };
  useEffect(() => {
    console.log("🔴 editValue STATE CHANGED to:", editValue?.substring(0, 50));
    console.log("🔴 Stack trace:", new Error().stack);
  }, [editValue]);

  const handleParaSelection = (paraId, paraType) => {
    if (selectionType && selectionType !== paraType) {
      alert("You can only merge paragraphs of the same type!");
      return;
    }

    setSelectionType(paraType);

    if (selectedParas.includes(paraId)) {
      setSelectedParas(selectedParas.filter((id) => id !== paraId));
      if (selectedParas.length === 1) {
        setSelectionType(null);
      }
    } else {
      setSelectedParas([...selectedParas, paraId]);
    }
  };

  const handleMergeParas = async () => {
    if (selectedParas.length < 2) {
      alert("Please select at least 2 paragraphs to merge");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to merge ${selectedParas.length} paragraphs? This action cannot be undone.`
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/merge-paras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paraType: selectionType,
          paraIds: selectedParas,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // 👇 ADD STATUS UPDATE HERE (right after successful merge)
        if (judgmentStatus === "untouched") {
          updateStatus("in_progress");
        }

        if (selectionType === "judgmentTextPara") {
          const updatedJudgmentTexts = localJudgmentData.JudgmentTexts.map(
            (jt) => ({
              ...jt,
              JudgmentTextParas: jt.JudgmentTextParas.filter(
                (para) => !result.deletedIds.includes(para.judgementTextParaId)
              ).map((para) =>
                para.judgementTextParaId ===
                result.mergedPara.judgementTextParaId
                  ? {
                      ...para,
                      judgementTextParaText:
                        result.mergedPara.judgementTextParaText,
                    }
                  : para
              ),
            })
          );
          setLocalJudgmentData({
            ...localJudgmentData,
            JudgmentTexts: updatedJudgmentTexts,
          });
        } else if (selectionType === "longNotePara") {
          const updatedShortNotes = localJudgmentData.ShortNotes.map((sn) => ({
            ...sn,
            LongNotes: sn.LongNotes.map((ln) => ({
              ...ln,
              LongNoteParas: ln.LongNoteParas.filter(
                (para) => !result.deletedIds.includes(para.longNoteParaId)
              ).map((para) =>
                para.longNoteParaId === result.mergedPara.longNoteParaId
                  ? {
                      ...para,
                      longNoteParaText: result.mergedPara.longNoteParaText,
                    }
                  : para
              ),
            })),
          }));
          setLocalJudgmentData({
            ...localJudgmentData,
            ShortNotes: updatedShortNotes,
          });
        }

        alert(`✓ Successfully merged ${selectedParas.length} paragraphs!`);
        setSelectedParas([]);
        setSelectionType(null);
        setSelectionMode(false);
      } else {
        const errorText = await response.text();
        alert(`Failed to merge paragraphs: ${errorText}`);
      }
    } catch (error) {
      console.error("Error merging paragraphs:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Edit handlers
  const handleEdit = (fieldType, fieldId, currentValue, linkValue = "") => {
    console.log("🟡 handleEdit called - fieldType:", fieldType);
    console.log(
      "🟡 handleEdit - currentValue:",
      currentValue?.substring(0, 50)
    );

    if (selectionMode) {
      alert("Please exit selection mode before editing");
      return;
    }

    console.log(`Editing ${fieldType} with ID: ${fieldId}`);

    if (!fieldId) {
      alert("Error: Field ID is missing. Cannot edit this field.");
      return;
    }

    if (judgmentStatus === "untouched") {
      updateStatus("in_progress");
    }

    // Set modal data
    setEditingField(`${fieldType}-${fieldId}`);
    setEditValue(currentValue || "");
    console.log(
      "🟡 setEditValue called with:",
      (currentValue || "").substring(0, 50)
    );
    setEditLinkValue(linkValue || "");
    setModalKey((prev) => prev + 1); // ← Force new modal instance
    setModalOpen(true);

    // Set modal title based on field type
    const titles = {
      "judgment-courtText": "Edit Court Text",
      "judgment-judges": "Edit Judges",
      "judgment-noText": "Edit Judgment Number",
      "judgment-parties": "Edit Parties",
      "judgment-petitionerCouncil": "Edit Petitioner Counsel",
      "judgment-respondentCouncil": "Edit Respondent Counsel",
      "judgment-otherCounsel": "Edit Other Counsel",
      shortNote: "Edit Short Note",
      longNotePara: "Edit Long Note Paragraph",
      judgmentTextPara: "Edit Judgment Text Paragraph",
    };

    setModalTitle(titles[fieldType] || "Edit Content");
    setModalHasLink(fieldType === "longNotePara");
    setModalOpen(true);
  };

  const handleModalSave = async (newValue, newLinkValue) => {
    // DON'T update state - just save directly!

    try {
      if (editingField.startsWith("judgment-")) {
        await handleSaveJudgment(localJudgmentData.judgmentId, newValue);
      } else if (editingField.startsWith("shortNote-")) {
        const shortNoteId = editingField.split("-")[1];
        await handleSaveShortNote(parseInt(shortNoteId), newValue);
      } else if (editingField.startsWith("longNotePara-")) {
        const [_, paraId, shortNoteId, longNoteId] = editingField.split("-");
        await handleSaveLongNotePara(
          parseInt(paraId),
          parseInt(shortNoteId),
          parseInt(longNoteId),
          newValue,
          newLinkValue
        );
      } else if (editingField.startsWith("judgmentTextPara-")) {
        const [_, paraId, textId] = editingField.split("-");
        await handleSaveJudgmentTextPara(
          parseInt(paraId),
          parseInt(textId),
          newValue
        );
      }

      setModalOpen(false);
      handleCancel();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
    setEditLinkValue("");
  };

  // Add this function near your other handlers (around line 230)
const handleRefresh = async () => {
  if (!localJudgmentData?.judgmentId) return;
  
  try {
    setSaving(true);
    const response = await fetch(`${API_BASE}/judgments/${localJudgmentData.judgmentId}`);
    if (response.ok) {
      const freshData = await response.json();
      setLocalJudgmentData(freshData);
      alert("✓ Judgment data refreshed!");
    }
  } catch (error) {
    console.error("Error refreshing:", error);
    alert("Failed to refresh data");
  } finally {
    setSaving(false);
  }
};


  // Save handlers
  const handleSaveJudgment = async (judgmentId, newValue) => {
    if (!judgmentId) {
      alert("Error: Judgment ID is missing");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/judgments/${judgmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judgmentCourtText:
            editingField === `judgment-courtText-${judgmentId}`
              ? newValue // ← Use newValue instead of editValue
              : localJudgmentData.judgmentCourtText,
          judgmentJudges:
            editingField === `judgment-judges-${judgmentId}`
              ? newValue // ← Use newValue
              : localJudgmentData.judgmentJudges,
          judgmentNoText:
            editingField === `judgment-noText-${judgmentId}`
              ? newValue // ← Use newValue
              : localJudgmentData.judgmentNoText,
          judgmentParties:
            editingField === `judgment-parties-${judgmentId}`
              ? newValue // ← Use newValue
              : localJudgmentData.judgmentParties,
          judgmentPetitionerCouncil:
            editingField === `judgment-petitionerCouncil-${judgmentId}`
              ? newValue // ← Use newValue
              : localJudgmentData.judgmentPetitionerCouncil,
          judgmentRespondentCouncil:
            editingField === `judgment-respondentCouncil-${judgmentId}`
              ? newValue // ← Use newValue
              : localJudgmentData.judgmentRespondentCouncil,
          judgmentOtherCounsel:
            editingField === `judgment-otherCounsel-${judgmentId}`
              ? newValue // ← Use newValue
              : localJudgmentData.judgmentOtherCounsel,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();

        console.log("🟢 Server response:", updatedData);
        console.log("🟢 Old localJudgmentData:", localJudgmentData);

        const newData = { ...localJudgmentData, ...updatedData };
        console.log('🟢 New merged data:', newData);


        setLocalJudgmentData({ ...localJudgmentData, ...updatedData });

        alert("✓ Judgment updated successfully!");
        handleCancel();
      } else {
        const errorText = await response.text();
        alert(`Failed to update judgment: ${errorText}`);
      }
    } catch (error) {
      console.error("Error updating judgment:", error);
      alert(`Error updating judgment: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShortNote = async (shortNoteId, newValue) => {
    if (!shortNoteId) {
      alert("Error: Short Note ID is missing");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/shortnote/${shortNoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortNoteText: newValue }),
      });

      if (response.ok) {
        console.log('🟢 Updating short note with newValue:', newValue);
  console.log('🟢 Old ShortNotes:', localJudgmentData.ShortNotes);

        const updatedShortNotes = localJudgmentData.ShortNotes.map((sn) =>
          sn.shortNoteId === shortNoteId
            ? { ...sn, shortNoteText: newValue }
            : sn
        );

        console.log('🟢 Updated ShortNotes:', updatedShortNotes);
        setLocalJudgmentData({
          ...localJudgmentData,
          ShortNotes: updatedShortNotes,
        });
        alert("✓ Short note updated successfully!");
        handleCancel();
      } else {
        const errorText = await response.text();
        alert(`Failed to update short note: ${errorText}`);
      }
    } catch (error) {
      console.error("Error updating short note:", error);
      alert(`Error updating short note: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLongNotePara = async (
    longNoteParaId,
    shortNoteId,
    longNoteId,
    newValue,
    newLinkValue
  ) => {
    if (!longNoteParaId) {
      alert("Error: Long Note Para ID is missing");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE}/longnote-para/${longNoteParaId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            longNoteParaText: newValue, // ← Use newValue instead of editValue
            longNoteParaLink: newLinkValue, // ← Use newLinkValue instead of editLinkValue
          }),
        }
      );

      if (response.ok) {
        const updatedShortNotes = localJudgmentData.ShortNotes.map((sn) => {
          if (sn.shortNoteId === shortNoteId) {
            const updatedLongNotes = sn.LongNotes.map((ln) => {
              if (ln.longNoteId === longNoteId) {
                const updatedParas = ln.LongNoteParas.map((lnp) =>
                  lnp.longNoteParaId === longNoteParaId
                    ? {
                        ...lnp,
                        longNoteParaText: newValue,
                        longNoteParaLink: newLinkValue,
                      }
                    : lnp
                );
                return { ...ln, LongNoteParas: updatedParas };
              }
              return ln;
            });
            return { ...sn, LongNotes: updatedLongNotes };
          }
          return sn;
        });
        setLocalJudgmentData({
          ...localJudgmentData,
          ShortNotes: updatedShortNotes,
        });
        alert("✓ Long note para updated successfully!");
        handleCancel();
      } else {
        const errorText = await response.text();
        alert(`Failed to update long note para: ${errorText}`);
      }
    } catch (error) {
      console.error("Error updating long note para:", error);
      alert(`Error updating long note para: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveJudgmentTextPara = async (
    paraId,
    judgmentTextId,
    newValue
  ) => {
    if (!paraId) {
      alert("Error: Paragraph ID is missing.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/judgment-text-para/${paraId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgementTextParaText: newValue }),
      });

      if (response.ok) {
        console.log('🟢 Updating para with newValue:', newValue);
  console.log('🟢 Old JudgmentTexts:', localJudgmentData.JudgmentTexts);
  
        const updatedJudgmentTexts = localJudgmentData.JudgmentTexts.map(
          (jt) => {
            if (jt.judgementTextId === judgmentTextId) {
              const updatedParas = jt.JudgmentTextParas.map((para) => {
                const currentParaId =
                  para.judgementTextParaId ||
                  para.judgmentTextParaId ||
                  para.id ||
                  para.paraId;
                return currentParaId === paraId
                  ? { ...para, judgementTextParaText: newValue }
                  : para;
              });
              return { ...jt, JudgmentTextParas: updatedParas };
            }
            return jt;
          }
        );

        console.log('🟢 Updated JudgmentTexts:', updatedJudgmentTexts);

        setLocalJudgmentData({
          ...localJudgmentData,
          JudgmentTexts: updatedJudgmentTexts,
        });
        alert("✓ Judgment text para updated successfully!");
        handleCancel();
      } else {
        const errorText = await response.text();
        alert(`Failed to update: ${errorText}`);
      }
    } catch (error) {
      console.error("Error updating judgment text para:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Status Badge (add before return statement)
  const StatusBadge = () => {
    if (!judgmentStatus)
      return (
        <div
          style={{
            padding: "8px 12px",
            background: "white",
            borderRadius: "8px",
            color: "#666",
            fontSize: "13px",
          }}
        >
          Loading...
        </div>
      );
    if (judgmentStatus === "error")
      return (
        <div
          style={{
            padding: "8px 12px",
            background: "white",
            borderRadius: "8px",
            color: "#ef4444",
            fontSize: "13px",
          }}
        >
          Error loading status
        </div>
      );

    const styles = {
      untouched: {
        color: "#9ca3af",
        bg: "#f3f4f6",
        icon: "⚪",
        label: "Untouched",
      },
      in_progress: {
        color: "#f59e0b",
        bg: "#fef3c7",
        icon: "🟡",
        label: "In Progress",
      },
      completed: {
        color: "#10b981",
        bg: "#d1fae5",
        icon: "✅",
        label: "Completed",
      },
    };

    const s = styles[judgmentStatus];

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 16px",
          backgroundColor: s.bg,
          borderRadius: "10px",
          border: `2px solid ${s.color}`,
          minWidth: "200px",
        }}
      >
        <span style={{ fontSize: "18px" }}>{s.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: s.color }}>
            {s.label}
          </div>
          {lastEditedAt && (
            <div
              style={{
                fontSize: "10px",
                color: "#6b7280",
                marginTop: "2px",
                whiteSpace: "nowrap",
              }}
            >
              {new Date(lastEditedAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        {judgmentStatus === "in_progress" && (
          <button
            onClick={() => {
              if (confirm("Mark as completed?")) {
                updateStatus("completed");
              }
            }}
            style={{
              padding: "6px 12px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#059669")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#10b981")
            }
          >
            ✓ Complete
          </button>
        )}
      </div>
    );
  };

  // Selection Mode Toggle Button
  const SelectionModeButton = () => (
    <div
      style={{
        position: "sticky",
        top: "10px",
        zIndex: 100,
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        marginBottom: "20px",
        padding: "10px",
        borderRadius: "8px",
      }}
    >
      <button
  onClick={handleRefresh}
  disabled={saving}
  style={{
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = "#2563eb";
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = "#3b82f6";
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
  }}
>
  {saving ? (
    <>
      <div
        style={{
          width: "16px",
          height: "16px",
          border: "2px solid white",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      Refreshing...
    </>
  ) : (
    <>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
      Refresh
    </>
  )}
</button>

      <button
        onClick={toggleSelectionMode}
        style={{
          padding: "10px 20px",
          backgroundColor: selectionMode ? "#c30010" : "#FF0000",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "500",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        }}
      >
        {selectionMode ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Exit Selection Mode
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Select & Merge Paras
          </>
        )}
      </button>

      {/* 👇 NEW DESELECT ALL BUTTON */}
      {selectionMode && selectedParas.length > 0 && (
        <button
          onClick={handleDeselectAll}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4b5563";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6b7280";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="1 9 1 4 6 4"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          Deselect All
        </button>
      )}

      {selectionMode && selectedParas.length >= 2 && (
        <button
          onClick={handleMergeParas}
          disabled={saving}
          style={{
            padding: "10px 20px",
            backgroundColor: saving ? "#9ca3af" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: "500",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }
          }}
        >
          {saving ? (
            <>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid white",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Merging...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
              </svg>
              Merge {selectedParas.length} Paras
            </>
          )}
        </button>
      )}

      {selectionMode && (
        <div
          style={{
            padding: "10px 15px",
            backgroundColor: "#f3f4f6",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#374151",
            fontWeight: "500",
          }}
        >
          {selectedParas.length} selected
        </div>
      )}
    </div>
  );


  const handleDeselectAll = () => {
    setSelectedParas([]);
    setSelectionType(null);
  };

  // Selection Checkbox Component
  // Selection Checkbox Component with ORDER NUMBER
  const SelectionCheckbox = ({ paraId, paraType }) => {
    const isSelected = selectedParas.includes(paraId);
    const selectionOrder = isSelected
      ? selectedParas.indexOf(paraId) + 1
      : null; // 1, 2, 3...

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleParaSelection(paraId, paraType);
        }}
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          width: "28px", // Slightly bigger for numbers
          height: "28px",
          borderRadius: "6px", // More rounded for better look
          border: isSelected
            ? "2px solidrgb(246, 92, 92)"
            : "2px solid #d1d5db",
          backgroundColor: isSelected ? "#c31010" : "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          zIndex: 10,
          fontWeight: "700", // Bold number
          fontSize: "14px", // Clear font size
          color: "white",
          boxShadow: isSelected ? "0 2px 6px rgba(139, 92, 246, 0.4)" : "none",
        }}
      >
        {isSelected && (
          <span
            style={{
              userSelect: "none",
              lineHeight: "1",
            }}
          >
            {selectionOrder}
          </span>
        )}
      </div>
    );
  };

  // Reusable Edit Button Component
  const EditButton = ({ onClick, fieldKey }) => (
    <button
      onClick={onClick}
      className={styles.editButton}
      style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        padding: "6px 12px",
        fontSize: "13px",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        opacity: hoveredField === fieldKey ? 1 : 0,
        transform:
          hoveredField === fieldKey ? "translateY(0)" : "translateY(-5px)",
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#2563eb";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#3b82f6";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      Edit
    </button>
  );

  // Action Buttons Component
  const ActionButtons = ({ onSave, onCancel, saving }) => (
    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          padding: "10px 20px",
          backgroundColor: saving ? "#9ca3af" : "#10b981",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: saving ? "not-allowed" : "pointer",
          fontWeight: "500",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        onMouseEnter={(e) => {
          if (!saving) {
            e.currentTarget.style.backgroundColor = "#059669";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
          }
        }}
        onMouseLeave={(e) => {
          if (!saving) {
            e.currentTarget.style.backgroundColor = "#10b981";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }
        }}
      >
        {saving ? (
          <>
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid white",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Saving...
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Save
          </>
        )}
      </button>
      <button
        onClick={onCancel}
        disabled={saving}
        style={{
          padding: "10px 20px",
          backgroundColor: "white",
          color: "#6b7280",
          border: "2px solid #e5e7eb",
          borderRadius: "6px",
          cursor: saving ? "not-allowed" : "pointer",
          fontWeight: "500",
          fontSize: "14px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!saving) {
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.backgroundColor = "#f9fafb";
          }
        }}
        onMouseLeave={(e) => {
          if (!saving) {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.backgroundColor = "white";
          }
        }}
      >
        Cancel
      </button>
    </div>
  );

  // Editable Container Component
  const EditableContainer = ({
    isEditing,
    fieldKey,
    onEdit,
    children,
    style = {},
    noPadding = false,
    paraId = null,
    paraType = null,
  }) => {
    const isHovered = hoveredField === fieldKey;
    const isSelected = paraId && selectedParas.includes(paraId);

    const handleContainerClick = (e) => {
      // Don't handle click if we're clicking inside a textarea or input
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
        return;
      }

      if (selectionMode && paraId && paraType) {
        handleParaSelection(paraId, paraType);
      }
    };

    return (
      <div
        onMouseEnter={() => !selectionMode && setHoveredField(fieldKey)}
        onMouseLeave={() => !selectionMode && setHoveredField(null)}
        onClick={handleContainerClick}
        style={{
          position: "relative",
          padding: isEditing ? "16px" : noPadding ? "4px" : "12px",
          paddingLeft:
            selectionMode && paraId
              ? "40px"
              : isEditing
              ? "16px"
              : noPadding
              ? "4px"
              : "12px",
          margin: "8px 0",
          borderRadius: "8px",
          backgroundColor: isEditing
            ? "#f0f9ff"
            : isSelected
            ? "#f1f5f9"
            : isHovered
            ? "#fef3c7"
            : "transparent",
          border: isEditing
            ? "2px solid #3b82f6"
            : isSelected
            ? "2px solid rgb(69, 83, 101) "
            : isHovered
            ? "2px solid #fbbf24"
            : "2px solid transparent",
          transition: "all 0.3s ease",
          boxShadow: isEditing
            ? "0 4px 12px rgba(59, 130, 246, 0.15)"
            : isSelected
            ? "0 4px 12px rgba(0, 0, 0, 0.2)"
            : isHovered
            ? "0 2px 8px rgba(251, 191, 36, 0.2)"
            : "none",
          cursor:
            selectionMode && paraId
              ? "pointer"
              : isHovered && !isEditing
              ? "pointer"
              : "default",
          ...style,
        }}
      >
        {selectionMode && paraId && paraType && (
          <SelectionCheckbox paraId={paraId} paraType={paraType} />
        )}
        {!isEditing && !selectionMode && (
          <EditButton onClick={onEdit} fieldKey={fieldKey} />
        )}
        {children}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = parseInt(dateString.substring(0, 2), 10);
    const monthIndex = parseInt(dateString.substring(2, 4), 10) - 1;
    const year = parseInt(dateString.substring(4), 10);

    const formattedDate = `${toOrdinal(day)} day of ${
      months[monthIndex]
    }, ${year}`;
    return formattedDate;
  };

  const toOrdinal = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const scrollToPara = (paraNo) => {
    const paraElement = paraRefs.current[paraNo];
    if (paraElement) {
      setTimeout(() => {
        paraElement.scrollIntoView({ behavior: "smooth", block: "center" });
        paraElement.classList.add(styles.pop);
        setTimeout(() => {
          paraElement.classList.remove(styles.pop);
        }, 1000);
      }, 0);
    }
  };

  const extractNumbersFromLink = (text) => {
    const regex = /\d+/g;
    const matches = text.match(regex);
    return matches ? matches.map(Number) : [];
  };

  const renderLongNoteParas = (
    longNoteParas,
    searchTerms,
    shortNoteId,
    longNoteId
  ) => {
    return longNoteParas.map((longNotePara) => {
      const { longNoteParaText, longNoteParaLink, longNoteParaId } =
        longNotePara;
      const isEditing = editingField === `longNotePara-${longNoteParaId}`;
      const fieldKey = `longNotePara-${longNoteParaId}`;

      const renderTextWithParaLinks = (text, paraLink) => {
        if (!paraLink || !text.includes(paraLink)) {
          return highlightText(text, searchTerms);
        }

        const parts = text.split(paraLink);
        const before = parts[0];
        const after = parts.slice(1).join(paraLink);

        const renderedLink = [];
        let currentIndex = 0;
        const paraRegex = /\d+[A-Za-z\-]*/g;
        let match;

        while ((match = paraRegex.exec(paraLink)) !== null) {
          const paraNumber = match[0];
          const start = match.index;
          const end = start + paraNumber.length;

          if (start > currentIndex) {
            renderedLink.push(paraLink.slice(currentIndex, start));
          }

          const numericParaNumber = paraNumber.match(/\d+/)[0];

          renderedLink.push(
            <a
              key={numericParaNumber + start}
              onClick={() => scrollToPara(numericParaNumber)}
              style={{
                color: "#104ef2",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {paraNumber}
            </a>
          );

          currentIndex = end;
        }

        if (currentIndex < paraLink.length) {
          renderedLink.push(paraLink.slice(currentIndex));
        }

        return (
          <>
            {highlightText(before, searchTerms)}
            {renderedLink}
            {highlightText(after, searchTerms)}
          </>
        );
      };

      return (
        <EditableContainer
          key={longNoteParaId}
          isEditing={isEditing}
          fieldKey={fieldKey}
          onEdit={() =>
            handleEdit(
              "longNotePara",
              `${longNoteParaId}-${shortNoteId}-${longNoteId}`, // ← Pass all 3 IDs as one string
              longNoteParaId,
              longNoteParaText,
              longNoteParaLink
            )
          }
          paraId={longNoteParaId}
          paraType="longNotePara"
        >
          {isEditing ? (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#374151",
                  fontSize: "14px",
                }}
              >
                Long Note Para Text:
              </label>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "12px",
                  marginBottom: "12px",
                  fontSize: "14px",
                  borderRadius: "6px",
                  border: "2px solid #e5e7eb",
                  fontFamily: "inherit",
                  lineHeight: "1.6",
                  resize: "vertical",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#374151",
                  fontSize: "14px",
                }}
              >
                Para Link (optional):
              </label>
              <input
                type="text"
                value={editLinkValue}
                onChange={(e) => setEditLinkValue(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  marginBottom: "12px",
                  fontSize: "14px",
                  borderRadius: "6px",
                  border: "2px solid #e5e7eb",
                  transition: "border-color 0.2s ease",
                }}
                placeholder="e.g., Para 23, 45"
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <ActionButtons
                onSave={() =>
                  handleSaveLongNotePara(
                    longNoteParaId,
                    shortNoteId,
                    longNoteId
                  )
                }
                onCancel={handleCancel}
                saving={saving}
              />
            </div>
          ) : (
            <p style={{ margin: "0", lineHeight: "1.8" }}>
              {renderTextWithParaLinks(longNoteParaText, longNoteParaLink)}
            </p>
          )}
        </EditableContainer>
      );
    });
  };

  const extractAndRenderLongNoteLinks = (text) => {
    const regex =
      /(Para\s*\d+(?:\s*-\s*\d+)?(?:\s*(?:,|and)\s*Para\s*\d+(?:\s*-\s*\d+)?)*|\[Para\s*\d+(?:\s*-\s*\d+)?(?:,\s*\d+(?:\s*-\s*\d+)?)*\]|\(Para\s*\d+(?:\s*-\s*\d+)?(?:\s*(?:,|and)\s*Para\s*\d+(?:\s*-\s*\d+)?)*\))/gi;

    let match;
    const elements = [];
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const startIndex = match.index;
      const endIndex = regex.lastIndex;

      const after = text.slice(endIndex).trim();
      const isAtEnd = after === "" || /^[).,\]]*$/.test(after);

      if (!isAtEnd) continue;

      elements.push(text.substring(lastIndex, startIndex));

      const paraNos = [];
      const numberMatches = [...fullMatch.matchAll(/\d+/g)];
      numberMatches.forEach((m) => {
        const before = fullMatch.slice(Math.max(0, m.index - 3), m.index);
        if (before.includes("-") || before.includes("–")) return;
        paraNos.push(m[0]);
      });

      elements.push(
        <a
          key={`${startIndex}`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            paraNos.forEach((paraNo) => scrollToPara(paraNo));
          }}
        >
          {fullMatch}
        </a>
      );

      lastIndex = endIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements;
  };

  const highlightText = (text, searchTerms) => {
    if (!text || !searchTerms.length) return text;

    const regexPattern = searchTerms
      .map((term) => `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`)
      .join("|");

    const regex = new RegExp(`(${regexPattern})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  const isHtml = (text) => /<\/?[a-z][\s\S]*>/i.test(text);

  const addInlineStylesToTable = (htmlContent) => {
    const styledHtmlContent = htmlContent
      .replace(
        /<table/g,
        '<table style="width:auto; max-width:100%; table-layout:fixed; margin:0 auto; border-collapse:collapse;"'
      )
      .replace(
        /<th/g,
        '<th style="padding:10px; border:1px solid #000; text-align:left; background-color:#f8f8f8;"'
      )
      .replace(
        /<td/g,
        '<td style="padding:10px; border:1px solid #000; text-align:left; word-wrap:break-word;"'
      );

    return styledHtmlContent;
  };

  if (!localJudgmentData) {
    return <p>No judgment data available.</p>;
  }

  const handleCitationClick = (citation) => {
    console.log("Clicked Citation", citation);
    setReferredCitation(citation);
  };

  return (
    <>
      {/* 👇 ADD FLOATING STATUS BADGE HERE */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderRadius: "10px",
        }}
      >
        <StatusBadge />
      </div>
      <div className={styles.scrollableText}>
        <style>
          {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
        </style>

        {/* Selection Mode Button */}
        <SelectionModeButton />

        <>
          {/* Header Section */}
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3 style={{ lineHeight: "1.5", margin: "0", width: "100%" }}>
              <>
                {localJudgmentData.onlinecitation?.newCitation ||
                  "Citation Not Available"}
                <br />
                {localJudgmentData.judgmentCitation &&
                  localJudgmentData.onlinecitation?.newCitation?.toLowerCase() !==
                    localJudgmentData.judgmentCitation.toLowerCase() &&
                  !localJudgmentData.judgmentCitation
                    .toLowerCase()
                    .includes("lj") &&
                  highlightText(
                    localJudgmentData.judgmentCitation,
                    searchTerms
                  )}
              </>

              {/* Court Text - Editable */}
              <EditableContainer
                isEditing={
                  editingField ===
                  `judgment-courtText-${localJudgmentData.judgmentId}`
                }
                fieldKey={`judgment-courtText-${localJudgmentData.judgmentId}`}
                onEdit={() =>
                  handleEdit(
                    "judgment-courtText",
                    localJudgmentData.judgmentId,
                    localJudgmentData.judgmentCourtText
                  )
                }
                style={{ display: "inline-block", width: "100%" }}
              >
                {editingField ===
                `judgment-courtText-${localJudgmentData.judgmentId}` ? (
                  <div>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{
                        width: "90%",
                        minHeight: "80px",
                        padding: "12px",
                        fontSize: "14px",
                        borderRadius: "6px",
                        border: "2px solid #e5e7eb",
                        fontFamily: "inherit",
                        lineHeight: "1.6",
                        resize: "vertical",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                    <ActionButtons
                      onSave={() =>
                        handleSaveJudgment(localJudgmentData.judgmentId)
                      }
                      onCancel={handleCancel}
                      saving={saving}
                    />
                  </div>
                ) : (
                  <span style={{ fontWeight: "normal", display: "block" }}>
                    <br />
                    {highlightText(
                      localJudgmentData.judgmentCourtText,
                      searchTerms
                    )}
                  </span>
                )}
              </EditableContainer>

              {/* Judges - Editable */}
              <EditableContainer
                isEditing={
                  editingField ===
                  `judgment-judges-${localJudgmentData.judgmentId}`
                }
                fieldKey={`judgment-judges-${localJudgmentData.judgmentId}`}
                onEdit={() =>
                  handleEdit(
                    "judgment-judges",
                    localJudgmentData.judgmentId,
                    localJudgmentData.judgmentJudges
                  )
                }
                style={{ display: "inline-block", width: "100%" }}
              >
                {editingField ===
                `judgment-judges-${localJudgmentData.judgmentId}` ? (
                  <div>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{
                        width: "90%",
                        minHeight: "60px",
                        padding: "12px",
                        fontSize: "14px",
                        borderRadius: "6px",
                        border: "2px solid #e5e7eb",
                        fontFamily: "inherit",
                        lineHeight: "1.6",
                        resize: "vertical",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                    <ActionButtons
                      onSave={() =>
                        handleSaveJudgment(localJudgmentData.judgmentId)
                      }
                      onCancel={handleCancel}
                      saving={saving}
                    />
                  </div>
                ) : (
                  <>
                    {highlightText(
                      localJudgmentData.judgmentJudges.toUpperCase(),
                      searchTerms
                    )}
                    <br />
                    {localJudgmentData.judgmentNo ||
                      formatDate(localJudgmentData.judgmentDOJ)}
                  </>
                )}
              </EditableContainer>
            </h3>

            {/* Judgment No Text - Editable */}
            <EditableContainer
              isEditing={
                editingField ===
                `judgment-noText-${localJudgmentData.judgmentId}`
              }
              fieldKey={`judgment-noText-${localJudgmentData.judgmentId}`}
              onEdit={() =>
                handleEdit(
                  "judgment-noText",
                  localJudgmentData.judgmentId,
                  localJudgmentData.judgmentNoText
                )
              }
              style={{ width: "100%" }}
            >
              {editingField ===
              `judgment-noText-${localJudgmentData.judgmentId}` ? (
                <div>
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{
                      width: "90%",
                      minHeight: "60px",
                      padding: "12px",
                      fontSize: "14px",
                      borderRadius: "6px",
                      border: "2px solid #e5e7eb",
                      fontFamily: "inherit",
                      lineHeight: "1.6",
                      resize: "vertical",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                  <ActionButtons
                    onSave={() =>
                      handleSaveJudgment(localJudgmentData.judgmentId)
                    }
                    onCancel={handleCancel}
                    saving={saving}
                  />
                </div>
              ) : (
                <span>
                  {highlightText(localJudgmentData.judgmentNoText, searchTerms)}
                </span>
              )}
            </EditableContainer>

            {/* Judgment Parties - Editable */}
            <EditableContainer
              isEditing={
                editingField ===
                `judgment-parties-${localJudgmentData.judgmentId}`
              }
              fieldKey={`judgment-parties-${localJudgmentData.judgmentId}`}
              onEdit={() =>
                handleEdit(
                  "judgment-parties",
                  localJudgmentData.judgmentId,
                  localJudgmentData.judgmentParties
                )
              }
              style={{ width: "100%" }}
            >
              {editingField ===
              `judgment-parties-${localJudgmentData.judgmentId}` ? (
                <div>
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{
                      width: "90%",
                      minHeight: "80px",
                      padding: "12px",
                      fontSize: "14px",
                      borderRadius: "6px",
                      border: "2px solid #e5e7eb",
                      fontFamily: "inherit",
                      lineHeight: "1.6",
                      resize: "vertical",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                  <ActionButtons
                    onSave={() =>
                      handleSaveJudgment(localJudgmentData.judgmentId)
                    }
                    onCancel={handleCancel}
                    saving={saving}
                  />
                </div>
              ) : (
                <span style={{ fontWeight: "normal" }}>
                  {highlightText(
                    localJudgmentData.judgmentParties,
                    searchTerms
                  )}
                </span>
              )}
            </EditableContainer>
          </div>

          {/* Short Notes Section */}
          <div>
            {localJudgmentData.ShortNotes &&
            localJudgmentData.ShortNotes.length > 0
              ? localJudgmentData.ShortNotes.map((shortNote) => (
                  <div
                    key={shortNote.shortNoteId}
                    style={{ marginBottom: "20px" }}
                  >
                    <EditableContainer
                      isEditing={
                        editingField === `shortNote-${shortNote.shortNoteId}`
                      }
                      fieldKey={`shortNote-${shortNote.shortNoteId}`}
                      onEdit={() =>
                        handleEdit(
                          "shortNote",
                          shortNote.shortNoteId,
                          shortNote.shortNoteText
                        )
                      }
                    >
                      {editingField === `shortNote-${shortNote.shortNoteId}` ? (
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontWeight: "600",
                              color: "#374151",
                              fontSize: "14px",
                            }}
                          >
                            Short Note Text:
                          </label>
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{
                              width: "100%",
                              minHeight: "120px",
                              padding: "12px",
                              marginBottom: "12px",
                              fontSize: "14px",
                              borderRadius: "6px",
                              border: "2px solid #e5e7eb",
                              fontFamily: "inherit",
                              lineHeight: "1.6",
                              resize: "vertical",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#3b82f6")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e5e7eb")
                            }
                          />
                          <ActionButtons
                            onSave={() =>
                              handleSaveShortNote(shortNote.shortNoteId)
                            }
                            onCancel={handleCancel}
                            saving={saving}
                          />
                        </div>
                      ) : (
                        <h4 style={{ margin: "0" }}>
                          {extractAndRenderLongNoteLinks(
                            shortNote.shortNoteText
                          ).map((element, index) =>
                            React.isValidElement(element) ? (
                              <React.Fragment key={index}>
                                {element}
                              </React.Fragment>
                            ) : (
                              <span key={index}>
                                {highlightText(element, searchTerms)}
                              </span>
                            )
                          )}
                        </h4>
                      )}
                    </EditableContainer>

                    {shortNote.LongNotes &&
                      shortNote.LongNotes.map((longNote) => (
                        <React.Fragment key={longNote.longNoteId}>
                          {renderLongNoteParas(
                            longNote.LongNoteParas,
                            searchTerms,
                            shortNote.shortNoteId,
                            longNote.longNoteId
                          )}
                        </React.Fragment>
                      ))}
                  </div>
                ))
              : ""}
          </div>

          {/* Counsels Section */}
          <div>
            {localJudgmentData &&
              localJudgmentData.judgmentPetitionerCouncil && (
                <div>
                  <EditableContainer
                    isEditing={
                      editingField ===
                      `judgment-petitionerCouncil-${localJudgmentData.judgmentId}`
                    }
                    fieldKey={`judgment-petitionerCouncil-${localJudgmentData.judgmentId}`}
                    onEdit={() =>
                      handleEdit(
                        "judgment-petitionerCouncil",
                        localJudgmentData.judgmentId,
                        localJudgmentData.judgmentPetitionerCouncil
                      )
                    }
                  >
                    {editingField ===
                    `judgment-petitionerCouncil-${localJudgmentData.judgmentId}` ? (
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#374151",
                            fontSize: "14px",
                          }}
                        >
                          Petitioner Counsel:
                        </label>
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          style={{
                            width: "100%",
                            minHeight: "80px",
                            padding: "12px",
                            marginBottom: "12px",
                            fontSize: "14px",
                            borderRadius: "6px",
                            border: "2px solid #e5e7eb",
                            fontFamily: "inherit",
                            lineHeight: "1.6",
                            resize: "vertical",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#3b82f6")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "#e5e7eb")
                          }
                        />
                        <ActionButtons
                          onSave={() =>
                            handleSaveJudgment(localJudgmentData.judgmentId)
                          }
                          onCancel={handleCancel}
                          saving={saving}
                        />
                      </div>
                    ) : (
                      <p style={{ margin: "0" }}>
                        <strong>Petitioner Counsel:</strong>{" "}
                        {highlightText(
                          localJudgmentData.judgmentPetitionerCouncil,
                          searchTerms
                        )}
                      </p>
                    )}
                  </EditableContainer>

                  {localJudgmentData.judgmentRespondentCouncil && (
                    <EditableContainer
                      isEditing={
                        editingField ===
                        `judgment-respondentCouncil-${localJudgmentData.judgmentId}`
                      }
                      fieldKey={`judgment-respondentCouncil-${localJudgmentData.judgmentId}`}
                      onEdit={() =>
                        handleEdit(
                          "judgment-respondentCouncil",
                          localJudgmentData.judgmentId,
                          localJudgmentData.judgmentRespondentCouncil
                        )
                      }
                    >
                      {editingField ===
                      `judgment-respondentCouncil-${localJudgmentData.judgmentId}` ? (
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontWeight: "600",
                              color: "#374151",
                              fontSize: "14px",
                            }}
                          >
                            Respondent Counsel:
                          </label>
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{
                              width: "100%",
                              minHeight: "80px",
                              padding: "12px",
                              marginBottom: "12px",
                              fontSize: "14px",
                              borderRadius: "6px",
                              border: "2px solid #e5e7eb",
                              fontFamily: "inherit",
                              lineHeight: "1.6",
                              resize: "vertical",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#3b82f6")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e5e7eb")
                            }
                          />
                          <ActionButtons
                            onSave={() =>
                              handleSaveJudgment(localJudgmentData.judgmentId)
                            }
                            onCancel={handleCancel}
                            saving={saving}
                          />
                        </div>
                      ) : (
                        <p style={{ margin: "0" }}>
                          <strong>Respondent Counsel:</strong>{" "}
                          {highlightText(
                            localJudgmentData.judgmentRespondentCouncil,
                            searchTerms
                          )}
                        </p>
                      )}
                    </EditableContainer>
                  )}

                  {localJudgmentData.judgmentOtherCounsel && (
                    <EditableContainer
                      isEditing={
                        editingField ===
                        `judgment-otherCounsel-${localJudgmentData.judgmentId}`
                      }
                      fieldKey={`judgment-otherCounsel-${localJudgmentData.judgmentId}`}
                      onEdit={() =>
                        handleEdit(
                          "judgment-otherCounsel",
                          localJudgmentData.judgmentId,
                          localJudgmentData.judgmentOtherCounsel
                        )
                      }
                    >
                      {editingField ===
                      `judgment-otherCounsel-${localJudgmentData.judgmentId}` ? (
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontWeight: "600",
                              color: "#374151",
                              fontSize: "14px",
                            }}
                          >
                            Other Counsel:
                          </label>
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{
                              width: "100%",
                              minHeight: "80px",
                              padding: "12px",
                              marginBottom: "12px",
                              fontSize: "14px",
                              borderRadius: "6px",
                              border: "2px solid #e5e7eb",
                              fontFamily: "inherit",
                              lineHeight: "1.6",
                              resize: "vertical",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "#3b82f6")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "#e5e7eb")
                            }
                          />
                          <ActionButtons
                            onSave={() =>
                              handleSaveJudgment(localJudgmentData.judgmentId)
                            }
                            onCancel={handleCancel}
                            saving={saving}
                          />
                        </div>
                      ) : (
                        <p style={{ margin: "0" }}>
                          <strong>Other Counsel:</strong>{" "}
                          {highlightText(
                            localJudgmentData.judgmentOtherCounsel,
                            searchTerms
                          )}
                        </p>
                      )}
                    </EditableContainer>
                  )}
                </div>
              )}
          </div>

          {/* Cases Cited Section */}
          <div>
            {localJudgmentData && localJudgmentData.JudgmentTexts
              ? localJudgmentData.JudgmentTexts.map((text) => (
                  <div key={text.judgementTextId}>
                    <p>
                      {highlightText(text.judgementTextParaText, searchTerms)}
                    </p>
                    {text.judgmentsCiteds &&
                      text.judgmentsCiteds.length > 0 && (
                        <div style={{ textAlign: "left" }}>
                          <h4>Cases Cited:</h4>
                          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                            {text.judgmentsCiteds.map((citation, index) => (
                              <li key={index}>
                                {highlightText(
                                  citation.judgmentsCitedParties,
                                  searchTerms
                                )}
                                {highlightText(
                                  citation.judgmentsCitedParties,
                                  searchTerms
                                ) && ", "}

                                {citation.judgmentsCitedRefferedCitation &&
                                  (() => {
                                    const parts =
                                      citation.judgmentsCitedRefferedCitation
                                        .split("=")
                                        .map((p) => p.trim());

                                    if (parts.length === 2) {
                                      return (
                                        <>
                                          <a
                                            href="#"
                                            onClick={() =>
                                              handleCitationClick(parts[0])
                                            }
                                          >
                                            {highlightText(
                                              parts[0],
                                              searchTerms
                                            )}
                                          </a>
                                          <span style={{ margin: "0 5px" }}>
                                            {" "}
                                            ={" "}
                                          </span>
                                          <a
                                            href="#"
                                            onClick={() =>
                                              handleCitationClick(parts[1])
                                            }
                                          >
                                            {highlightText(
                                              parts[1],
                                              searchTerms
                                            )}
                                          </a>
                                        </>
                                      );
                                    }

                                    return (
                                      <a
                                        href="#"
                                        onClick={() =>
                                          handleCitationClick(
                                            citation.judgmentsCitedRefferedCitation
                                          )
                                        }
                                      >
                                        {highlightText(
                                          citation.judgmentsCitedRefferedCitation,
                                          searchTerms
                                        )}
                                      </a>
                                    );
                                  })()}

                                {citation.judgmentsCitedEqualCitation && (
                                  <>
                                    <span style={{ margin: "0 5px" }}> = </span>
                                    {highlightText(
                                      citation.judgmentsCitedEqualCitation,
                                      searchTerms
                                    )}
                                  </>
                                )}

                                {citation.judgmentsCitedParaLink && (
                                  <>
                                    {" ("}
                                    {extractNumbersFromLink(
                                      citation.judgmentsCitedParaLink
                                    ).map((paraNo, idx) => (
                                      <React.Fragment key={`${index}_${idx}`}>
                                        <a
                                          href="#"
                                          onClick={() => scrollToPara(paraNo)}
                                        >
                                          {`[Para ${paraNo}]`}
                                        </a>
                                        {idx <
                                          extractNumbersFromLink(
                                            citation.judgmentsCitedParaLink
                                          ).length -
                                            1 && ", "}
                                      </React.Fragment>
                                    ))}
                                    {")"}
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                ))
              : " "}
          </div>

          {/* Judgment Text Paras - WITH SELECTION */}
          <div>
            <h3>JUDGMENT</h3>
            {localJudgmentData.JudgmentTexts?.length > 0 ? (
              localJudgmentData.JudgmentTexts.map((text) =>
                text.JudgmentTextParas?.length > 0 ? (
                  text.JudgmentTextParas.map((para, paraIndex) => {
                    const paraId =
                      para.judgementTextParaId ||
                      para.judgmentTextParaId ||
                      para.id ||
                      para.paraId;
                    const isEditing =
                      editingField === `judgmentTextPara-${paraId}`;
                    const fieldKey = `judgmentTextPara-${paraId}`;

                    return (
                      <EditableContainer
                        key={paraId || `para-${paraIndex}`}
                        isEditing={isEditing}
                        fieldKey={fieldKey}
                        onEdit={() => {
                          if (!paraId) {
                            alert("Para ID is missing! Cannot edit.");
                            return;
                          }
                          handleEdit(
                            "judgmentTextPara",
                            `${paraId}-${text.judgementTextId}`, // ← Pass both IDs as one string,
                            para.judgementTextParaText
                          );
                        }}
                        paraId={paraId}
                        paraType="judgmentTextPara"
                        style={{
                          paddingLeft:
                            para.judgementTextParaType === "Quote"
                              ? "50px"
                              : para.judgementTextParaType === "SubPara"
                              ? "40px"
                              : "12px",
                        }}
                        noPadding={!isEditing}
                      >
                        <div
                          ref={(el) =>
                            (paraRefs.current[para.judgementTextParaNo] = el)
                          }
                        >
                          {isEditing ? (
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontWeight: "600",
                                  color: "#374151",
                                  fontSize: "14px",
                                }}
                              >
                                Judgment Text Para:
                              </label>
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                style={{
                                  width: "100%",
                                  minHeight: "150px",
                                  padding: "12px",
                                  marginBottom: "12px",
                                  fontSize: "14px",
                                  borderRadius: "6px",
                                  border: "2px solid #e5e7eb",
                                  fontFamily: "inherit",
                                  lineHeight: "1.6",
                                  resize: "vertical",
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderColor = "#3b82f6")
                                }
                                onBlur={(e) =>
                                  (e.target.style.borderColor = "#e5e7eb")
                                }
                              />
                              <ActionButtons
                                onSave={() =>
                                  handleSaveJudgmentTextPara(
                                    paraId,
                                    text.judgementTextId
                                  )
                                }
                                onCancel={handleCancel}
                                saving={saving}
                              />
                            </div>
                          ) : (
                            <>
                              {isHtml(para.judgementTextParaText) ? (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: addInlineStylesToTable(
                                      para.judgementTextParaText
                                    ),
                                  }}
                                />
                              ) : (
                                <p
                                  style={{
                                    fontStyle:
                                      para.judgementTextParaType === "Quote"
                                        ? "normal"
                                        : "normal",
                                    margin: 0,
                                    padding: 0,
                                    lineHeight: "1.8",
                                  }}
                                >
                                  {highlightText(
                                    para.judgementTextParaText,
                                    searchTerms
                                  )}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </EditableContainer>
                    );
                  })
                ) : (
                  <p>No judgment data available.</p>
                )
              )
            ) : (
              <p>No judgment data available.</p>
            )}
          </div>
        </>
      </div>

      {/* Edit Modal */}
      <IsolatedEditModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          handleCancel();
        }}
        title={modalTitle}
        initialValue={editValue}
        initialLink={editLinkValue}
        hasLinkField={modalHasLink}
        onSave={handleModalSave}
        saving={saving}
      />
    </>
  );
};

export default JudgmentContent;
