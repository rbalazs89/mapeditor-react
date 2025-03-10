//rightsidebar.js
import React from 'react';
import HoverMouseCoordinate from './HoverMouseCoordinate';
import SelectedObjectInfo from './SelectedObjectInfo';
import "./RightSidebar.css";

//tabs:
// 0: tile layer 1
// 1: tile layer 2
// 2: mapblocks
// 3: clutter
// 4: collision

// RightSidebar.js
const RightSidebar = ({ rightWidth, handleRightResize, gridZoomData, mousePosRef, mapData, selectedClutter,selectedMapblock, currentTab, selectedSingleTile }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {/* Resizer comes first */}
        <div
          className="right-resizer"
          onMouseDown={(e) => {
            e.preventDefault();
            document.addEventListener("mousemove", handleRightResize);
            document.addEventListener("mouseup", () => {
              document.removeEventListener("mousemove", handleRightResize);
            });
          }}
        />
        {/* Sidebar after resizer */}
            <div className="right-sidebar" style={{ width: `${rightWidth}px` }}>
              <SelectedObjectInfo selectedClutter={selectedClutter} selectedMapblock={selectedMapblock} currentTab={currentTab} selectedSingleTile={selectedSingleTile}/>
              <HoverMouseCoordinate mousePosRef={mousePosRef} gridZoomData={gridZoomData} mapData={mapData}/>
            </div>
      </div>
    );
  };

export default RightSidebar;