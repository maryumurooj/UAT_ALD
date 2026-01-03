import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./Home.module.css";
import SupremeCourt from "../assets/Supremecourt.png";
import HighCourtPhoto from "../assets/Highcourt.png";
import THighCourtPhoto from "../assets/oie_xMU8o4kn68SP.png";
import { Button, Container, Row, Col } from "react-bootstrap";
import { useAuth } from "./../services/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Install axios if not already done (npm install axios)

function Home() {
  const textRef = useRef(null); // Ref for the text element
  const box4Ref = useRef(null); // Ref for box4
  // Function to truncate text
  const truncateText = (element, maxHeight) => {
    const originalText = element.innerText;
    let truncatedText = originalText;

    // Temporarily remove ellipsis to measure the actual text height
    element.innerText = truncatedText;

    // Check if the text overflows the container
    while (element.scrollHeight > maxHeight && truncatedText.length > 0) {
      // Remove the last word
      truncatedText = truncatedText.replace(/\s+\S*$/, "");
      element.innerText = truncatedText + "...";
    }
  };

  // Run the truncation function on mount and window resize
  useEffect(() => {
    const handleResize = () => {
      if (box4Ref.current && textRef.current) {
        // Calculate available space for the text
        const box4Height = box4Ref.current.clientHeight;
        const otherContentHeight = Array.from(box4Ref.current.children)
          .filter((child) => child !== textRef.current)
          .reduce((sum, child) => sum + child.clientHeight, 0);

        const availableHeight = box4Height - otherContentHeight;

        // Truncate the text if it exceeds the available height
        truncateText(textRef.current, availableHeight);
      }
    };

    // Initial truncation
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { user, subscriptionStatus } = useAuth();
  const navigate = useNavigate();

  const boxesRef = useRef([]); // References for box1, box2, box3, box4

  const [boxVisible, setBoxVisible] = useState(false);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const [judgments, setJudgments] = useState([]);
  useEffect(() => {
    const fetchJudgments = async () => {
      try {
        const response = await fetch(
          "http://61.246.67.74:4001/api/uat/latest-judgments2"
        );
        const data = await response.json();
        setJudgments(data);
      } catch (error) {
        console.error("Error fetching judgments:", error);
      }
    };

    fetchJudgments();
  }, []);

  const section2Ref = useRef(null); // Reference for Section 2
  const section3Ref = useRef(null); // Reference for Section 2

  // Add this state near your other useState declarations
  // Add these near your other useRef and useState declarations
  const [showScrollBanner, setShowScrollBanner] = useState(true);
  const prevScrollY = useRef(0);

  // Replace your existing scroll effect with this:
  useEffect(() => {
    const handleScroll = () => {
      console.log("Current scroll:", window.scrollY);
      const currentScrollY = window.scrollY;

      // Always show if at top (with 10px buffer)
      if (currentScrollY < 10) {
        setShowScrollBanner(true);
      }
      // Hide if scrolled down more than 50px
      else if (currentScrollY > 50) {
        setShowScrollBanner(false);
      }
      // Show temporarily if scrolling up
      else if (currentScrollY < prevScrollY.current) {
        setShowScrollBanner(true);
      }

      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2, // Trigger when 20% of the target is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setBoxVisible(true); // Trigger animation on entry
        } else {
          setBoxVisible(false); // Reset animation on exit
        }
      });
    }, observerOptions);

    if (section2Ref.current) {
      observer.observe(section2Ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate a data fetch
    const fetchData = async () => {
      setLoading(true);
      setTimeout(() => {
        setData("Here is your loaded content!");
        setLoading(false);
      }, 3000); // Simulates 3 seconds of loading
    };

    fetchData();
  }, []);

  const handleCitationClick = (citation) => {
    if (citation) {
      localStorage.setItem("referredCitation", citation);
    }
    navigate("/index");
  };
  // Add this function to handle the scroll action
  const scrollToNextSection = () => {
    section3Ref.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const booksWrapperRef = useRef(null);
  let scrollInterval = useRef(null);

  useEffect(() => {
    const booksWrapper = booksWrapperRef.current;
    if (!booksWrapper) return;

    let scrollSpeed = 3; // Adjust scroll speed
    let scrollDirection = 1; // 1 for right, -1 for left

    const startScrolling = () => {
      scrollInterval.current = setInterval(() => {
        booksWrapper.scrollLeft += scrollSpeed * scrollDirection;

        // Loop effect when reaching end
        if (booksWrapper.scrollLeft >= booksWrapper.scrollWidth / 2) {
          booksWrapper.scrollLeft = 0;
        }
      }, 20);
    };

    const stopScrolling = () => {
      clearInterval(scrollInterval.current);
    };

    // Start scrolling on mount
    startScrolling();

    // Pause on hover, resume on leave
    booksWrapper.addEventListener("mouseenter", stopScrolling);
    booksWrapper.addEventListener("mouseleave", startScrolling);

    return () => {
      clearInterval(scrollInterval.current); // Cleanup on unmount
      booksWrapper.removeEventListener("mouseenter", stopScrolling);
      booksWrapper.removeEventListener("mouseleave", startScrolling);
    };
  }, []);

  const BookModal = ({ book, onClose }) => {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
          <img
            src={`http://61.246.67.74:4000${book.image}`}
            alt={book.alt}
            className={styles.modalBookImage}
          />
          <div className={styles.modalDetails}>
            <h2>{book.book_name}</h2>
            <div className={styles.bookInfo}>
              <p className={styles.edition}>{book.edition}</p>
              <p className={styles.price}>₹{book.price}</p>
            </div>

            <div className={styles.purchaseOptions}>
              <div className={styles.storeInfo}>
                <p className={styles.address}>
                  8374389998, 8374289998
                  <br />
                  <br />
                  21-1-990 Opp. High Court Gate no. 5 Ghansi Bazaar
                  <br />
                  Hyderabad Telangana 500066
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.home}>
      <div className={styles.layer1}>
        <div className={styles.scrollCue} onClick={scrollToNextSection}>
          <div className={styles.chevron} />
          <div className={styles.chevron} />
          <div className={styles.chevron} />
        </div>
        // Add to component
      </div>

      <section
        ref={section2Ref}
        className={`${styles.section2} ${styles.sectionscroll}`}
      >
        <div
          className={`${styles.scrollBar} ${
            showScrollBanner ? styles.visible : ""
          }`}
          onClick={scrollToNextSection}
        >
          Explore Our Legal Publications
          <div className={styles.scrollBarArrow} />
        </div>
        {/* Rest of Section 2 content */}
        <div className={styles.content}>
          <div className={styles.LeftCol}>
            <div
              ref={(el) => (boxesRef.current[1] = el)}
              className={`${styles.box3} ${
                boxVisible ? styles.boxVisible : ""
              }`}
            >
              <h2>Newly Added Judgments</h2>
              <div className={styles.judgmentsList}>
                {judgments.map((judgment) => (
                  <div
                    key={judgment.judgmentId}
                    className={styles.judgment}
                    onClick={() =>
                      handleCitationClick(
                        judgment.newCitation || judgment.judgmentCitation
                      )
                    } // Box-wide click handler
                    style={{ cursor: "pointer" }} // Ensure the whole box is clickable
                  >
                    <p className={styles.topline}>
                      <span className={styles.citation}>
                        {judgment.newCitation || judgment.judgmentCitation}
                      </span>
                      {judgment.shortNotePreview && (
                        <span className={styles.preview}>
                          {judgment.shortNotePreview}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.RightCol}>
            <div
              ref={(el) => (boxesRef.current[2] = el)}
              className={`${styles.box2} ${
                boxVisible ? styles.boxVisible : ""
              }`}
            >
              <Slider {...settings}>
                <div className={styles.imgbox}>
                  <img
                    className={styles.image}
                    src={SupremeCourt}
                    alt="Supreme Court"
                  />
                </div>
                <div className={styles.imgbox}>
                  <img
                    className={styles.image}
                    src={HighCourtPhoto}
                    alt="High Court of Andhra Pradesh"
                  />
                </div>
                <div className={styles.imgbox}>
                  <img
                    className={styles.image}
                    src={THighCourtPhoto}
                    alt="High Court of Andhra Pradesh"
                  />
                </div>
              </Slider>
            </div>
            <div
              ref={box4Ref}
              className={`${styles.box4} ${
                boxVisible ? styles.boxVisible : ""
              }`}
              onClick={() => navigate("/subscription-tier")}
            >
              <h2 className="mb-0">Discover Our Resources</h2>
              <p ref={(el) => (textRef.current = el)}>
                ALD Online is a user-friendly and efficient legal research
                platform designed for busy lawyers, the Bench, and the Bar. It
                provides fast and accurate results, helps track binding
                authorities, assists in case law research, and verifies the
                current status of judgments. Start your free trial today! <br />
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
