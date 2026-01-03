import React, { useState, useEffect } from "react";
import styles from "./Statutes.module.css";
import FrontDBS from "../components/Statutes/FrontDBS";
import RearDBS from "../components/Statutes/RearDBS";
import SidePanel from "../components/SidePanel/StatuesSidePanel";
import parse from 'html-react-parser';
import LegislationInfo from "../components/StatuesInfo/LegislationInfo";
import AmendmentInfo from "../components/StatuesInfo/AmendmentInfo";

const Statutes = () => {
  const [topHtmlContent, setTopHtmlContent] = useState('');
  const [bareActIndex, setBareActIndex] = useState('');
  const [Legislation, setLegislation] = useState({ shortNotes: [], judgmentCitations: []  });
  const [dataHrefContent, setDataHrefContent] = useState('');
  const [sectionData, setSectionData] = useState('');
  const [hrefData, setHrefData] = useState('');
  const [bottomHtmlContent, setBottomHtmlContent] = useState(<LegislationInfo legislationInfo={Legislation} />);
  const [section, setSection] = useState("Citations");
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredShortNotes, setFilteredShortNotes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setBottomHtmlContent(<LegislationInfo legislationInfo={Legislation} />);
  }, [Legislation]);

  useEffect(() => {
    if (searchTerm) {
      const filteredNotes = Legislation?.shortNotes?.filter((shortNote) => {
        const containsTerm = 
          shortNote?.shortNoteText?.includes(searchTerm) ||
          shortNote?.shortNoteParas?.some(para => para?.shortNoteParaText?.includes(searchTerm)) ||
          shortNote?.longNotes?.some(longNote =>
            longNote?.longNoteText?.includes(searchTerm) ||
            longNote?.longNoteParas?.some(para => para?.longNoteParaText?.includes(searchTerm))
          );
        return containsTerm;
      }) || [];
      setFilteredShortNotes(filteredNotes);
      setTotalPages(Math.ceil(filteredNotes.length / itemsPerPage));
      updateCurrentItems(1);
    } else {
      setBottomHtmlContent(<LegislationInfo legislationInfo={Legislation} />);
      setTotalPages(Math.ceil((Legislation.shortNotes || []).length / itemsPerPage));
      updateCurrentItems(1);
    }
  }, [searchTerm, Legislation]);

  const updateCurrentItems = (pageNumber) => {
    const indexOfLastItem = pageNumber * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const itemsToDisplay = searchTerm 
      ? filteredShortNotes.slice(indexOfFirstItem, indexOfLastItem)
      : (Legislation.shortNotes || []).slice(indexOfFirstItem, indexOfLastItem);
    setBottomHtmlContent(<LegislationInfo legislationInfo={{ shortNotes: itemsToDisplay }} />);
  };

  const updateTopHtmlContent = (index) => {
    const fetchedHtml = `
      <div class="${styles.scrollableContent}">
        <p>${index}</p>
      </div>
    `;
    setTopHtmlContent(fetchedHtml);
    setBareActIndex(index);
    setBottomHtmlContent(<LegislationInfo legislationInfo={Legislation} />);
  };

  const updateBottomHtmlContent = (htmlData) => {
    setBottomHtmlContent(htmlData);
    setDataHrefContent(htmlData);
    setSectionData(htmlData);
  };

  useEffect(() => {
    setTimeout(() => {
      setTopHtmlContent('<p>No Results Found.</p>');
    }, 1000);
  }, []);

  const handleLinkClick = (e) => {
    e.preventDefault();
    const href = e.target.getAttribute('data-href');
    setHrefData(href);
    if (href) {
      updateBottomHtmlContent(<AmendmentInfo sectionData={href} />);
      setSection("Amendments"); // Update section state
    }
  };

  const handleSectionClick = (section) => {
    if (section === "Citations") {
      updateBottomHtmlContent(<LegislationInfo legislationInfo={Legislation} />);
      setSection("Citations"); // Update section state
    } else if (section === "Amendments") {
      updateBottomHtmlContent(<AmendmentInfo sectionData={hrefData} />);
      setSection("Amendments"); // Update section state
    } else if (section === "←") {
      handlePrev();
    } else if (section === "→") {
      handleNext();
    }
  };

  const handleClearAll = () => {
    setTopHtmlContent('');
    setBottomHtmlContent(<LegislationInfo legislationInfo={''} />); // Reset LegislationInfo to empty
    setHrefData('');
    setLegislation({ shortNotes: [] }); // Reset Legislation to an empty array
    setSection("Citations"); // Reset section to "Citations"
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateCurrentItems(nextPage);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      updateCurrentItems(prevPage);
    }
  };

  const handleFirst = () => {
    setCurrentPage(1);
    updateCurrentItems(1);
  };

  const handleLast = () => {
    setCurrentPage(totalPages);
    updateCurrentItems(totalPages);
  };

  return (
    <div className={styles.fullcontainer}>
      <SidePanel 
        onBareActSelect={updateTopHtmlContent} 
        onSectionSelect={updateTopHtmlContent} 
        setLegislation={setLegislation}
        onClear={handleClearAll}
        setSearchTerm={setSearchTerm} // Pass setSearchTerm to SidePanel
      />
      <div className={styles.frame}>
        <div className={styles.topframe}>
          <FrontDBS />
          <div className={`${styles.textStyles} ${styles.scrollableContent}`}>
            {parse(topHtmlContent, {
              replace: (domNode) => {
                if (domNode.type === 'tag' && domNode.name === 'a' && domNode.attribs.href) {
                  return (
                    <a
                      href="#"
                      data-href={domNode.attribs.href}
                      onClick={handleLinkClick}
                    >
                      {domNode.children[0].data}
                    </a>
                  );
                }
              }
            })}
          </div>
        </div>
        <div className={styles.bottomframe}>
          <RearDBS 
            onSectionClick={handleSectionClick} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            handleNext={handleNext} 
            handlePrev={handlePrev}
            handleFirst={handleFirst}
            handleLast={handleLast}
            section={section} // Pass the section state to RearDBS
          />
          <div className={`${styles.textStyles} ${styles.scrollableContent}`}>
            {bottomHtmlContent}
          </div>
        </div>
        <div className={styles.pagebox}></div>
      </div>
    </div>
  );
};

export default Statutes;
