import React from 'react'

const RemoveRowBot = ({ tileGrid, setTileGrid, mapData, setMapData, collisionGrid, setCollisionGrid }) => {

  const adjustCollisionPositionOnTilemapOperation = (isAdded, isRow, isLeftOrTop) => {
    setCollisionGrid((prevGrid) => {
      if (isRow) {
        // Handle row operations
        if (isAdded) {
          const newRows = Array(8).fill(Array(prevGrid[0].length).fill(0)); // 8 new empty rows
          return isLeftOrTop ? [...newRows, ...prevGrid] : [...prevGrid, ...newRows]; 
        } else {
          return isLeftOrTop ? prevGrid.slice(8) : prevGrid.slice(0, -8); // Remove 8 rows
        }
      } else {
        // Handle column operations
        return prevGrid.map(row => {
          if (isAdded) {
            const newColumns = Array(8).fill(0); // 8 new empty columns
            return isLeftOrTop ? [...newColumns, ...row] : [...row, ...newColumns]; 
          } else {
            return isLeftOrTop ? row.slice(8) : row.slice(0, -8); // Remove 8 columns
          }
        });
      }
    });
  };

    const doThisOnClick = () => {
        if (tileGrid.length > 1) {
            setTileGrid(prevGrid => prevGrid.slice(0, -1));
            setMapData(prev => ({...prev, maxRow: prev.maxRow - 1}));
            adjustCollisionPositionOnTilemapOperation(false, true, false);
        }
    };

    return (
        <button className="my-button" onClick={doThisOnClick}>
          <img src="/icons/removebotrow.png" alt="RemoveRowbot" className="my-icon"/>
        </button>
      )
}

export default RemoveRowBot