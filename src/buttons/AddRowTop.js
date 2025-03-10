import React from 'react'
import { TILE_SIZE } from "../constants";

const AddRowTop = ({ setGridZoomData, tileGrid, setTileGrid, mapData, setMapData, collisionGrid, setCollisionGrid, adjustCPositionOnTilemapOperation, adjustMPositionOnTilemapOperation }) => {

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
      const newRow = Array(tileGrid[0]?.length || 10).fill(0);
      setTileGrid(prevGrid => [newRow, ...prevGrid]);
      setMapData(prev => ({...prev, maxRow: prev.maxRow + 1}));
      adjustCPositionOnTilemapOperation(true, true);
      adjustMPositionOnTilemapOperation(true, true);
      adjustCollisionPositionOnTilemapOperation(true, true, true);
      setGridZoomData((prev) =>({
        ...prev, posY: prev.posY - (TILE_SIZE * prev.scale * prev.scale),
      }));

      // setSelectedSingleTile(prev => ({
      //   ...prev,
      //   imageNumber: null,
      //   isSelectedFromMapArea: false
      // }));
  };

    return (
        <button className="my-button" onClick={doThisOnClick}>
          <img src="/icons/addtoprow.png" alt="AddRowtop" className="my-icon"/>
        </button>
      )
}

export default AddRowTop