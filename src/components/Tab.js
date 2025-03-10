import React, { useState, useEffect } from "react";

const Tab = ({ tabLabel, tabId,
    currentTab, setCurrentTab,
    tooltipText,
    setSelectedClutter,
    makeAllClutterUnselected,
    setSelectedMapblock,
    makeAllMapblockUnselected,
    leftStyle,
    bottomStyle,
    setCollisionClipboard,
    selectedSingleTile, setSelectedSingleTile
  }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  // Handle the timeout for showing the tooltip
  useEffect(() => {
    if (isTooltipVisible) {
      const hideTooltip = () => setTooltipVisible(false);
      document.addEventListener("click", hideTooltip);
      return () => document.removeEventListener("click", hideTooltip);
    }
  }, [isTooltipVisible]);

  const handleTabClick = () => {
    setCurrentTab(tabId); // Set the active tab on click
  };

  useEffect(() => {
      setSelectedClutter(null);
      setSelectedMapblock(null);

      makeAllMapblockUnselected();
      makeAllClutterUnselected();
      setCollisionClipboard(prev => ({
        ...prev,
        isTileSelected: false,
        sourceTile: { row: -1, col: -1 }
      }));
      setSelectedSingleTile(prev => ({
        ...prev,
        imageNumber: null,
        isSelectedFromMapArea: false
      }));
    }, [currentTab]);

  // Add a delay to show the tooltip
  const handleMouseEnter = () => {
    setTimeout(() => {
      setTooltipVisible(true);
    }, 1000); // 1-second delay before showing tooltip
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div className="tooltip-container">
      <div
        className={`tab ${currentTab === tabId ? "active" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          handleTabClick();
          setTooltipVisible(false);
        }}
      >
        {tabLabel}
        {isTooltipVisible && (
          <span
            className="tooltip-text"
            style={{
              left: leftStyle,  // Directly use the passed value for leftStyle
              bottom: bottomStyle // Directly use the passed value for bottomStyle
            }}
          >
            {tooltipText}
          </span>
        )}
      </div>
    </div>
  );
};

export default Tab;
