import React from "react";
import styles from "./ArticleLayout.module.css";
function ArticleLayout() {
  // Define contact information and icons in an array for better structure

  return (
    <div className={styles.contentContainer}>
      <section className={styles.Upper}>
        <div className={styles.col}>
          <div className={styles.Title}>Articles</div>
          <div className={styles.Sort}>
            <div>Sort by</div>
            <div>
              <select name="cars" id="cars">
                <option value="volvo">Publication Date</option>
                <option value="saab">Author</option>
                <option value="mercedes">Title</option>
                <option value="audi">Content</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.col}>
          <div className={styles.search}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="What are you looking for?"
            />
          </div>
          <div className={styles.searchresults}>Results Found</div>
        </div>
      </section>
      <section className={styles.Lower}>
        <div className={styles.ArticleGrey}>
          <div className={styles.articleHeading}>
            A Study Of New Section 6 of Hindu Succession Act 1966 As Introduced
            By Hindu ...
          </div>
          <div className={styles.WDwrapper}>
            <div className={styles.writer}>Damodar Rao Advocate</div>
            <div className={styles.date}>30 November 2013</div>
          </div>
          <div className={styles.subtext}>
            The majority of private sector, nonunion workers and e-commerce
            transactions are subject to arbitration agreements, which require
            litigating disputes in private, often confidential, proceedings,
            rather than in courtrooms. Paired with waivers of the right to
            bring… Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet
            tempor nunc maecenas cras ipsum, lorem massa lacus...
          </div>
        </div>
        <div className={styles.Article}>
          <div className={styles.articleHeading}>
            A Study Of New Section 6 of Hindu Succession Act 1966 As Introduced
            By Hindu ...
          </div>
          <div className={styles.WDwrapper}>
            <div className={styles.writer}>Damodar Rao Advocate</div>
            <div className={styles.date}>30 November 2013</div>
          </div>
          <div className={styles.subtext}>
            The majority of private sector, nonunion workers and e-commerce
            transactions are subject to arbitration agreements, which require
            litigating disputes in private, often confidential, proceedings,
            rather than in courtrooms. Paired with waivers of the right to
            bring… Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet
            tempor nunc maecenas cras ipsum, lorem massa lacus...
          </div>
        </div>
        <div className={styles.ArticleGrey}>
          <div className={styles.articleHeading}>
            A Study Of New Section 6 of Hindu Succession Act 1966 As Introduced
            By Hindu ...
          </div>
          <div className={styles.WDwrapper}>
            <div className={styles.writer}>Damodar Rao Advocate</div>
            <div className={styles.date}>30 November 2013</div>
          </div>
          <div className={styles.subtext}>
            The majority of private sector, nonunion workers and e-commerce
            transactions are subject to arbitration agreements, which require
            litigating disputes in private, often confidential, proceedings,
            rather than in courtrooms. Paired with waivers of the right to
            bring… Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet
            tempor nunc maecenas cras ipsum, lorem massa lacus...
          </div>
        </div>
        <div className={styles.Article}>
          <div className={styles.articleHeading}>
            A Study Of New Section 6 of Hindu Succession Act 1966 As Introduced
            By Hindu ...
          </div>
          <div className={styles.WDwrapper}>
            <div className={styles.writer}>Damodar Rao Advocate</div>
            <div className={styles.date}>30 November 2013</div>
          </div>
          <div className={styles.subtext}>
            The majority of private sector, nonunion workers and e-commerce
            transactions are subject to arbitration agreements, which require
            litigating disputes in private, often confidential, proceedings,
            rather than in courtrooms. Paired with waivers of the right to
            bring… Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet
            tempor nunc maecenas cras ipsum, lorem massa lacus...
          </div>
        </div>
      </section>
    </div>
  );
}

export default ArticleLayout;
