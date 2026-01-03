import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./JudgesProfile.module.css"; // Use appropriate styles or create new ones

function JudgeLayout() {
  const [judges, setJudges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJudges = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`http://61.246.67.74:4001/api/uat/searchJudges`, {
          params: { term: searchTerm || "hon" }, // Default search term if searchTerm is empty
        });
        setJudges(response.data);
      } catch (error) {
        setError("Error fetching judges");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJudges();
  }, [searchTerm]);

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className={styles.contentContainer}>
      <section className={styles.Upper}>
        <div className={styles.col}>
          <div className={styles.Title}>Judges Profile</div>
          <div className={styles.Sort}>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className={styles.searchIcon}
            >
              <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
            </svg>
          </div>
          <div className={styles.searchresults}></div>
        </div>
      </section>
      <section className={styles.Lower}>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : judges.length === 0 ? (
          <div>No judges found</div>
        ) : (
          judges.map((judge, index) => (
            <Link
              to={`/judge-read/${judge.judgesFile}`}
              key={judge.judgesId}
              className={index % 2 === 0 ? styles.ArticleGrey : styles.Article}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.articleHeading}>
                {judge.judgesName}
              </div>
              <div className={styles.WDwrapper}>
                <div className={styles.writer}>{judge.judgesAuthor}</div>
                <div className={styles.date}>{judge.judgesDateTime}</div>
              </div>
              <div className={styles.subtext}>
                {judge.judgesCitation}
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}

export default JudgeLayout;
