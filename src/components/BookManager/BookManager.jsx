import React, { useState, useEffect } from "react";
import styles from "./BookManager.module.css";
import { Button, Form } from "react-bootstrap";
import axios from "axios";

const BookManager = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]); // New state for filtered books
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [newBook, setNewBook] = useState({
    id: null,
    book_name: "",
    edition: "",
    price: 0.0,
    in_stock: false,
    image: null, // New field for storing selected file
  });

  const [isEditing, setIsEditing] = useState(false);

  const resetForm = () => {
    setNewBook({
      id: null,
      book_name: "",
      edition: "",
      price: 0.0,
      in_stock: false,
    });
    setIsEditing(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book => 
      book.book_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.edition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.price.toString().includes(searchTerm)
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://61.246.67.74:4000/api/books");
      if (response.data.success) {
        console.log(response.data.books);
        setBooks(response.data.books);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddOrUpdateBook = async () => {
    try {
      const formData = new FormData();
      formData.append("book_name", newBook.book_name);
      formData.append("edition", newBook.edition);
      formData.append("price", newBook.price);
      formData.append("in_stock", newBook.in_stock ? "true" : "false");
      if (newBook.image) {
        formData.append("image", newBook.image); // Append file
      }

      if (isEditing) {
        await axios.put(
          `http://61.246.67.74:4000/api/books/${newBook.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axios.post("http://61.246.67.74:4000/api/books", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchBooks();
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditBook = (book) => {
    setNewBook({ ...book });
    setIsEditing(true);
  };

  const handleToggleInStock = (id) => {
    axios
      .patch(`http://61.246.67.74:4000/api/books/${id}/toggle-in-stock`)
      .then((response) => {
        if (response.data.success) {
          fetchBooks();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`http://61.246.67.74:4000/api/books/${id}`);
        fetchBooks(); // Refresh the book list after deletion
        alert("Book deleted successfully");
      } catch (error) {
        console.error(error);
        alert("Failed to delete book");
      }
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewBook({ ...newBook, [name]: value });
  };

  return (
    <>
    

    <div className={styles.formcontainer}>
    <div className={styles.formwrapper}>
    <Form>
        <Form.Group controlId="image">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewBook({ ...newBook, image: e.target.files[0] })
            }
          />
        </Form.Group>

        <Form.Group controlId="book_name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={newBook.book_name}
            onChange={handleInputChange}
            name="book_name"
          />
        </Form.Group>

        <Form.Group controlId="edition">
          <Form.Label>Edition</Form.Label>
          <Form.Control
            type="text"
            value={newBook.edition}
            onChange={handleInputChange}
            name="edition"
          />
        </Form.Group>

        <Form.Group controlId="price">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            value={newBook.price}
            onChange={handleInputChange}
            name="price"
          />
        </Form.Group>

        <Form.Group className="p-3" controlId="in_stock">
          <Form.Check
            type="checkbox"
            label="Available"
            checked={newBook.in_stock}
            onChange={(e) =>
              setNewBook({ ...newBook, in_stock: e.target.checked })
            }
            name="in_stock"
          />
        </Form.Group>

        <Button variant="primary" onClick={handleAddOrUpdateBook}>
          {isEditing ? "Update Book" : "Add New Book"}
        </Button>
        {isEditing && (
          <Button
            variant="secondary"
            onClick={resetForm}
            style={{ marginLeft: "10px" }}
          >
            Cancel Edit
          </Button>
        )}

        
      </Form>
      </div>
      <Form.Group controlId="search" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search books by name, edition or price..."
          value={searchTerm}
          className={styles.searchInput}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <table className={styles.bookList}>
        
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Edition</th>
            <th>Price</th>
            <th>In Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((book) => (
            <tr key={book.id}>
              <td>
                <img
                  src={`http://61.246.67.74:4000${book.image}`}
                  alt="Book"
                  width="50"
                />
              </td>
              <td>{book.book_name}</td>
              <td>{book.edition}</td>
              <td>₹{book.price}</td>
              <td>
                <Form.Check
                  type="switch"
                  checked={book.in_stock}
                  onChange={() => handleToggleInStock(book.id)}
                />
              </td>
              <td>
                <Button
                  variant="secondary"
                  onClick={() => handleEditBook(book)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteBook(book.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default BookManager;
