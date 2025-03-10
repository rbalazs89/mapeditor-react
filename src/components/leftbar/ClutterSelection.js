// src/components/leftbar/ClutterSelection.js
import React, { useState, useEffect, useRef } from 'react';
import clutterImages from '../../import/clutter'; // Import the generated clutter file
import "./LeftSidebar.css";

const ITEMS_PER_PAGE = 100;

const ClutterSelection = ({ selectedClutter, setSelectedClutter, makeAllClutterUnselected }) => {
  const containerRef = useRef(null);
  const imageKeys = Object.keys(clutterImages);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerRow, setItemsPerRow] = useState(5);

  useEffect(() => {
    const updateItemsPerRow = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setItemsPerRow(Math.max(1, Math.floor(containerWidth / 36))); // 32px + 4px gap
      }
    };

    updateItemsPerRow();
    window.addEventListener('resize', updateItemsPerRow);
    return () => window.removeEventListener('resize', updateItemsPerRow);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(() => {
        const containerWidth = containerRef.current.clientWidth;
        setItemsPerRow(Math.max(1, Math.floor(containerWidth / 36)));
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const totalPages = Math.ceil(imageKeys.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentItems = imageKeys.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--light-grey)', padding: '8px', width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(32px, 1fr))`,
        gap: '4px',
        justifyContent: 'start',
        width: '100%',
        maxWidth: `${itemsPerRow * 36}px`
      }}>
        {currentItems.map((key, index) => (
          <div
            className = "clutter-selection-element"
            key={index}
            onClick={(e) => {
              makeAllClutterUnselected();
              const img = new Image();
              img.src = clutterImages[key];
              img.onload = () => {
                setSelectedClutter({
                  fromMapArea: false,
                  imageNumber: key,
                  imageWidth: img.width,
                  imageHeight: img.height,
                });
              };
            }}
            onContextMenu={(e) => {
              e.preventDefault(); // Prevent default right-click menu
              makeAllClutterUnselected();
              const img = new Image();
              img.src = clutterImages[key];
              img.onload = () => {
                setSelectedClutter({
                  fromMapArea: false,
                  imageNumber: key,
                  imageWidth: img.width,
                  imageHeight: img.height,
                });
              };
            }}
          >
            <img
              src={clutterImages[key]}
              alt={`Clutter ${startIndex + index + 1}`}
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="switch-page-button" onClick={handlePrevPage} disabled={currentPage === 0} style={{ cursor: 'pointer', fontSize: '16px' }}>
          {'<'}
        </button>
        <span>Page {currentPage + 1} of {totalPages}</span>
        <button className="switch-page-button" onClick={handleNextPage} disabled={currentPage === totalPages - 1} style={{ cursor: 'pointer', fontSize: '16px' }}>
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default ClutterSelection;
