import React from "react";
function ArticleLayout() {
  // Define contact information and icons in an array for better structure


  return (
      <div className={styles.contentContainer}>
        <section className={styles.Upper}>
        <div className={styles.col}>
          <div className={styles.Title}>Articles</div>
          <div className={styles.Sort}>
           
        </div>
        <div className={styles.col}>

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className={styles.searchIcon}
            >
              <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
            </svg>
          </div>
          <div className={styles.searchresults}>
           </div>
        </div>
        </section>
        <section className={styles.Lower}>
          <div className={styles.ArticleGrey}>
          <div className={styles.articleHeading}>
            A Study Of New Section 6 of Hindu Succession Act 1966 As Introduced By Hindu ...
          </div>
         <div className={styles.WDwrapper}>
              <div className={styles.writer}>
              Damodar Rao Advocate
              </div>
              <div className={styles.date}>
              30 November 2013
              </div>
          </div>
            <div className={styles.subtext}>
              The majority of private sector, nonunion workers and e-commerce transactions are subject to arbitration agreements, which require litigating disputes in private, often confidential, proceedings, rather than in courtrooms. Paired with waivers of the right to bring… Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet tempor nunc maecenas cras ipsum, lorem massa lacus...
            </div>
          </div>
          <div className={styles.Article}>
          <div className={styles.articleHeading}>
            A Study Of New Section 6 of Hindu Succession Act 1966 As Introduced By Hindu ...
          </div>
          <div className={styles.WDwrapper}>
              <div className={styles.writer}>
              Damodar Rao Advocate
              </div>
              <div className={styles.date}>
              30 November 2013
              </div>
          </div>
            <div className={styles.subtext}>
              The majority of private sector, nonunion workers and e-commerce transactions are subject to arbitration agreements, which require litigating disputes in private, often confidential, proceedings, rather than in courtrooms. Paired with waivers of the right to bring… Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet tempor nunc maecenas cras ipsum, lorem massa lacus...
            </div>
          </div>
          <div className={styles.ArticleGrey}>
            <div className={styles.articleHeading}>
              A Study Of New Section 6 of Hindu Succession Act 1966 As Introduced By Hindu ...
            </div>
            <div className={styles.WDwrapper}>
                <div className={styles.writer}>
                Damodar Rao Advocate
                </div>
                <div className={styles.date}>
                30 November 2013
                </div>
            </div>
              <div className={styles.subtext}>
                The majority of private sector, nonunion workers and e-commerce transactions are subject to arbitration agreements, which require litigating disputes in private, often confidential, proceedings, rather than in courtrooms. Paired with waivers of the right to bring… Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet tempor nunc maecenas cras ipsum, lorem massa lacus...
              </div>
          </div>
          <div className={styles.Article}>
            <div className={styles.articleHeading}>
              A Study Of New Section 6 of Hindu Succession Act 1966 As Introduced By Hindu ...
            </div>
            <div className={styles.WDwrapper}>
                <div className={styles.writer}>
                Damodar Rao Advocate
                </div>
                <div className={styles.date}>
                30 November 2013
                </div>
            </div>
              <div className={styles.subtext}>
                The majority of private sector, nonunion workers and e-commerce transactions are subject to arbitration agreements, which require litigating disputes in private, often confidential, proceedings, rather than in courtrooms. Paired with waivers of the right to bring… Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet tempor nunc maecenas cras ipsum, lorem massa lacus...
              </div>
          </div>

        </section>

      </div>



  );
}

export default ArticleLayout;