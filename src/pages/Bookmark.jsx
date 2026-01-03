import React, { useEffect, useState } from "react";
import styles from "./Bookmarks.module.css";
import { useAuth } from "../services/AuthContext";
import FolderIcon from "@mui/icons-material/Folder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useNavigate } from "react-router-dom";
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';

const Bookmarks = () => {
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({ "no-folder": true });
  const { user } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    fetchFoldersAndBookmarks();
  }, []);

  const fetchFoldersAndBookmarks = async () => {
    try {
      // Fetch folders
      const foldersResponse = await fetch(
        `http://61.246.67.74:4000/api/folders?uid=${user.uid}`
      );
      const foldersData = await foldersResponse.json();

      // Fetch bookmarks
      const bookmarksResponse = await fetch(
        `http://61.246.67.74:4000/api/bookmarks?uid=${user.uid}`
      );
      const bookmarksData = await bookmarksResponse.json();

      // Organize bookmarks by folder
      const organizedData = organizeFoldersAndBookmarks(
        foldersData.folders,
        bookmarksData.bookmarks
      );
      setFolders(organizedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const organizeFoldersAndBookmarks = (folders, bookmarks) => {
    const folderMap = new Map();

    // Initialize with "No Folder" category
    folderMap.set(null, {
      id: "no-folder",
      name: "Uncategorized",
      bookmarks: [],
    });

    // Create folder structure
    folders.forEach((folder) => {
      folderMap.set(folder.id, {
        ...folder,
        name: folder.folder_name,
        bookmarks: [],
      });
    });

    // Organize bookmarks into folders
    bookmarks.forEach((bookmark) => {
      const folderId = bookmark.folder_id || null;
      const folder = folderMap.get(folderId);
      if (folder) {
        folder.bookmarks.push(bookmark);
      }
    });

    return Array.from(folderMap.values());
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleOpenBookmark = (citation) => {
    if (citation) {
      localStorage.setItem("referredCitation", citation);
    }
    navigate("/index");
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    if (!window.confirm("Are you sure you want to delete this bookmark?")) {
      return;
    }
  
    try {
      const response = await fetch(
        `http://61.246.67.74:4000/api/bookmarks/${bookmarkId}?uid=${user.uid}`,
        {
          method: "DELETE",
        }
      );
  
      const data = await response.json();
  
      if (data.success) {
        alert("Bookmark deleted successfully!");
        fetchFoldersAndBookmarks(); // Refresh the list
      } else {
        alert("Failed to delete bookmark: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      alert("An error occurred while deleting the bookmark.");
    }
  };
  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm("Are you sure you want to delete this folder? This will delete all bookmarks inside it.")) {
      return;
    }
  
    try {
      const response = await fetch(
        `http://61.246.67.74:4000/api/folders/${folderId}?uid=${user.uid}`,
        {
          method: "DELETE",
        }
      );
  
      const data = await response.json();
  
      if (data.success) {
        alert("Folder deleted successfully!");
        fetchFoldersAndBookmarks(); // Refresh folders & bookmarks
      } else {
        alert("Failed to delete folder: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("An error occurred while deleting the folder.");
    }
  };
  
  

  
  return (
    <div className={styles.bookmarksContainer}>
      {folders.map((folder) => (
        <div key={folder.id} className={styles.folderSection}>
          <div
            className={styles.folderHeader}
            onClick={() => toggleFolder(folder.id)}
          >
            <FolderIcon className={styles.folderIcon} />
            <span className={styles.folderName}>{folder.name}</span>
            <button
    onClick={() => handleDeleteFolder(folder.id)}
    className={styles.deleteFolderButton}
  >
<FolderDeleteIcon/>  </button>
            {expandedFolders[folder.id] ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </div>

          {expandedFolders[folder.id] && (
            <div className={styles.bookmarksList}>
              {folder.bookmarks.map((bookmark) => (
                <div key={bookmark.id} className={styles.bookmarkCard}>
                  <div className={styles.bookmarkContent}>
                    <div className={styles.bookmarkHeader}>
                      <BookmarkIcon className={styles.bookmarkIcon} />
                      <h3 className={styles.title}>{bookmark.title}</h3>
                    </div>
                    <p className={styles.citation}>{bookmark.citation}</p>
                    {bookmark.note && (
                      <p className={styles.note}>{bookmark.note}</p>
                    )}
                  </div>
                  <div className={styles.openButtonContainer}>
                  <button
    onClick={() => handleOpenBookmark(bookmark.citation)}
    className={styles.openButton}
  >
    Open
  </button> 
  <button
    onClick={() => handleDeleteBookmark(bookmark.id)}
    className={styles.deleteButton}
  >
    Delete
  </button>
                  </div>
                </div>
              ))}
              {folder.bookmarks.length === 0 && (
                <p className={styles.emptyFolder}>
                  No bookmarks in this folder
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Bookmarks;
