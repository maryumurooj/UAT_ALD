import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, Mail, Clock } from 'lucide-react';
import styles from './FAQ.module.css';
import Footer from "../components/MainFooter/MainFooter";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "What is ALD Online?",
      answer: "ALD Online is a comprehensive legal research platform that provides access to judgments, statutes, and headnotes across various Indian courts. It's designed for lawyers, law students, and legal professionals who need quick and organized legal insights."
    },
    {
      question: "Who can use ALD Online?",
      answer: "Anyone interested in legal research — including advocates, judges, law firms, and students — can use ALD Online. Some content is free, but full access requires a subscription."
    },
    {
      question: "What do I get with a subscription?",
      answer: "A subscription grants: Full access to headnotes and case law summaries, Searchable database of statutes and judgments, Tools for saving, annotating, and printing cases, Regularly updated legal content."
    },
    {
      question: "How do I subscribe to ALD Online?",
      answer: "You can subscribe by visiting the Subscription Page and choosing a plan that suits your needs. Payments can be made securely online."
    },
    {
      question: "Can I try ALD Online before subscribing?",
      answer: "Yes, we offer a limited free trial so you can explore basic features before deciding to subscribe."
    },
    {
      question: "What happens if my subscription expires?",
      answer: "Once your subscription expires, access to premium content will be restricted. You can renew your plan anytime to regain full access."
    },
    {
      question: "Is there a refund policy?",
      answer: "We do not offer refunds once a subscription is active. Please use the trial period to evaluate if the platform suits your needs."
    },
    {
      question: "I forgot my password. What should I do?",
      answer: "Click on the 'Forgot Password' link on the login page to reset your password. If the issue persists, contact us at salesaldonline@gmail.com."
    },
    {
      question: "Can I access ALD Online on my phone or tablet?",
      answer: "Yes, ALD Online is fully responsive and can be accessed via any modern browser on your phone, tablet, or computer."
    },
    {
      question: "Are there any discounts for group subscriptions?",
      answer: "Yes, we offer custom pricing for group or institutional users. Please contact us directly for bulk or multi-user license options."
    },
    {
      question: "How often is the content updated?",
      answer: "Our legal content is updated regularly to reflect the most recent judgments and changes in law."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach us via Email: salesaldonline@gmail.com or Phone: 83742 89998, 83743 89998. Support is available Monday–Saturday, 10 AM – 6 PM."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel anytime. However, the subscription will remain active until the end of your current billing cycle."
    },
    {
      question: "Do you offer printed versions of judgments or headnotes?",
      answer: "We currently focus on digital access. However, you can print any document you access through the platform using the built-in tools."
    },
    {
      question: "How secure is my data on ALD Online?",
      answer: "Your data is encrypted and securely stored. We prioritize your privacy and follow standard data protection practices."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={styles.faqcontainer}>
      <div className={styles.faqcontent}>
        <div className={styles.faqheader}>
          <h1 className={styles.faqtitle}>Frequently Asked Questions</h1>
          <p className={styles.faqsubtitle}>ALD Online  Your Legal Research Companion</p>
        </div>

        <div className={styles.faqlist}>
          {faqData.map((item, index) => (
            <div key={index} className={styles.faqitem}>
              <button
                className={styles.faqquestion}
                onClick={() => toggleAccordion(index)}
                ariaexpanded={activeIndex === index}
              >
                <span className={styles.questiontext}>{item.question}</span>
                <span className={styles.chevron}>
                  {activeIndex === index ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              </button>
              <div className={`${styles.faqanswer} ${activeIndex === index ? styles.active : ''}`}>
                <div className={styles.answercontent}>
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.contactsection}>
          <h2 className={styles.contacttitle}>Still have questions?</h2>
          <div className={styles.contactinfo}>
            <div className={styles.contactitem}>
              <Mail size={20} />
              <span>salesaldonline@gmail.com</span>
            </div>
            <div className={styles.contactitem}>
              <Phone size={20} />
              <span>83742 89998 | 83743 89998</span>
            </div>
            <div className={styles.contactitem}>
              <Clock size={20} />
              <span>Monday–Saturday, 10 AM – 6 PM</span>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default FAQ;