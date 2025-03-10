// src/components/leftbar/MapblockSelection.js
import React, { useState, useRef } from 'react'; // Removed useEffect
import mapblockImages from '../../import/mapblock';
import "./LeftSidebar.css";

const ITEMS_PER_PAGE = 25;

const MapblockSelection = ({ selectedMapblock, setSelectedMapblock, makeAllMapblockUnselected }) => {
  const containerRef = useRef(null);
  const imageKeys = Object.keys(mapblockImages);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerRow] = useState(5); // Fixed number of items per row

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const totalPages = Math.ceil(imageKeys.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentItems = imageKeys.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--light-grey)', padding: '8px', width: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`, // Fixed column count
        gap: '4px',
        justifyContent: 'start',
        width: '100%', // Remove maxWidth constraint
      }}>
        {currentItems.map((key, index) => (
          <div
            className="mapblock-selection-element"
            key={index}

            onClick={() => {
              makeAllMapblockUnselected();
              const img = new Image();
              img.src = mapblockImages[key];
              img.onload = () => {
                setSelectedMapblock((prev) => ({
                  fromMapArea: false,
                  imageNumber: key,
                  imageWidth: img.width,
                  imageHeight: img.height
              }))
              }
            }}

            onContextMenu={() => {
              makeAllMapblockUnselected();
              const img = new Image();
              img.src = mapblockImages[key];
              img.onload = () => {
                setSelectedMapblock((prev) => ({
                  fromMapArea: false,
                  imageNumber: key,
                  imageWidth: img.width,
                  imageHeight: img.height
              }))
              }
            }}
          >
            <img
              src={mapblockImages[key]}
              alt={`Mapblock ${startIndex + index + 1}`}
              style={{ maxWidth: '90%', maxHeight: '90%' }}
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

export default MapblockSelection;