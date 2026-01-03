import React from "react";
import {
  Calendar,
  Users,
  Award,
  BookOpen,
  Database,
  Search,
} from "lucide-react";
import styles from "./Aboutus.module.css";
import Footer from "../components/MainFooter/MainFooter";

const AboutUs = () => {
  const [hoveredCards, setHoveredCards] = React.useState({});

  const handleCardHover = (cardId, isHovered) => {
    setHoveredCards((prev) => ({
      ...prev,
      [cardId]: isHovered,
    }));
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <header className={styles.header}>
            <div className={styles.headerGlow}></div>
            <h1 className={styles.title}>ANDHRA LEGAL DECISIONS</h1>
            <p className={styles.subtitle}>
              Leading the legal fraternity with comprehensive legal reporting
              and digital innovation since 1995
            </p>
          </header>

          <section
            className={`${styles.glassCard} ${
              hoveredCards.journey ? styles.glassCardHover : ""
            }`}
            onMouseEnter={() => handleCardHover("journey", true)}
            onMouseLeave={() => handleCardHover("journey", false)}
          >
            <h2 className={styles.sectionTitle}>
              <div className={styles.iconWrapper}>
                <Calendar size={28} />
              </div>
              Our Journey
            </h2>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>1995</div>
                <div className={styles.timelineContent}>
                  <strong className={styles.strong}>The Beginning:</strong>{" "}
                  Andhra Legal Decisions (Fortnightly) was launched through the
                  business enterprise of Mr. Hasin Ahmed and the editorial
                  expertise of Shree K.V. Ramana Rao, creating a new star in the
                  legal firmament of Andhra Pradesh.
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>1996</div>
                <div className={styles.timelineContent}>
                  <strong className={styles.strong}>Expansion:</strong> "Andhra
                  Legal Decisions — Criminal (Monthly)" was launched to serve
                  the specialized needs of lawyers practicing on the criminal
                  side.
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>Later</div>
                <div className={styles.timelineContent}>
                  <strong className={styles.strong}>
                    Comprehensive Coverage:
                  </strong>{" "}
                  "All India Law Digest with Statutory Diary and Readers Forum
                  (Monthly)" was introduced to keep subscribers updated with
                  decisions from High Courts across India and statutory changes.
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>2004</div>
                <div className={styles.timelineContent}>
                  <strong className={styles.strong}>
                    Milestone & Transition:
                  </strong>{" "}
                  ALD celebrated its 10th Anniversary, marking a decade of
                  success. However, the year ended with the sudden demise of
                  founder-editor Shree K.V. Ramana Rao, leading to a
                  reconstituted editorial board.
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>2012</div>
                <div className={styles.timelineContent}>
                  <strong className={styles.strong}>Digital Revolution:</strong>{" "}
                  ALD went electronic with comprehensive DVD software containing
                  all judgments from 1995-2012, revolutionizing legal research
                  with advanced search capabilities.
                </div>
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>2025</div>
                <div className={styles.timelineContent}>
                  <strong className={styles.strong}>Web Revolution:</strong> ALD
                  stepped into the digital future with the launch of this very
                  website you're browsing — a subscription-based platform
                  designed to make legal research easier, faster, and smarter.
                  Packed with legacy and law, this marks a new chapter in
                  our journey of service to the legal fraternity.
                </div>
              </div>
            </div>
          </section>

          <section
            className={`${styles.glassCard} ${
              hoveredCards.publications ? styles.glassCardHover : ""
            }`}
            onMouseEnter={() => handleCardHover("publications", true)}
            onMouseLeave={() => handleCardHover("publications", false)}
          >
            <h2 className={styles.sectionTitle}>
              <div className={styles.iconWrapper}>
                <BookOpen size={28} />
              </div>
              Our Publications
            </h2>
            <div className={styles.publicationsGrid}>
              <div className={styles.publicationCard}>
                <h3 className={styles.featureTitle}>
                  Andhra Legal Decisions (Civil)
                </h3>
                <p className={styles.cardText}>
                  Fortnightly publication covering civil law matters with
                  comprehensive reporting and analysis.
                </p>
              </div>
              <div className={styles.publicationCard}>
                <h3 className={styles.featureTitle}>
                  Andhra Legal Decisions (Criminal)
                </h3>
                <p className={styles.cardText}>
                  Monthly journal dedicated to criminal law practitioners with
                  specialized coverage.
                </p>
              </div>
              <div className={styles.publicationCard}>
                <h3 className={styles.featureTitle}>All India Law Digest</h3>
                <p className={styles.cardText}>
                  Monthly digest with statutory diary and readers forum covering
                  pan-India legal developments.
                </p>
              </div>
            </div>

            <div className={styles.highlight}>
              <strong>Volume Achievement:</strong> From 1995 to 2012, ALD has
              produced over 156 volumes of substantial legal content, generating
              more than ten thousand printed pages annually across all
              publications.
            </div>
          </section>

          <section
            className={`${styles.glassCard} ${
              hoveredCards.team ? styles.glassCardHover : ""
            }`}
            onMouseEnter={() => handleCardHover("team", true)}
            onMouseLeave={() => handleCardHover("team", false)}
          >
            <h2 className={styles.sectionTitle}>
              <div className={styles.iconWrapper}>
                <Users size={28} />
              </div>
              Our Leadership Team
            </h2>
            <div className={styles.teamGrid}>
              <div className={styles.teamCard}>
                <div className={styles.teamName}>Mr. Waseem Ahmed</div>
                <div className={styles.teamRole}>Managing Editor</div>
              </div>
              <div className={styles.teamCard}>
                <div className={styles.teamName}>Mr. R. Swaroop</div>
                <div className={styles.teamRole}>Editor</div>
              </div>
              <div className={styles.teamCard}>
                <div className={styles.teamName}>Mr. Haseeb Ahmed</div>
                <div className={styles.teamRole}>Marketing Manager</div>
              </div>
              <div className={styles.teamCard}>
                <div className={styles.teamName}>Mr. Abdul Muneem</div>
                <div className={styles.teamRole}>
                  Editorial Operations & Type Setting Expert
                </div>
              </div>
            </div>

            <div className={styles.highlight}>
              <strong>Founding Legacy:</strong> We honor the memory and vision
              of our founder-editor <strong>Shree K.V. Ramana Rao</strong>,
              whose unrelenting efforts and single-minded devotion carved out a
              niche for ALD in the legal pantheon.
            </div>
          </section>

          <section
            className={`${styles.glassCard} ${
              hoveredCards.digital ? styles.glassCardHover : ""
            }`}
            onMouseEnter={() => handleCardHover("digital", true)}
            onMouseLeave={() => handleCardHover("digital", false)}
          >
            <h2 className={styles.sectionTitle}>
              <div className={styles.iconWrapper}>
                <Database size={28} />
              </div>
              Digital Innovation: ALD Electronic
            </h2>
            <p className={styles.sectionText}>
              Recognizing the challenges faced by busy lawyers in our
              precedent-bound judicial system, we revolutionized legal research
              by going digital. Our comprehensive software solution addresses
              the time-consuming process of searching through thousands of law
              report volumes.
            </p>

            <div className={styles.featuresGrid}>
              <div
                className={`${styles.featureCard} ${
                  hoveredCards.feature1 ? styles.featureCardHover : ""
                }`}
                onMouseEnter={() => handleCardHover("feature1", true)}
                onMouseLeave={() => handleCardHover("feature1", false)}
              >
                <div className={styles.featureTitle}>
                  Comprehensive Database
                </div>
                <p className={styles.cardText}>
                  All judgments with full text and head-notes from ALD Civil
                  (1995-2012) and ALD Criminal (1996-2012), plus articles and
                  statutory content.
                </p>
              </div>
              <div
                className={`${styles.featureCard} ${
                  hoveredCards.feature2 ? styles.featureCardHover : ""
                }`}
                onMouseEnter={() => handleCardHover("feature2", true)}
                onMouseLeave={() => handleCardHover("feature2", false)}
              >
                <div className={styles.featureTitle}>
                  Advanced Search Engine
                </div>
                <p className={styles.cardText}>
                  Efficient search by topic, statute, words/phrases, citation,
                  party name, judge's name, and advocate's name with multiple
                  search options.
                </p>
              </div>
              <div
                className={`${styles.featureCard} ${
                  hoveredCards.feature3 ? styles.featureCardHover : ""
                }`}
                onMouseEnter={() => handleCardHover("feature3", true)}
                onMouseLeave={() => handleCardHover("feature3", false)}
              >
                <div className={styles.featureTitle}>
                  User-Friendly Interface
                </div>
                <p className={styles.cardText}>
                  Simple program designed with a layman approach, featuring
                  bookmarking, case history, and customized printing
                  capabilities.
                </p>
              </div>
              <div
                className={`${styles.featureCard} ${
                  hoveredCards.feature4 ? styles.featureCardHover : ""
                }`}
                onMouseEnter={() => handleCardHover("feature4", true)}
                onMouseLeave={() => handleCardHover("feature4", false)}
              >
                <div className={styles.featureTitle}>Legal Intelligence</div>
                <p className={styles.cardText}>
                  Overruled judgments highlighted, cases relied upon, followed,
                  dissented and distinguished are listed with hyperlinks to
                  referred case law.
                </p>
              </div>
            </div>
          </section>

          <section
            className={`${styles.glassCard} ${
              hoveredCards.commitment ? styles.glassCardHover : ""
            }`}
            onMouseEnter={() => handleCardHover("commitment", true)}
            onMouseLeave={() => handleCardHover("commitment", false)}
          >
            <h2 className={styles.sectionTitle}>
              <div className={styles.iconWrapper}>
                <Award size={28} />
              </div>
              Our Commitment
            </h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>Editorial Excellence</div>
                <p className={styles.cardText}>
                  Distinct pattern of head-noting and indexing that has proved
                  to be more reader-friendly and has earned recognition from
                  contemporaries.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>Quality Assurance</div>
                <p className={styles.cardText}>
                  Dedicated team of proof-readers ensuring accuracy of text,
                  supported by efficient administrative staff and office support
                  system.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>Wide Reach</div>
                <p className={styles.cardText}>
                  Comprehensive sales network of dealers and agents ensuring our
                  journals reach subscribers in every nook and corner of the
                  state.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>Continuous Innovation</div>
                <p className={styles.cardText}>
                  Periodic software updates, technical support, and
                  compatibility with all operating systems including modern
                  Windows versions.
                </p>
              </div>
            </div>
          </section>

          <section
            className={`${styles.glassCard} ${
              hoveredCards.why ? styles.glassCardHover : ""
            }`}
            onMouseEnter={() => handleCardHover("why", true)}
            onMouseLeave={() => handleCardHover("why", false)}
          >
            <h2 className={styles.sectionTitle}>
              <div className={styles.iconWrapper}>
                <Search size={28} />
              </div>
              Why Choose ALD?
            </h2>
            <p className={styles.sectionText}>
              With the pragmatic approach of our editorial team, the redesigned
              ALD has set new trends in legal journalism. Our publications have
              not only been showered with laurels and applause by regular
              patrons but have been found worthy of emulation by contemporaries.
            </p>
            <p className={styles.sectionText}>
              We continue to evolve and make our content more relevant to the
              contemporary needs of the legal fraternity, combining traditional
              excellence with modern digital innovation to serve the legal
              community effectively.
            </p>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
