//src/buttons/LoadButton.js
import React, { useRef } from "react";

const LoadButton = ({
  onFileLoad, mapName, setMapName, mapData, setMapData
}) => {

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger file input
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
  
      // Extract map number from filename (e.g., "map2.txt" → 2)
      const mapNumMatch = file.name.match(/\d+/);
      const mapNum = mapNumMatch ? parseInt(mapNumMatch[0], 10) : null;
      
      const safeMapNum = Number.isInteger(mapNum) ? mapNum : 1;
      if (mapNum !== null) {
        console.log(`Extracted Map Number: ${mapNum}`);
      } else {
        console.warn(`Filename "${file.name}" does not contain a number. Defaulting to 1.`);
      }
      setMapName("map"+ safeMapNum);
      setMapData((prev) => ({ ...prev, mapNumber: safeMapNum }));
  
      onFileLoad(fileContent, safeMapNum); // Pass file content + extracted map number
    };
    reader.readAsText(file);
  };

  return (
    <div className="tooltip-container">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".txt"
        onChange={handleFileChange}
      />
      <button className="global-button" onClick={handleButtonClick}>
        <img src="/icons/loadicon.png" alt="Load" className="global-icon" />
        <span className="tooltip-text" style={{ bottom: "-20%", left: "-40%" }}>
          Load project files, select layer1 txt file to load.
        </span>
      </button>
    </div>
  );
};

export default LoadButton;