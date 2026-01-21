import React, { useState, useEffect } from "react";
import styles from "./SidePanel.module.css";
import HighlightWords from "react-highlight-words";
import { frontendCache } from "../../utils/cache.js";
import api from "../../axios";

const SidePanel = ({
  setResults,
  setJudgmentCount,
  setError,
  setSearchTerms,
  onSearch,
  fullCitation,
  setFullCitation,
  onClear,
  setIsLoading,
  onSearchContextChange,
}) => {
  const [legislationName, setLegislationName] = useState("");
  const [subsection, setSubsection] = useState("");
  const [topic, setTopicName] = useState("");
  const [year, setYear] = useState("");
  const [volume, setVolume] = useState("");
  const [publicationName, setPublicationName] = useState("");
  const [pageNo, setPageNo] = useState("");
  const [nominal, setNominal] = useState("");
  const [nominals, setNominals] = useState([]);
  const [caseType, setCaseType] = useState("");
  const [caseNo, setCaseNo] = useState("");
  const [caseYear, setCaseYear] = useState("");
  const [legislationNames, setLegislationNames] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [topics, setTopics] = useState([]);
  const [judges, setJudges] = useState([]);
  const [judgeName, setJudgeName] = useState("");
  const [advocates, setAdvocates] = useState([]);
  const [advocateName, setAdvocateName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [subsectionName, setSubsectionName] = useState("");
  const [openIndex, setOpenIndex] = useState(0);
  const [section, setSection] = useState("");
  const [judge, setJudge] = useState("");
  const [advocate, setAdvocate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [court, setCourt] = useState("");
  const [publication, setPublication] = useState("");
  const [acts, setActs] = useState([]);
  const [query, setQuery] = useState("");
  const [caseNos, setCaseNos] = useState([]);
  const [filteredCaseNos, setFilteredCaseNos] = useState([]);
  const [caseInfo, setCaseInfo] = useState([]);
  const [filteredCaseInfo, setFilteredCaseInfo] = useState([]);
  const [sectionterm, setsectionterm] = useState("");
  const [caseinfo, setCaseinfo] = useState(""); // Added from code 1
  const [caseNumber, setCaseNumber] = useState(""); // Added from code 1
  const [citations, setCitations] = useState(""); // Added from code 1
  const [filteredCitations, setFilteredCitations] = useState([]); // Added from code 1
  const [equals, setEquals] = useState([]); // Added from code 1
  const [equivalents, setEquivalents] = useState([]); // Added from code 1
  const [filteredEquivalents, setFilteredEquivalents] = useState([]); // Added from code 1
  const [citation, setCitation] = useState("");
  const [completeCitation, setCompleteCitation] = useState("");
  const [publications, setPublications] = useState([]);
  // States for Equivalent Index
  const [equivalentYear, setEquivalentYear] = useState("");
  const [equivalentVolume, setEquivalentVolume] = useState("");
  const [equivalentPageNo, setEquivalentPageNo] = useState("");
  const [equivalentPublicationName, setEquivalentPublicationName] =
    useState("ALL");
  const [completeEquivalentCitation, setCompleteEquivalentCitation] =
    useState("");

  //pad serch items
  const [currentSearchContext, setCurrentSearchContext] = useState({});
  const [currentSearchType, setCurrentSearchType] = useState("");

  //funtions for pad search
  // Function to format search context details
  const formatSearchContext = (searchType, searchData) => {
    const contexts = {
      "SUBJECT INDEX": {
        act: searchData.legislationName || "",
        section: searchData.section || "",
        subsection: searchData.subsection || "",
      },
      "TOPIC INDEX": {
        topic: searchData.topic || "",
      },
      "CITATION INDEX": {
        year: searchData.year || "",
        volume: searchData.volume || "",
        publication: searchData.publicationName || "",
        pageNo: searchData.pageNo || "",
        completeCitation: searchData.completeCitation || "",
      },
      "NOMINAL INDEX": {
        nominal: searchData.nominal || "",
      },
      "CASE NO INDEX": {
        caseType: searchData.caseinfo || "",
        caseNumber: searchData.caseNumber || "",
        caseYear: searchData.caseYear || "",
      },
      "JUDGE INDEX": {
        judge: searchData.judge || "",
      },
      "ADVOCATE INDEX": {
        advocateName: searchData.advocateName || "",
      },
      "EQUIVALENT INDEX": {
        year: searchData.equivalentYear || "",
        volume: searchData.equivalentVolume || "",
        publication: searchData.equivalentPublicationName || "",
        pageNo: searchData.equivalentPageNo || "",
        completeCitation: searchData.completeEquivalentCitation || "",
      },
    };
    return contexts[searchType] || {};
  };
  // Function to create search context object
  const createSearchContext = (searchType, searchData) => {
    const searchContext = {
      type: searchType,
      details: formatSearchContext(searchType, searchData),
      timestamp: new Date().toISOString(),
      displayText: generateDisplayText(searchType, searchData),
    };

    setCurrentSearchContext(searchContext);

    // Pass to parent component
    if (onSearchContextChange) {
      onSearchContextChange(searchContext);
    }

    return searchContext;
  };

  // Function to generate display text for search context
  const generateDisplayText = (searchType, searchData) => {
    const filters = [];

    switch (searchType) {
      case "SUBJECT INDEX":
        if (searchData.legislationName)
          filters.push(` ${searchData.legislationName}`);
        if (searchData.section) filters.push(`, ${searchData.section}`);
        if (searchData.subsection) filters.push(`, ${searchData.subsection}`);
        break;
      case "TOPIC INDEX":
        if (searchData.topic) filters.push(`Topic: ${searchData.topic}`);
        break;
      case "CITATION INDEX":
        if (searchData.year) filters.push(`Year: ${searchData.year}`);
        if (searchData.volume) filters.push(`Volume: ${searchData.volume}`);
        if (searchData.publicationName && searchData.publicationName !== "ALL")
          filters.push(`Publication: ${searchData.publicationName}`);
        if (searchData.pageNo) filters.push(`Page: ${searchData.pageNo}`);
        if (searchData.completeCitation)
          filters.push(`Citation: ${searchData.completeCitation}`);
        break;
      case "NOMINAL INDEX":
        if (searchData.nominal) filters.push(`Parties ${searchData.nominal}`);
        break;
      case "CASE NO INDEX":
        if (searchData.caseinfo)
          filters.push(`Case Type: ${searchData.caseinfo}`);
        if (searchData.caseNumber)
          filters.push(`Case No: ${searchData.caseNumber}`);
        if (searchData.caseYear) filters.push(`Year: ${searchData.caseYear}`);
        break;
      case "JUDGE INDEX":
        if (searchData.judge)
          filters.push(`Hon'ble Justice ${searchData.judge}`);
        break;
      case "ADVOCATE INDEX":
        if (searchData.advocateName)
          filters.push(`Advocate ${searchData.advocateName}`);
        break;
      case "EQUIVALENT INDEX":
        if (searchData.equivalentYear)
          filters.push(`Year: ${searchData.equivalentYear}`);
        if (searchData.equivalentVolume)
          filters.push(`Volume: ${searchData.equivalentVolume}`);
        if (
          searchData.equivalentPublicationName &&
          searchData.equivalentPublicationName !== "ALL"
        )
          filters.push(`Publication: ${searchData.equivalentPublicationName}`);
        if (searchData.equivalentPageNo)
          filters.push(`Page: ${searchData.equivalentPageNo}`);
        if (searchData.completeEquivalentCitation)
          filters.push(`Citation: ${searchData.completeEquivalentCitation}`);
        break;
      default:
        break;
    }

    return filters.length > 0 ? filters.join(", ") : "No search criteria";
  };

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);

      // Create search context
      createSearchContext("SUBJECT INDEX", {
        legislationName,
        section,
        subsection,
      });

      const response = await api.get("/api/uat/search", {
        params: {
          legislationName,
          section,
          subsection,
        },
      });

      const data = response.data;
      const uniqueResults = Array.from(
        new Set(data.map((result) => result.judgmentId))
      ).map((judgmentId) =>
        data.find((result) => result.judgmentId === judgmentId)
      );
      setResults(uniqueResults);
      setJudgmentCount(uniqueResults.length);

      const sectionHighlight = (text) => {
        return text.replace(/[()]/g, "\\$&").split("|").join("");
      };

      // Add this to store search terms for highlighting
      setSearchTerms(
        [
          legislationName,
          sectionHighlight(section), // Apply custom highlighting to the section term
          subsection,
        ].filter((term) => term)
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      setResults([]);
      setJudgmentCount(0);
    }
  };

  //fetching DropDowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Check cache first
        const cacheKey = "dropdown-data";
        const cachedData = frontendCache.get(cacheKey);

        if (cachedData) {
          setLegislationNames(cachedData.legislationNames);
          setTopics(cachedData.topics);
          setJudges(cachedData.judges);
          setAdvocates(cachedData.advocates);
          setNominals(cachedData.nominals);
          setCaseNos(cachedData.caseNos);
          setCitations(cachedData.citations);
          setEquivalents(cachedData.equivalents);
          return;
        }

        // No cache, fetch fresh data
        const response = await api.get("/api/uat/dropdown-data-cache");
        const data = response.data;

        // Set data in state
        setLegislationNames(data.legislationNames);
        setTopics(data.topics);
        setJudges(data.judges);
        setAdvocates(data.advocates);
        setNominals(data.nominals);
        setCaseNos(data.caseNos);
        setCitations(data.citations);
        setEquivalents(data.equivalents);

        // Cache the data
        frontendCache.set(cacheKey, data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleTopicSearch = async () => {
    try {
      setIsLoading(true);
      createSearchContext("TOPIC INDEX", { topic });

      const response = await api.get("/api/uat/searchByTopic", {
        params: { topic },
      });

      const data = response.data;

      if (!data || data.error) {
        console.error("Error in response data:", data.error);
        setJudgmentData(null); // Prevent setting bad data
        toast.error(`Error: ${error.message}`);

        return;
      }

      const uniqueResults = Array.from(
        new Set(data.map((result) => result.judgmentId))
      ).map((judgmentId) =>
        data.find((result) => result.judgmentId === judgmentId)
      );
      setResults(uniqueResults);
      setJudgmentCount(uniqueResults.length);
      // console.log("Search results:", data);

      // Add this to store search terms for highlighting
      setSearchTerms([topic].filter((term) => term));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      setResults([]);
      setJudgmentCount(0);
    }
  };

  const handleNominalSearch = async () => {
    try {
      setIsLoading(true);
      const nominalValue = nominal || "";
      createSearchContext("NOMINAL INDEX", { nominal: nominalValue });

      // Use Axios instance
      const response = await api.get(`/api/searchByNominal`, {
        params: { nominal: nominalValue },
      });

      const data = response.data;

      if (!data || data.error) {
        console.error("Error in response data:", data.error);
        setJudgmentData(null);
        toast.error(`Error: ${data?.error || "Unknown error"}`);
        return;
      }

      // Deduplicate results by judgmentId
      const uniqueResults = Array.from(
        new Set(data.map((result) => result.judgmentId))
      ).map((judgmentId) =>
        data.find((result) => result.judgmentId === judgmentId)
      );

      setResults(uniqueResults);
      setJudgmentCount(uniqueResults.length);

      // Store search terms for highlighting
      setSearchTerms([nominalValue].filter((term) => term));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      setResults([]);
      setJudgmentCount(0);
    } finally {
      setIsLoading(false);
    }
  };
  // Search by CaseNo
  const handleCaseNoSearch = async (selectedCase) => {
    try {
      setIsLoading(true);

      const caseNoText = selectedCase.judgmentNoText || "";

      // Create search context
      createSearchContext("CASE NO INDEX", {
        caseinfo,
        caseNumber,
        caseYear,
        caseNoText,
      });

      // Use Axios instance with params
      const response = await api.get("/api/uat/searchByCaseNo", {
        params: { caseinfo: caseNoText },
      });

      const data = response.data;

      if (!data || data.error) {
        console.error("Error in response data:", data.error);
        setJudgmentData(null); // Prevent setting bad data
        toast.error(`Error: ${data?.error || "Unknown error"}`);
        return;
      }

      // Deduplicate results by judgmentId
      const uniqueResults = Array.from(
        new Set(data.map((r) => r.judgmentId))
      ).map((judgmentId) => data.find((r) => r.judgmentId === judgmentId));

      setResults(uniqueResults);
      setJudgmentCount(uniqueResults.length);

      // Store search terms for highlighting
      setSearchTerms([caseNoText].filter((term) => term));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      setResults([]);
      setJudgmentCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaseNoSelect = (selectedCase) => {
    handleCaseNoSearch(selectedCase);
  };
  //search by Advocate
  const handleAdvocateSearch = async () => {
    try {
      setIsLoading(true);
      const advocateNameValue = advocateName || "";
      createSearchContext("ADVOCATE INDEX", {
        advocateName: advocateNameValue,
      });

      const response = await api.get("/api/uat/searchByAdvocate", {
        params: { advocateName: advocateNameValue },
      });
      const data = response.data;
      if (!data || data.error) {
        console.error("Error in response data:", data.error);
        setJudgmentData(null); // Prevent setting bad data
        toast.error(`Error: ${error.message}`);

        return;
      }
      const uniqueResults = Array.from(
        new Set(data.map((result) => result.judgmentId))
      ).map((judgmentId) =>
        data.find((result) => result.judgmentId === judgmentId)
      );
      setResults(uniqueResults);
      setJudgmentCount(uniqueResults.length);
      setSearchTerms([advocateNameValue].filter((term) => term));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      setResults([]);
      setJudgmentCount(0);
    }
  };
  //search by Judge
  const handleJudgeSearch = async () => {
    try {
      setIsLoading(true);
      createSearchContext("JUDGE INDEX", { judge: judge });

      const response = await api.get("/api/uat/searchByJudge", {
        params: { judge },
      });
      const data = response.data;
      if (!data || data.error) {
        console.error("Error in response data:", data.error);
        setJudgmentData(null); // Prevent setting bad data
        toast.error(`Error: ${error.message}`);

        return;
      }
      const uniqueResults = Array.from(
        new Set(data.map((result) => result.judgmentId))
      ).map((judgmentId) =>
        data.find((result) => result.judgmentId === judgmentId)
      );
      setResults(uniqueResults);
      setJudgmentCount(uniqueResults.length);
      setSearchTerms([judge].filter((term) => term));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      setResults([]);
      setJudgmentCount(0);
    }
  };

  
  const handleCitationSearch = async (selectedCitation) => {
    try {
      setIsLoading(true);
      const CitationText = selectedCitation.judgmentCitation || "";
      // Create search context
      createSearchContext("CITATION INDEX", {
        year,
        volume,
        publicationName,
        pageNo,
        completeCitation,
        citationText: CitationText,
      });

      const response = await api.get("/api/uat/searchByCitation", {
        params: { CitationText: CitationText },
      });
      const data = response.data;
      if (!data || data.error) {
        console.error("Error in response data:", data.error);
        setJudgmentData(null); // Prevent setting bad data
        toast.error(`Error: ${error.message}`);

        return;
      }
      const uniqueResults = Array.from(
        new Set(data.map((result) => result.judgmentId))
      ).map((judgmentId) =>
        data.find((result) => result.judgmentId === judgmentId)
      );
      setResults(uniqueResults);
      setJudgmentCount(uniqueResults.length);
      setSearchTerms([CitationText].filter((term) => term));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      setResults([]);
      setJudgmentCount(0);
    }
  };

  useEffect(() => {
    if (citation && onSearch) {
      // Perform search action here using onSearch function
      console.log("Searching for citation:", citation);
      onSearch(citation); // Example: Call onSearch function with citation as argument
    }
  }, [citation, onSearch]);

 //Equals Search
const handleEquivalentSearch = async (selectedEqual) => {
  try {
    setIsLoading(true);
    const EqualText = selectedEqual.equalCitationText || '';

 // Create search context
    createSearchContext('EQUIVALENT INDEX', {
      equivalentYear,
      equivalentVolume,
      equivalentPublicationName,
      equivalentPageNo,
      completeEquivalentCitation,
      equalText: EqualText
    });

    const response = await api.get('/api/searchByEquivalent', { params: { EqualText: EqualText } });
     const data = response.data;
    if (!data || data.error) {
        console.error('Error in response data:', data.error);
        setJudgmentData(null); // Prevent setting bad data
		toast.error(`Error: ${error.message}`);

        return;
      }
	  const uniqueResults = Array.from(new Set(data.map(result => result.judgmentId)))
      .map(judgmentId => data.find(result => result.judgmentId === judgmentId));
    setResults(uniqueResults);
    setJudgmentCount(uniqueResults.length);
    setSearchTerms([EqualText].filter(term => term));

  } catch (err) {
    console.error('Error fetching data:', err);
    setError(err);
    setResults([]);
    setJudgmentCount(0);
  }
};


  //fetching DropDowns

  useEffect(() => {
    let filtered = [...caseNos];

    if (typeof caseInfo === "string") {
      filtered = filtered.filter((caseNo) =>
        caseNo.judgmentNoText.toLowerCase().includes(caseInfo.toLowerCase())
      );
    }
    if (typeof caseYear === "string") {
      filtered = filtered.filter((caseNo) =>
        caseNo.judgmentNoText.toLowerCase().includes(caseYear.toLowerCase())
      );
    }
    if (typeof caseNumber === "string") {
      filtered = filtered.filter((caseNo) =>
        caseNo.judgmentNoText.toLowerCase().includes(caseNumber.toLowerCase())
      );
    }

    setFilteredCaseNos(filtered);
  }, [caseInfo, caseYear, caseNumber, caseNos, setFilteredCaseNos]); // Ensured dependencies are correct

  useEffect(() => {
    let filtered = [...citations];

    // Function to determine whether to use newCitation or judgmentCitation
    const getCitationField = (citation) => {
      return publicationName?.toLowerCase() === "ald online"
        ? citation.newCitation
        : citation.judgmentCitation;
    };

    // Function to check if a publication matches
    const isPublicationMatch = (citation) => {
      // If 'ALL' is selected, return true
      if (publicationName.toLowerCase() === "all") return true;

      // If a specific publication is selected
      if (publicationName.trim() !== "") {
        // Check if the citation contains the publication name
        const citationField = getCitationField(citation);
        return citationField
          ?.toLowerCase()
          .includes(publicationName.toLowerCase());
      }

      return true;
    };

    // Apply filters
    filtered = filtered.filter((citation) => {
      // Publication filter
      if (!isPublicationMatch(citation)) return false;

      // Year filter
      if (year.trim() !== "") {
        const citationField = getCitationField(citation);
        if (!citationField?.toLowerCase().includes(year.toLowerCase()))
          return false;
      }

      // Volume filter
      if (volume.trim() !== "") {
        const citationField = getCitationField(citation);
        if (!citationField?.toLowerCase().includes(volume.toLowerCase()))
          return false;
      }

      // Page No filter
      if (pageNo.trim() !== "") {
        const citationField = getCitationField(citation);
        if (citationField) {
          const pageNumbers = citationField.match(/\b\d+\b/g) || [];
          if (!pageNumbers.includes(pageNo)) return false;
        }
      }

      // Complete Citation filter
      if (completeCitation.trim() !== "") {
        const judgmentMatch = citation.judgmentCitation
          ?.toLowerCase()
          .includes(completeCitation.toLowerCase());
        const newCitationMatch = citation.newCitation
          ?.toLowerCase()
          .includes(completeCitation.toLowerCase());
        if (!(judgmentMatch || newCitationMatch)) return false;
      }

      return true;
    });

    // Sorting logic to prioritize latest citations and exact matches
    filtered.sort((a, b) => {
      const aCitation = getCitationField(a)?.toLowerCase() || "";
      const bCitation = getCitationField(b)?.toLowerCase() || "";
      const pageNumber = pageNo.trim();

      // First, sort by year (assuming year is in the citation)
      const extractYear = (citation) => {
        const yearMatch = citation.match(/\b(19\d{2}|20\d{2})\b/);
        return yearMatch ? parseInt(yearMatch[1]) : 0;
      };

      const aYear = extractYear(aCitation);
      const bYear = extractYear(bCitation);

      // Sort by year in descending order (latest first)
      if (aYear !== bYear) return bYear - aYear;

      // Prioritize exact complete citation match
      if (aCitation === completeCitation.toLowerCase()) return -1;
      if (bCitation === completeCitation.toLowerCase()) return 1;

      // Prioritize exact page number matches
      const aPage = aCitation.match(/\b\d+\b/g) || [];
      const bPage = bCitation.match(/\b\d+\b/g) || [];

      if (aPage.includes(pageNumber) && !bPage.includes(pageNumber)) return -1;
      if (!aPage.includes(pageNumber) && bPage.includes(pageNumber)) return 1;

      // If both have the number, prioritize ones where the number appears earlier
      const aIndex = aCitation.indexOf(` ${pageNumber} `);
      const bIndex = bCitation.indexOf(` ${pageNumber} `);

      if (aIndex !== -1 && bIndex === -1) return -1;
      if (bIndex !== -1 && aIndex === -1) return 1;
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex; // Closer to start ranks higher

      return bCitation.localeCompare(aCitation);
    });

    setFilteredCitations(filtered);
  }, [year, volume, publicationName, pageNo, completeCitation, citations]);
  // Function to search when fullCitation is updated
  useEffect(() => {
    if (fullCitation && fullCitation.trim() !== "") {
      handleCitationSearch({ judgmentCitation: fullCitation });
      setFullCitation(""); // Clear fullCitation state to prevent repeated searches
    }
  }, [fullCitation, handleCitationSearch]);

  // Function to search when the judgmentreferredcitation is referred as a prop(fullCitation)
  useEffect(() => {
    if (fullCitation && fullCitation.trim() !== "") {
      handleCitationSearch({ judgmentCitation: fullCitation }); // Call handleCitationSearch with a mock object
      setFullCitation(""); // Clear fullCitation state to prevent repeated searches
    }
  }, [fullCitation, handleCitationSearch]);

  //this was the function which was used to search citation through input field itself
  {
    /* 
const handleFullCitationChange = (e) => {
  const { value } = e.target;
  setFullCitation(value); // Update state with the new value
};*/
  }

  const handleCitationSelect = (selectedCitation) => {
    handleCitationSearch(selectedCitation);
  };

  useEffect(() => {
    let filtered = [...equivalents];

    // Filter by year
    if (equivalentYear.trim() !== "") {
      filtered = filtered.filter((equivalent) =>
        equivalent.equalCitationText
          .toLowerCase()
          .includes(equivalentYear.toLowerCase())
      );
    }

    // Filter by volume
    if (equivalentVolume.trim() !== "") {
      filtered = filtered.filter((equivalent) =>
        equivalent.equalCitationText
          .toLowerCase()
          .includes(equivalentVolume.toLowerCase())
      );
    }

    // Filter by page number
    if (equivalentPageNo.trim() !== "") {
      filtered = filtered.filter((equivalent) =>
        equivalent.equalCitationText
          .toLowerCase()
          .includes(equivalentPageNo.toLowerCase())
      );
    }

    // Filter by complete citation
    if (completeEquivalentCitation.trim() !== "") {
      filtered = filtered.filter((equivalent) =>
        equivalent.equalCitationText
          .toLowerCase()
          .includes(completeEquivalentCitation.toLowerCase())
      );
    }

    // Filter by publication name
    if (equivalentPublicationName !== "ALL") {
      filtered = filtered.filter((equivalent) =>
        equivalent.equalCitationText
          .toLowerCase()
          .includes(equivalentPublicationName.toLowerCase())
      );
    }

    setFilteredEquivalents(filtered);
  }, [
    equivalentYear,
    equivalentVolume,
    equivalentPageNo,
    completeEquivalentCitation,
    equivalentPublicationName,
    equivalents,
  ]);

  const handleEqualSelect = (selectedEqual) => {
    handleEquivalentSearch(selectedEqual);
  };

  useEffect(() => {
    let filtered = [...equivalents];
    if (typeof year === "string" && year.trim() !== "") {
      filtered = filtered.filter(
        (equivalent) =>
          equivalent.judgmentYear &&
          equivalent.judgmentYear.toLowerCase().includes(year.toLowerCase())
      );
    }
    if (publicationName && publicationName !== "ALL") {
      filtered = filtered.filter(
        (equivalent) =>
          equivalent.judgmentPublication &&
          equivalent.judgmentPublication.toLowerCase() ===
            publicationName.toLowerCase()
      );
    }
    if (typeof pageNo === "string" && pageNo.trim() !== "") {
      filtered = filtered.filter(
        (equivalent) =>
          equivalent.judgmentPage &&
          equivalent.judgmentPage.toString().includes(pageNo)
      );
    }
    setFilteredEquivalents(filtered);
  }, [year, publicationName, pageNo, equivalents]);

  const fetchSections = async (legislationId) => {
    try {
      const response = await api.get("/api/uat/sections", {
        params: { legislationId }
      });
  
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };
  
  
    // SubSection Fetching
   const fetchSubsections = async (legislationSectionId) => {
    try {
      const response = await api.get("/api/uat/subsections", {
        params: { legislationSectionId }
      });
  
      setSubsections(response.data);
    } catch (error) {
      console.error("Error fetching subsections:", error);
    }
  };

  // ACT handling
  const handleLegislationChange = (e) => {
    const selectedLegislation = e.target.value;
    setLegislationName(selectedLegislation);

    // Find the selected legislation object based on legislationName
    const selectedLegislationObj = legislationNames.find(
      (leg) => leg.legislationName === selectedLegislation
    );
    if (selectedLegislationObj) {
      fetchSections(selectedLegislationObj.legislationId);
    }
  };

  // Section Handling with Combination
  const handleSectionChange = (e) => {
    const selectedSection = e.target.value;
    setSection(selectedSection);

    // Find the selected section object based on legislationSectionCombined
    const selectedSectionObj = sections.find(
      (sec) => sec.legislationSectionCombined === selectedSection
    );

    if (selectedSectionObj) {
      fetchSubsections(selectedSectionObj.legislationSectionId);
    }
  };


  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await api.get('/api/publications'); // Axios automatically uses baseURL
        setPublications(response.data); // Axios already parses JSON
      } catch (error) {
        console.error('Error fetching publications:', error);
      }
    };
  
    fetchPublications();
  }, []);

  const clearFields = () => {
    setLegislationName("");
    setSection("");
    setSubsection("");
    setTopicName("");
    setYear("");
    setVolume("");
    setPublicationName("ALL");
    setPageNo("");
    setCaseInfo("");
    setCaseNumber("");
    setCaseYear("");
    setPublicationName("ALL");
    setPageNo("");
    setJudge("");
    setAdvocateName("");
    setError(null);
    setResults([]);
    setJudgmentCount(0);
    setSearchTerms([]);
    setEquivalentYear("");
    setEquivalentVolume("");
    setEquivalentPageNo("");
    setCompleteEquivalentCitation("");
    setEquivalentPublicationName("ALL");
    setCompleteCitation("");
    setNominal("");

    // Clear search context
    setCurrentSearchContext({});
    if (onSearchContextChange) {
      onSearchContextChange({});
    }
  };

  const handleClear = () => {
    console.log("Handle clear called");

    // Perform the first clear operation
    clearFields();

    // Call the onClear function from the parent component
    onClear(); // First call to onClear

    // Call the onClear function again after a small delay to simulate pressing it twice
    setTimeout(() => {
      console.log("Calling onClear again (second time)");
      onClear(); // Second call to onClear
    }, 100); // Delay of 100ms to simulate the second press
  };

  const clearInput = (setter) => {
    setter("");
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.panelOutline}>
        {/* Subject Index */}
        <div className={styles.container}>
          <div className={styles.subitem} onClick={() => toggleIndex(0)}>
            <span>SUBJECT INDEX</span>
          </div>
          {openIndex === 0 && (
            <>
              <div className={styles.subitem}>
                <input
                  value={legislationName}
                  onChange={handleLegislationChange}
                  className={styles.drop}
                  list="data"
                  placeholder="ACT"
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <datalist id="data">
                  {legislationNames.map((name, index) => (
                    <option key={index} value={name.legislationName}>
                      {name.legislationName}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className={styles.subitem}>
                <input
                  value={section}
                  onChange={handleSectionChange}
                  className={styles.drop}
                  list="datasection" // Add list attribute here
                  placeholder="SECTION"
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <datalist id="datasection">
                  {sections.map((sec, index) => (
                    <option key={index} value={sec.legislationSectionCombined}>
                      {" "}
                      {/*legislationSectionPrefix + legislationSectionNo*/}
                      {sec.legislationSectionCombined}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className={styles.searchelement}>
                <input
                  type="text"
                  placeholder="SUB-SECTION"
                  list="datasubsection"
                  value={subsection}
                  onChange={(e) => setSubsection(e.target.value)}
                  className={styles.searchInput}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <datalist id="datasubsection">
                  {subsections.map((subsec, index) => (
                    <option
                      key={index}
                      value={subsec.legislationSubSectionName}
                    >
                      {subsec.legislationSubSectionName}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className={styles.button}>
                <button onClick={handleSearch}>Search</button>
                <button onClick={handleClear} className={styles.clearButton}>
                  Clear
                </button>
              </div>
            </>
          )}
        </div>

        {/* Topic Index */}
        <div className={styles.container}>
          <div className={styles.subitem} onClick={() => toggleIndex(1)}>
            <span>TOPIC INDEX</span>
          </div>
          {openIndex === 1 && (
            <>
              <div className={styles.subitem}>
                <input
                  value={topic}
                  onChange={(e) => setTopicName(e.target.value)}
                  className={styles.drop}
                  list="data-topic"
                  placeholder="Topic"
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <datalist id="data-topic">
                  {topics.map((name, index) => (
                    <option key={index} value={name.topicName}>
                      {name.topicName}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className={styles.button}>
                <button onClick={handleTopicSearch}>Search</button>
                <button onClick={handleClear} className={styles.clearButton}>
                  Clear
                </button>
              </div>
            </>
          )}
        </div>

        {/* Citation Index */}
        {}
        <div className={styles.container}>
          <div className={styles.subitem} onClick={() => toggleIndex(2)}>
            <span>CITATION INDEX</span>
          </div>
          {openIndex === 2 && (
            <>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Year"
                  className={styles.searchInput}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Volume No"
                  className={styles.searchInput}
                  value={volume}
                  onChange={(e) => {
                    let inputValue = e.target.value;

                    // Remove all parentheses
                    inputValue = inputValue.replace(/[()]/g, "");

                    // If input is empty, clear the volume state
                    if (inputValue === "") {
                      setVolume("");
                      return;
                    }

                    // Format the input with parentheses
                    const formattedValue = `(${inputValue})`;

                    setVolume(formattedValue);
                  }}
                  onKeyDown={(e) => {
                    // If backspace is pressed and length is 3 (indicating "(X)" format), prevent extra backspace
                    if (e.key === "Backspace" && volume.length === 3) {
                      e.preventDefault();
                      setVolume(""); // Clear volume if backspace is hit when there are minimal characters
                    }
                  }}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.subitem} style={{ position: "relative" }}>
                <select
                  className={styles.searchInput}
                  value={publicationName}
                  onChange={(e) => setPublicationName(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                    appearance: "none", // Removes default dropdown styling
                    cursor: "pointer",
                    textAlign: "center",
                    paddingRight: "30px", // Space for arrow
                  }}
                >
                  <option value="all">ALL</option>
                  {publications.map((pub, index) => (
                    <option key={index} value={pub.publicationShortName}>
                      {pub.publicationShortName}
                    </option>
                  ))}
                  <option value="ALD Online">ALD Online</option>
                </select>

                {/* Dropdown Arrow */}
                <div
                  style={{
                    position: "absolute",
                    right: "22px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    fontSize: "12px",
                    color: "#555",
                  }}
                >
                  ▼
                </div>
              </div>

              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Page No"
                  className={styles.searchInput}
                  value={pageNo}
                  onChange={(e) => setPageNo(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Complete Citation"
                  className={styles.searchInput}
                  value={completeCitation}
                  onChange={(e) => setCompleteCitation(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.caseNoList}>
                {filteredCitations.map((citation) => (
                  <div
                    key={citation.judgmentId}
                    onClick={() => handleCitationSelect(citation)}
                    className={styles.caseNoItem}
                  >
                    <div className={styles.citationText}>
                      <div className={styles.newCitation}>
                        {citation.newCitation}
                      </div>
                      <div className={styles.oldCitation}>
                        {citation.judgmentCitation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.subitem}>
                <div className={styles.button}>
                  <button onClick={handleClear} className={styles.clearButton}>
                    Clear
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        {}

        {/* Nominal Index */}
        <div className={styles.container}>
          <div className={styles.subitem} onClick={() => toggleIndex(3)}>
            <span>NOMINAL INDEX</span>
          </div>
          {openIndex === 3 && (
            <>
              <div className={styles.subitem}>
                <input
                  list="data-nominal"
                  type="text"
                  placeholder="Nominal Index"
                  className={styles.searchInput}
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <datalist id="data-nominal">
                  {nominals
                    .filter((name) =>
                      name.judgmentParties
                        .toLowerCase()
                        .includes(nominal.toLowerCase())
                    )
                    .map((name, index) => (
                      <option key={index} value={name.judgmentParties} />
                    ))}
                </datalist>
              </div>
              <div className={styles.button}>
                <button onClick={handleNominalSearch}>Search</button>
                <button onClick={handleClear} className={styles.clearButton}>
                  Clear
                </button>
              </div>
            </>
          )}
        </div>

        {/* Case No Index */}
        {}
        <div className={styles.container}>
          <div className={styles.subitem} onClick={() => toggleIndex(4)}>
            <span>CASE NO INDEX</span>
          </div>
          {openIndex === 4 && (
            <>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Case Type"
                  value={caseInfo}
                  onChange={(e) => setCaseInfo(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Case No"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Case Year"
                  value={caseYear}
                  onChange={(e) => setCaseYear(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div className={styles.caseNoList}>
                {filteredCaseNos.map((caseNo) => (
                  <div
                    key={caseNo.judgmentId}
                    onClick={() => handleCaseNoSelect(caseNo)}
                    className={styles.caseNoItem}
                  >
                    {caseNo.judgmentNoText}
                  </div>
                ))}
              </div>
              <div className={styles.button}>
                <button onClick={handleClear} className={styles.clearButton}>
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
        {}
        {/* Judge Index */}
        <div className={styles.container}>
          <div className={styles.subitem} onClick={() => toggleIndex(5)}>
            <span>JUDGE INDEX</span>
          </div>
          {openIndex === 5 && (
            <>
              <div className={styles.subitem}>
                <input
                  list="data-j"
                  type="text"
                  placeholder="Judge"
                  className={styles.searchInput}
                  value={judge}
                  onChange={(e) => setJudge(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />

                <datalist id="data-j">
                  {judges
                    .filter((jname) =>
                      jname.judgeName
                        .toLowerCase()
                        .includes(judge.toLowerCase())
                    )
                    .map((jname, index) => (
                      <option key={index} value={jname.judgeName} />
                    ))}
                </datalist>
              </div>
              <div className={styles.button}>
                <button
                  onClick={handleJudgeSearch}
                  className={styles.searchButton}
                >
                  Search
                </button>
                <button onClick={handleClear} className={styles.clearButton}>
                  Clear
                </button>
              </div>
            </>
          )}
        </div>

        {/* Advocate Index */}
        <div className={styles.container}>
          <div className={styles.subitem} onClick={() => toggleIndex(6)}>
            <span>ADVOCATE INDEX</span>
          </div>
          {openIndex === 6 && (
            <>
              <div className={styles.subitem}>
                <input
                  list="advocateList"
                  type="text"
                  placeholder="Advocate Name"
                  className={styles.searchInput}
                  value={advocateName}
                  onChange={(e) => setAdvocateName(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <datalist id="advocateList">
                  {advocates
                    .filter((name) =>
                      name.advocateName
                        .toLowerCase()
                        .includes(advocateName.toLowerCase())
                    )
                    .map((name, index) => (
                      <option key={index} value={name.advocateName} />
                    ))}
                </datalist>
              </div>
              <div className={styles.button}>
                <button onClick={handleAdvocateSearch}>Search</button>
                <button onClick={handleClear} className={styles.clearButton}>
                  Clear
                </button>
              </div>
            </>
          )}
        </div>

        {/* Equivalent Index */}
        <div className={styles.container}>
          <div className={styles.subitem} onClick={() => toggleIndex(7)}>
            <span>EQUIVALENT INDEX</span>
          </div>
          {openIndex === 7 && (
            <>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Year"
                  className={styles.searchInput}
                  value={equivalentYear}
                  onChange={(e) => setEquivalentYear(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Volume No"
                  className={styles.searchInput}
                  value={equivalentVolume}
                  onChange={(e) => setEquivalentVolume(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.subitem}>
                <select
                  className={styles.searchInput}
                  value={equivalentPublicationName}
                  onChange={(e) => setEquivalentPublicationName(e.target.value)}
                >
                  <option value="ALL">ALL</option>
                  <option value="SCC">SCC</option>
                  <option value="SCC (Cri.)">SCC (Cri.)</option>
                  <option value="AIR SC">AIR SC</option>
                  <option value="AIR SCW">AIR SCW</option>
                  <option value="AIR AP">AIR AP</option>
                  <option value="ALT">ALT</option>
                </select>
              </div>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Page No"
                  className={styles.searchInput}
                  value={equivalentPageNo}
                  onChange={(e) => setEquivalentPageNo(e.target.value)}
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.subitem}>
                <input
                  type="text"
                  placeholder="Complete Citation"
                  className={styles.searchInput}
                  value={completeEquivalentCitation}
                  onChange={(e) =>
                    setCompleteEquivalentCitation(e.target.value)
                  }
                  style={{
                    width: "90%",
                    padding: "8px",
                    boxSizing: "border-box",
                    background: "#ffff",
                    borderRadius: "15px",
                    border: "none",
                    boxShadow:
                      "   inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px  #ffffff",
                    color: "#333",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div className={styles.caseNoList}>
                {filteredEquivalents.map((equivalent) => (
                  <div
                    key={equivalent.equalCitationId}
                    onClick={() => handleEqualSelect(equivalent)}
                    className={styles.caseNoItem}
                  >
                    {equivalent.equalCitationText}
                  </div>
                ))}
              </div>
              <div className={styles.button}>
                <button onClick={handleClear} className={styles.clearButton}>
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
