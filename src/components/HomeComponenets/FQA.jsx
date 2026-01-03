import React, { useState } from 'react';
import styles from './FQA.module.css';

const FQA = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const questions = [
    {
      id: 1,
      question: 'How do I signup?',
      answer: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    },
    {
      id: 2,
      question: 'How do I get started?',
      answer: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    },
    {
      id: 3,
      question: 'Do you guys have cash on delivery?',
      answer: 'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    },
  ];

  const handleQuestionClick = (id) => {
    if (selectedQuestion === id) {
      setSelectedQuestion(null);
    } else {
      setSelectedQuestion(id);
    }
  };

return (
  <div>
    <h2 className={styles.title}>Frequently Asked Questions</h2>
    <div className={styles.faqContainer}>
      <div className={styles.questionsContainer}>
        {questions.map((q) => (
          <div key={q.id} className={styles.question} onClick={() => handleQuestionClick(q.id)}>
            <h3>{q.question}</h3>
            {selectedQuestion === q.id && (
              <div className={styles.answer}>{q.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default FQA;
