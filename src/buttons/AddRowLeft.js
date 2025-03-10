import React from 'react'
import { TILE_SIZE } from "../constants";

const AddRowLeft = ({ setGridZoomData, tileGrid, setTileGrid, mapData, setMapData, collisionGrid, setCollisionGrid, adjustCPositionOnTilemapOperation, adjustMPositionOnTilemapOperation  }) => {

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
      setTileGrid(prevGridd => prevGridd.map(row => [0, ...row]));
      setMapData(prev => ({...prev, maxColumn: prev.maxColumn + 1}));
      adjustCPositionOnTilemapOperation(true, false);
      adjustMPositionOnTilemapOperation(true, false);
      adjustCollisionPositionOnTilemapOperation(true, false, true);
      setGridZoomData((prev) =>({
              ...prev, posX: prev.posX - (TILE_SIZE * prev.scale * prev.scale),
            }));
    };

    return (
        <button className="my-button" onClick={doThisOnClick}>
          <img src="/icons/addleftrow.png" alt="AddRowLeft" className="my-icon"/>
        </button>
      )
}

export default AddRowLeft