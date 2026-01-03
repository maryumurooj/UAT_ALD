import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// This component is COMPLETELY isolated from parent re-renders
const IsolatedEditModalContent = ({ title, initialValue, initialLink, hasLinkField, onSave, onClose, saving }) => {
  const [value, setValue] = useState(initialValue);
  const [link, setLink] = useState(initialLink);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onSave(value, link);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '10px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111' }}>
            {title}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280', padding: '4px 8px' }}>
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', marginBottom: '20px' }}>
          <textarea
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              width: '96.5%',
              minHeight: '150px',
              padding: '12px',
              fontSize: '20px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              resize: 'vertical',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
          />

          {hasLinkField && (
            <>
              <label style={{ display: 'block', marginTop: '16px', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                Para Link (optional):
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g., Para 23, 45"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                }}
              />
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value, link)}
            disabled={saving}
            style={{
              padding: '10px 24px',
              backgroundColor: saving ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const IsolatedEditModal = (props) => {
  if (!props.isOpen) return null;
  
  // Render to document.body using portal - COMPLETELY outside React tree
  return createPortal(
    <IsolatedEditModalContent {...props} />,
    document.body
  );
};

export default IsolatedEditModal;
