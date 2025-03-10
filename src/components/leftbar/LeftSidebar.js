//src/components/leftbar/LeftSidebar.js
import React from 'react';
import "./LeftSidebar.css";
import ClutterSelection from './ClutterSelection';
import MapblockSelection from './MapblockSelection';
import TileSelection1 from './TileSelection1';

//tabs:
// 0: tile layer 1
// 1: tile layer 2
// 2: mapblocks
// 3: clutter
// 4: collision

const LeftSidebar = ({ leftWidth, handleLeftResize, currentTab,
  selectedClutter, setSelectedClutter, makeAllClutterUnselected,
  selectedMapblock, setSelectedMapblock, makeAllMapblockUnselected,
  selectedSingleTile, setSelectedSingleTile
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'stretch',
      //height: '100vh', // Full viewport height
      // position: 'fixed' // Prevent layout shift
    }}>
      {/* alignItems: 'stretch',height: '100vh' */}
      <div className="left-sidebar" style={{ width: `${leftWidth}px` }}>
        {currentTab === 3 && <ClutterSelection selectedClutter={selectedClutter} setSelectedClutter={setSelectedClutter} makeAllClutterUnselected={makeAllClutterUnselected}/>}
        {currentTab === 2 && <MapblockSelection selectedMapblock={selectedMapblock} setSelectedMapblock={setSelectedMapblock} makeAllMapblockUnselected={makeAllMapblockUnselected}/>}
        {currentTab === 0 && <TileSelection1 selectedSingleTile={selectedSingleTile} setSelectedSingleTile={setSelectedSingleTile}/>}
      </div>
      <div
        className="resizer"
        onMouseDown={(e) => {
          e.preventDefault();
          document.addEventListener("mousemove", handleLeftResize);
          document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", handleLeftResize);
          });
        }}
      />
    </div>
  );
};

export default LeftSidebar;
