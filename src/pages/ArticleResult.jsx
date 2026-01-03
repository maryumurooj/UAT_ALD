import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "./ArticleResults.module.css";

function ArticleLayout() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Corrected here
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:4000/api/uat/search`,
          {
            params: { term: searchTerm },
          }
        );
        setArticles(response.data);
      } catch (error) {
        setError("Error fetching articles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [searchTerm]);

  // Define the handleSearchInputChange function
  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className={styles.contentContainer}>
      <section className={styles.Upper}>
        <div className={styles.col}>
          <div className={styles.Title}>Articles</div>
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
        ) : articles.length === 0 ? (
          <div>No articles found</div>
        ) : (
          articles.map((article, index) => (
            <Link
              to={`/article-read/${article.articlesFile}`}
              key={article.articlesId}
              className={index % 2 === 0 ? styles.ArticleGrey : styles.Article}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.articleHeading}>
                {article.articlesName}
              </div>
              <div className={styles.WDwrapper}>
                <div className={styles.writer}>{article.articlesAuthor}</div>
                <div className={styles.date}>{article.articlesDateTime}</div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}

export default ArticleLayout;
