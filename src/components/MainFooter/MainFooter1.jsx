import styles from "./MainFooter.module.css";

const MainFooter = () => {
  return (
<div className="footercontainer">

    <div className={styles.footer}>
      <div className={styles.footerChild} />
      <section className={styles.navigationArea}>
        <div className={styles.aldParent}>

          <div className={styles.internalResources}>
            <div className={styles.divider} />
            <div className={styles.verticalNavigation}>
              <div className={styles.resourceTitles}>
                <div className={styles.home}>Home</div>
                <div className={styles.about}>About</div>
                <div className={styles.contacts}>Contacts</div>
                <div className={styles.help}>Help</div>
                <div className={styles.updates}>Updates</div>
              </div>
            </div>
          </div>
        </div>
       </section>
      <div className={styles.informationColumn}>

        <div className={styles.resourcesRowParent}>
          <div className={styles.resourcesRow}>
            <div className={styles.divider} />
            <div className={styles.indexParent}>
              <div className={styles.index1}>Index</div>
              <div className={styles.judges}>Case Finder</div>
              <div className={styles.updates1}>Statutes</div>
              <div className={styles.statutes}>Articles</div>
              <div className={styles.articles}>Judges</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.contactArea}>

        <div className={styles.contactDetails}>
          <div className={styles.divider} />
          <div className={styles.emailInfo}>
              <div className={styles.emailAddress}>8374289998, 8374389998</div>
              <div className={styles.salesaldonlinein}>sales@aldonline.in</div>
              <div className={styles.address}>Opp High court, Gateno5, Hyderabad.</div>
          </div>
        </div>
      </div>
    </div>
</div>
  );
};

export default MainFooter;


