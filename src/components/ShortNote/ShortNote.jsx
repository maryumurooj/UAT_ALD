 // ShortNote.jsx

import React from 'react';

const ShortNote = ({ shortNote }) => {
  return (
    <div>
      <h3>{shortNote.shortNoteText}</h3>
      {/* Render longNotes if available */}
      {shortNote.longNotes && shortNote.longNotes.length > 0 ? (
        shortNote.longNotes.map((longNote, idx) => (
          <div key={idx}>
            {longNote.longNoteParas && longNote.longNoteParas.length > 0 ? (
              longNote.longNoteParas.map((para, pIdx) => (
                <p key={pIdx}>{para.longNoteParaText}</p>
              ))
            ) : (
              <p>No long notes available</p>
            )}
          </div>
        ))
      ) : (
        <p>No long notes available</p>
      )}
    </div>
  );
};

export default ShortNote;
