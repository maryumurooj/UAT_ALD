import React, { useState, useEffect, useRef } from "react";
import styles from "./CFSidePanel.module.css";
import api from "../../axios";

function SidePanel({
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
}) {
  const [section, setSection] = useState("");
  const [subsection, setSubsection] = useState("");
  const [judge, setJudge] = useState("");
  const [advocate, setAdvocate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [court, setCourt] = useState("");
  const [publication, setPublication] = useState("");
  const [acts, setActs] = useState([]);
  const [legislationName, setLegislationName] = useState("");
  const [legislationNames, setLegislationNames] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [topics, setTopics] = useState([]);
  const [judges, setJudges] = useState([]);
  const [judgeName, setJudgeName] = useState("");
  const [advocates, setAdvocates] = useState([]);
  const [advocateName, setAdvocateName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [subsectionName, setSubsectionName] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [words, setWords] = useState([]);
  const [wordName, setWordName] = useState("");
  const [addedWords, setAddedWords] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [subsectionList, setSubsectionList] = useState([]);
  const [advocateList, setAdvocateList] = useState([]);
  const [topicList, setTopicList] = useState([]);
  const [judgeList, setJudgeList] = useState([]);
  const [citations, setCitations] = useState(""); // Added from code 1
  const [citation, setCitation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchWords, setSearchWords] = useState([]);
  const lastAddedAct = useRef(null);
  const [currentSearchWord, setCurrentSearchWord] = useState("");
  const handleAddSearchWord = () => {
    if (currentSearchWord.trim()) {
      setSearchWords([...searchWords, currentSearchWord.trim()]);
      setCurrentSearchWord("");
    }
  };

  // Add these state variables for pad search context
  const [currentSearchContext, setCurrentSearchContext] = useState({});
  const [currentSearchType, setCurrentSearchType] = useState("");

  // Function to format cumulative search context details
  const formatAdvancedSearchContext = (searchData) => {
    return {
      searchWords: searchData.searchWords || [],
      acts: searchData.acts || [],
      sections: searchData.sections || [],
      subsections: searchData.subsections || [],
      topics: searchData.topics || [],
      judges: searchData.judges || [],
      advocates: searchData.advocates || [],
    };
  };

  // Function to generate display text for cumulative search
  const generateAdvancedDisplayText = (searchData) => {
    const filters = [];

    if (searchData.searchWords?.length > 0) {
      filters.push(`Free Words: ${searchData.searchWords.join(", ")}`);
    }

    if (searchData.acts?.length > 0) {
      filters.push(`${searchData.acts.join(", ")}`);
    }

    if (searchData.sections?.length > 0) {
      const sectionTexts = searchData.sections.map(
        (s) => `${s.section} of ${s.act}`
      );
      filters.push(` ${sectionTexts.join(", ")}`);
    }

    if (searchData.subsections?.length > 0) {
      const subsectionTexts = searchData.subsections.map(
        (s) => `${s.subsection} of ${s.section} of ${s.act}`
      );
      filters.push(` ${subsectionTexts.join(", ")}`);
    }

    if (searchData.topics?.length > 0) {
      filters.push(`Topics: ${searchData.topics.join(", ")}`);
    }

    // Updated judges formatting - each name gets "Hon'ble Justice" prefix
    if (searchData.judges?.length > 0) {
      const judgeTexts = searchData.judges.map(
        (judge) => `Hon'ble Justice ${judge}`
      );
      filters.push(judgeTexts.join(", "));
    }

    // Updated advocates formatting - each name gets "Advocate" prefix
    if (searchData.advocates?.length > 0) {
      const advocateTexts = searchData.advocates.map(
        (advocate) => `Advocate ${advocate}`
      );
      filters.push(advocateTexts.join(", "));
    }
    return filters.length > 0 ? filters.join(" | ") : "No search criteria";
  };

  // Function to create cumulative search context
  const createAdvancedSearchContext = () => {
    const searchData = {
      searchWords,
      acts,
      sections,
      subsections,
      topics,
      judges,
      advocates,
    };

    const searchContext = {
      type: "ADVANCED INDEX",
      details: formatAdvancedSearchContext(searchData),
      timestamp: new Date().toISOString(),
      displayText: generateAdvancedDisplayText(searchData),
    };

    setCurrentSearchContext(searchContext);

    // Pass to parent component
    if (onSearchContextChange) {
      onSearchContextChange(searchContext);
    }

    return searchContext;
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      console.log("Searching for:", searchWords);

      // Perform searches for each word independently
      const searchPromises = searchWords.map((word) =>
        api.post("/api/uat/freeword-search", { searchWords: [word] })
      );

      const searchResponses = await Promise.all(searchPromises);

      // Collect all judgmentIds for each word
      const judgmentIdArrays = searchResponses.map((response) =>
        response.data.map((result) => result.judgmentId)
      );

      // Find intersection of all judgmentId arrays
      const commonJudgmentIds = judgmentIdArrays.reduce((acc, ids) =>
        acc.filter((id) => ids.includes(id))
      );

      console.log("Common judgmentIds:", commonJudgmentIds);

      // Filter results to only include those with common judgmentIds
      let combinedResults = searchResponses.flatMap((response) =>
        response.data.filter((result) =>
          commonJudgmentIds.includes(result.judgmentId)
        )
      );

      // Remove duplicates from the combined results based on judgmentId
      combinedResults = combinedResults.filter(
        (result, index, self) =>
          index === self.findIndex((r) => r.judgmentId === result.judgmentId)
      );

      // Sort unique results by judgmentCitation in descending order
      combinedResults.sort((a, b) =>
        (b.judgmentCitation || "").localeCompare(a.judgmentCitation || "")
      );

      console.log(
        "Unique results after filtering and sorting:",
        combinedResults.length
      );

      setResults(combinedResults);
      setJudgmentCount(combinedResults.length);
      // setSearchWords([]); // Clear search words after search

      return combinedResults; // Return the results here
    } catch (error) {
      console.error("Error performing search:", error);
      setError(error);
      setResults([]);
      setJudgmentCount(0);
      return []; // Return an empty array on error to handle it gracefully
    }
  };

  const handleAddAct = () => {
    if (legislationName.trim() !== "") {
      setActs([...acts, legislationName.trim()]);
      lastAddedAct.current = legislationName.trim(); // Store last added act
      setLegislationName("");
    }
  };

  const handleAddSection = () => {
    const act = legislationName.trim() || lastAddedAct.current; // Use last added act if input is empty
    if (sectionName.trim() !== "" && act) {
      setSections([...sections, { act, section: sectionName.trim() }]);
      setSectionName("");
    }
  };

  const handleAddSubsection = () => {
    const act = legislationName.trim() || lastAddedAct.current;
    if (subsectionName.trim() !== "" && sectionName.trim() !== "" && act) {
      setSubsections([
        ...subsections,
        {
          act,
          section: sectionName.trim(),
          subsection: subsectionName.trim(),
        },
      ]);
      setSubsectionName("");
    }
  };

  const handleAddTopic = () => {
    if (topicName.trim() !== "") {
      setTopics([...topics, topicName.trim()]);
      setTopicName("");
    }
  };

  const handleAddJudge = () => {
    if (judgeName.trim() !== "") {
      setJudges([...judges, judgeName.trim()]);
      setJudgeName("");
    }
  };

  const handleAddAdvocate = () => {
    if (advocateName.trim() !== "") {
      setAdvocates([...advocates, advocateName.trim()]);
      setAdvocateName("");
    }
  };
  const handleAdvancedSearch = async (onSearchComplete) => {
    try {
      setIsLoading(true);

      // Create cumulative search context BEFORE performing search
      createAdvancedSearchContext();

      const hasSQLInputs =
        acts.length > 0 ||
        sections.length > 0 ||
        subsections.length > 0 ||
        topics.length > 0 ||
        judges.length > 0 ||
        advocates.length > 0;
      const hasFreewordInput = searchWords.length > 0;

      let results = [];
      let judgmentCount = 0;
      let allSearchTerms = [];

      if (hasFreewordInput && !hasSQLInputs) {
        const elasticResponse = await handleSearch();
        if (!Array.isArray(elasticResponse)) {
          throw new Error("Unexpected response format from Elasticsearch API.");
        }
        results = elasticResponse;
        judgmentCount = elasticResponse.length;
        allSearchTerms = searchWords;
      }

      if (!hasFreewordInput && hasSQLInputs) {
        const sqlResponse = await runSQLSearch();
        if (!Array.isArray(sqlResponse)) {
          throw new Error("Unexpected response format from SQL API.");
        }
        const uniqueResults = Array.from(
          new Set(sqlResponse.map((result) => result.judgmentId))
        ).map((judgmentId) =>
          sqlResponse.find((result) => result.judgmentId === judgmentId)
        );
        results = uniqueResults;
        judgmentCount = uniqueResults.length;
        allSearchTerms = [
          ...acts,
          ...sections.map((s) => s.section), // Only store section number
          ...subsections.map((s) => s.subsection), // Only store subsection number
          ...topics,
          ...judges,
          ...advocates,
          ...searchWords,
        ];
      }

      if (hasFreewordInput && hasSQLInputs) {
        const [sqlResponse, elasticResponse] = await Promise.all([
          runSQLSearch(),
          handleSearch(),
        ]);
        if (!Array.isArray(sqlResponse) || !Array.isArray(elasticResponse)) {
          throw new Error(
            "Unexpected response format from SQL or Elasticsearch API."
          );
        }
        const sqlJudgmentIds = sqlResponse
          .map((result) => result.judgmentId)
          .filter(Boolean);
        const elasticJudgmentIds = elasticResponse
          .map((result) => result.judgmentId)
          .filter(Boolean);
        const commonJudgmentIds = sqlJudgmentIds.filter((id) =>
          elasticJudgmentIds.includes(id)
        );
        const combinedResults = [
          ...sqlResponse.filter((result) =>
            commonJudgmentIds.includes(result.judgmentId)
          ),
          ...elasticResponse.filter((result) =>
            commonJudgmentIds.includes(result.judgmentId)
          ),
        ];
        const uniqueResults = Array.from(
          new Set(combinedResults.map((result) => result.judgmentId))
        ).map((judgmentId) =>
          combinedResults.find((result) => result.judgmentId === judgmentId)
        );
        results = uniqueResults;
        judgmentCount = uniqueResults.length;
        allSearchTerms = [
          ...acts,
          ...sections.map((s) => `${s.section} of ${s.act}`),
          ...subsections.map(
            (s) => `${s.subsection} of ${s.section} of ${s.act}`
          ),
          ...topics,
          ...judges,
          ...advocates,
          ...searchWords,
        ];
      }

      setResults(results);
      setJudgmentCount(judgmentCount);
      setSearchTerms(allSearchTerms);

      if (typeof onSearchComplete === "function") {
        onSearchComplete();
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      setResults([]);
      setJudgmentCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to run the SQL search

  const runSQLSearch = async () => {
    try {
      const searchData = {
        acts,
        sections, // [{ act: "", section: "" }, ...]
        subsections, // [{ act: "", section: "", subsection: "" }, ...]
        topics,
        judges,
        advocates,
      };

      const response = await api.post("/api/uat/searchAdvanced", searchData);
      const data = await response.json();

      if (!data) {
        console.error("empty sql response");
        setJudgementData(null);
        return;
      }

      if (data.error) {
        console.error("SQL API error:", data.error);
        setJudgmentData(null);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        throw new Error("Unexpected data format from SQL API");
      }

      //console.log('SQL API Response:', data);
      return data;
    } catch (error) {
      console.error("Error running SQL search:", error);
      setJudgmentData(null);
    }
  };

  const handleRemoveItem = (indexToRemove, setState) => {
    setState((prevState) =>
      prevState.filter((_, index) => index !== indexToRemove)
    );
  };

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await api.get("/api/uat/all-words");
        if (response.data.success || response.data) {
          // Adjust based on API response structure
          setWords(response.data.words || response.data); // Use `response.data.words` if wrapped, else raw data
        }
      } catch (error) {
        console.error("Error fetching words:", error.message || error);
      }
    };

    fetchWords();
  }, []);

  const handleWordChange = (e) => {
    setWordName(e.target.value);
  };

  const handleAddWord = () => {
    if (wordName.trim() !== "") {
      setAddedWords([...addedWords, wordName.trim()]);
      setWordName("");
    }
  };

  useEffect(() => {
    const fetchLegislationNames = async () => {
      try {
        const response = await api.get("/api/uat/all-legislation");
        setLegislationNames(response.data.legislation || response.data); // Adjust if wrapped in success object
      } catch (error) {
        console.error(
          "Error fetching legislation names:",
          error.message || error
        );
      }
    };
    fetchLegislationNames();
  }, []);

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const response = await api.get("/api/uat/all-judge");
        setJudgeList(response.data.judges || response.data);
        //console.log("Judges fetched:", response.data);
      } catch (error) {
        console.error("Error fetching judges:", error.message || error);
      }
    };
    fetchJudges();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get("/api/uat/all-topic");
        setTopicList(response.data.topics || response.data);
        //console.log("Topics fetched:", response.data);
      } catch (error) {
        console.error("Error fetching topics:", error.message || error);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        const response = await api.get("/api/all-advocate");
        setAdvocateList(response.data.advocates || response.data);
        //console.log("Advocates fetched:", response.data);
      } catch (error) {
        console.error("Error fetching advocates:", error.message || error);
      }
    };
    fetchAdvocates();
  }, []);
  
  const fetchSections = async (legislationId) => {
    try {
      const response = await api.get(`/api/sections?legislationId=${legislationId}`);
      setSectionList(response.data.sections || response.data);
    } catch (error) {
      console.error("Error fetching sections:", error.message || error);
    }
  };

  const handleLegislationChange = (e) => {
    const selectedLegislation = e.target.value;
    setLegislationName(selectedLegislation);
    const selectedLegislationObj = legislationNames.find(
      (leg) => leg.legislationName === selectedLegislation
    );
    if (selectedLegislationObj) {
      fetchSections(selectedLegislationObj.legislationId);
    }
  };

  const handleSectionChange = (e) => {
    const value = e.target.value;
    setSectionName(value); // Allow typing by updating the state with the input value

    const selectedSection = sectionList.find(
      (sec) => sec.legislationSectionCombined === value
    );

    if (selectedSection) {
      fetchSubsections(selectedSection.legislationSectionId);
    } else {
      // Optionally, clear subsections if the input doesn't match any section
      setSubsectionList([]);
    }
  };

  const fetchSubsections = async (legislationSectionId) => {
    try {
      const response = await api.get(`/api/subsections?legislationSectionId=${legislationSectionId}`);
      setSubsectionList(response.data.subsections || response.data);
    } catch (error) {
      console.error("Error fetching subsections:", error.message || error);
    }
  };
  

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  //Referred citation search (FullCitation)
  //Citation search
  const handleCitationSearch = async (selectedCitation) => {
    try {
      const CitationText = selectedCitation.judgmentCitation || '';
      if (!CitationText) return;
  
      const response = await api.get(`/api/searchByCitation`, {
        params: { CitationText },
      });
  
      const data = response.data || [];
  
      const uniqueResults = Array.from(new Set(data.map(result => result.judgmentId)))
        .map(judgmentId => data.find(result => result.judgmentId === judgmentId));
  
      setResults(uniqueResults);
      setJudgmentCount(uniqueResults.length);
      setSearchTerms([CitationText]);
    } catch (err) {
      console.error('Error fetching data:', err.message || err);
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

  useEffect(() => {
    if (fullCitation && fullCitation.trim() !== "") {
      handleCitationSearch({ judgmentCitation: fullCitation }); // Call handleCitationSearch with a mock object
    }
  }, [fullCitation, handleCitationSearch]);

  // Function to search when the judgmentreferredcitation is referred as a prop(fullCitation)
  useEffect(() => {
    if (fullCitation && fullCitation.trim() !== "") {
      handleCitationSearch({ judgmentCitation: fullCitation }); // Call handleCitationSearch with a mock object
      setFullCitation(""); // Clear fullCitation state to prevent repeated searches
    }
  }, [fullCitation, handleCitationSearch]);

  const handleClear = () => {
    console.log("Handle clear called");

    // Clear all the necessary states
    setLegislationName(""); // Clear ACT field
    setSectionName(""); // Clear SECTION field
    setSubsectionName(""); // Clear SUB-SECTION field
    setAdvocateName(""); // Clear ADVOCATE field
    setJudgeName(""); // Clear JUDGE field
    setTopicName(""); // Clear TOPIC field
    setActs([]); // Clear added acts
    setSections([]); // Clear added sections
    setSubsections([]); // Clear added subsections
    setTopics([]); // Clear added topics
    setJudges([]); // Clear added judges
    setAdvocates([]); // Clear added advocates
    setSearchWords([]); // Clear added search words
    setError(null); // Clear any errors

    // Clear search context - ADD THIS
    setCurrentSearchContext({});
    if (onSearchContextChange) {
      onSearchContextChange({});
    }

    // First call to onClear
    onClear();

    // Call onClear again after a short delay (simulating the second press)
    setTimeout(() => {
      console.log("Calling onClear again (second time)");
      onClear(); // Second call to onClear
    }, 100); // Delay of 100ms
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.panelOutline}>
        <div className={styles.subcontainer}>
          <div className={styles.subitem}>
            <div className={styles.rectangleadvancedsearch}></div>
            ADVANCED SEARCH
          </div>
          <div className={styles.subitem}>
            <input
              type="text"
              value={currentSearchWord}
              onChange={(e) => setCurrentSearchWord(e.target.value)}
              className={styles.searchInput}
              list="wordData"
              placeholder="FREE WORD  "
            />
            <datalist id="wordData">
              {words.map((wordObj, index) => (
                <option key={index} value={wordObj.word}>
                  {wordObj.word}
                </option>
              ))}
            </datalist>
            <button onClick={handleAddSearchWord} className={styles.button}>
              +
            </button>
          </div>

          <div className={styles.subitem}>
            <input
              value={legislationName}
              onChange={handleLegislationChange}
              className={styles.searchInput}
              list="data"
              placeholder="ACT"
            />
            <datalist id="data">
              {legislationNames.map((name, index) => (
                <option key={index} value={name.legislationName}>
                  {name.legislationName}
                </option>
              ))}
            </datalist>
            <button className={styles.button} onClick={handleAddAct}>
              +
            </button>
          </div>
          <div className={styles.subitem}>
            <input
              type="text"
              placeholder="SECTION"
              value={sectionName}
              onChange={handleSectionChange}
              className={styles.searchInput}
              list="datasection"
            />
            <datalist id="datasection">
              {sectionList.map((sec, index) => (
                <option key={index} value={sec.legislationSectionCombined}>
                  {" "}
                  {/*legislationSectionPrefix + legislationSectionNo*/}
                  {sec.legislationSectionCombined}
                </option>
              ))}
            </datalist>
            <button onClick={handleAddSection} className={styles.button}>
              +
            </button>
          </div>
          <div className={styles.subitem}>
            <input
              list="datasubsection"
              type="text"
              placeholder="SUBSECTION"
              value={subsectionName}
              onChange={(e) => setSubsectionName(e.target.value)}
              className={styles.searchInput}
            />
            <datalist id="datasubsection">
              {subsectionList.map((subsec, index) => (
                <option key={index} value={subsec.legislationSubSectionName}>
                  {subsec.legislationSubSectionName}
                </option>
              ))}
            </datalist>

            <button onClick={handleAddSubsection} className={styles.button}>
              +
            </button>
          </div>
          <div className={styles.subitem}>
            <input
              list="data-topic"
              type="text"
              placeholder="TOPIC"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className={styles.searchInput}
            />
            <datalist id="data-topic">
              {topicList.map((name, index) => (
                <option key={index} value={name.topicName}>
                  {name.topicName}
                </option>
              ))}
            </datalist>
            <button onClick={handleAddTopic} className={styles.button}>
              +
            </button>
          </div>
          <div className={styles.subitem}>
            <input
              list="data-j"
              type="text"
              placeholder="JUDGE"
              value={judgeName}
              onChange={(e) => setJudgeName(e.target.value)}
              className={styles.searchInput}
            />
            <datalist id="data-j">
              {judgeList.map((jname, index) => (
                <option key={index} value={jname.judgeName}>
                  {jname.judgeName}
                </option>
              ))}
            </datalist>
            <button onClick={handleAddJudge} className={styles.button}>
              +
            </button>
          </div>
          <div className={styles.subitem}>
            <input
              list="advocateList"
              type="text"
              placeholder="ADVOCATE"
              value={advocateName}
              onChange={(e) => setAdvocateName(e.target.value)}
              className={styles.searchInput}
            />{" "}
            <datalist id="advocateList">
              {advocateList.map((name, index) => (
                <option key={index} value={name.advocateName}>
                  {name.advocateName}{" "}
                </option>
              ))}
            </datalist>
            <button onClick={handleAddAdvocate} className={styles.button}>
              +
            </button>
          </div>
          <div
            className={
              isFilterPanelOpen
                ? styles.combinedResultsMinimized
                : styles.combinedResults
            }
          >
            {!isFilterPanelOpen && (
              <>
                {acts.map((act, index) => (
                  <div key={index} className={styles.addedItem}>
                    {act}
                    <button
                      className={styles.button}
                      onClick={() => handleRemoveItem(index, setActs)}
                    >
                      -
                    </button>
                  </div>
                ))}
                {searchWords.map((word, index) => (
                  <div key={index} className={styles.addedItem}>
                    {word}
                    <button
                      className={styles.button}
                      onClick={() => handleRemoveItem(index, setSearchWords)}
                    >
                      -
                    </button>
                  </div>
                ))}
                {sections.map((sectionObj, index) => (
                  <div key={index} className={styles.addedItem}>
                    {sectionObj.section} of {sectionObj.act}
                    <button
                      className={styles.button}
                      onClick={() => handleRemoveItem(index, setSections)}
                    >
                      -
                    </button>
                  </div>
                ))}
                {subsections.map((subsectionObj, index) => (
                  <div key={index} className={styles.addedItem}>
                    {subsectionObj.subsection} of {subsectionObj.section} of{" "}
                    {subsectionObj.act}
                    <button
                      className={styles.button}
                      onClick={() => handleRemoveItem(index, setSubsections)}
                    >
                      -
                    </button>
                  </div>
                ))}
                {topics.map((topic, index) => (
                  <div key={index} className={styles.addedItem}>
                    {topic}
                    <button
                      className={styles.button}
                      onClick={() => handleRemoveItem(index, setTopics)}
                    >
                      -
                    </button>
                  </div>
                ))}
                {judges.map((judge, index) => (
                  <div key={index} className={styles.addedItem}>
                    {judge}
                    <button
                      className={styles.button}
                      onClick={() => handleRemoveItem(index, setJudges)}
                    >
                      -
                    </button>
                  </div>
                ))}
                {advocates.map((advocate, index) => (
                  <div key={index} className={styles.addedItem}>
                    {advocate}
                    <button
                      className={styles.button}
                      onClick={() => handleRemoveItem(index, setAdvocates)}
                    >
                      -
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        <div className={styles.BottomItems}>
          <div>
            <button
              className={styles.Searchbutton}
              onClick={handleAdvancedSearch}
            >
              Search
            </button>
          </div>
          <div>
            <button className={styles.Clearbutton} onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SidePanel;
