import React from "react";
import styles from "./LatestBooks.module.css";
import image8 from "../../assets/image8.png";
import image10 from "../../assets/image10.png";
import image11 from "../../assets/image11.png";

const books = [
  {
    src: image8,
    alt: "Book 1",
    title: "Book Title 1",
    author: "Author Name",
    edition: "Edition 1",
    price: "Price 1",
  },
  {
    src: image10,
    alt: "Book 2",
    title: "Book Title 2",
    author: "Author Name",
    edition: "Edition 2",
    price: "Price 2",
  },
  {
    src: image11,
    alt: "Book 3",
    title: "Book Title 3",
    author: "Author Name",
    edition: "Edition 3",
    price: "Price 3",
  },
  {
    src: image8,
    alt: "Book 4",
    title: "Book Title 4",
    author: "Author Name",
    edition: "Edition 4",
    price: "Price 4",
  },
];

const Frame = () => {
  return (
    <div className={styles.frame}>
      <div className={styles.title}>Latest Books</div>
      <div className={styles.bookContainer}>
        {books.map((book, index) => (
          <div key={index} className={styles.book}>
            <img src={book.src} alt={book.alt} className={styles.bookImage} />
            <div className={styles.bookDescription}>
              <h3 className={styles.bookTitle}>{book.title}</h3>
              <div className={styles.bookInfo}>Author: {book.author}</div>
              <div className={styles.bookInfo}>{book.edition}</div>
              <div className={styles.bookInfo}>{book.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Frame;
