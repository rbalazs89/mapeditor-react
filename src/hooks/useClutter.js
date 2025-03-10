//src/hooks/useClutter.js
import { useState } from "react";
import { TILE_SIZE } from "../constants";

const useClutter = () => {
  const [clutters, setClutters] = useState([]);

  const addClutter = (newClutterData) => {
    setClutters((prevClutters) => {
      // Create the new clutter without an idNumber
      const newClutter = { ...newClutterData, selected: false };
  
      // Insert it into the array while maintaining the order by worldY + imageHeight (or height)
      const updatedClutters = [...prevClutters, newClutter].sort((a, b) => (a.worldY + a.imageHeight) - (b.worldY + b.imageHeight));
  
      // Reassign idNumbers based on the new order
      return updatedClutters.map((clutter, index) => ({
        ...clutter,
        idNumber: index, // Assign id based on sorted order
      }));
    });
  };
  
  const deleteClutter = (idToDelete) => {
    setClutters((prevClutters) => {
      // Remove the clutter by id
      const updatedClutters = prevClutters.filter(clutter => clutter.idNumber !== idToDelete);
  
      // Reassign idNumbers after deletion and re-sort based on worldY + imageHeight
      return updatedClutters.sort((a, b) => (a.worldY + a.imageHeight) - (b.worldY + b.imageHeight))
                             .map((clutter, index) => ({
                               ...clutter,
                               idNumber: index, // Recalculate ids after deletion
                             }));
    });
  };

  const makeClutterSelectedFromMap = (idNumber) => {
    setClutters((prevClutters) =>
      prevClutters.map((clutter) => ({
        ...clutter,
        selected: clutter.idNumber === idNumber, // Set true for the selected one, false for others
      }))
    );
    // console.log('Updated selected clutter:', idNumber); // Debugging line
  };

  const makeAllClutterUnselected = () => {
    setClutters(prevClutters =>
      prevClutters.map(clutter => ({
        ...clutter, // retain all other properties of clutter
        selected: false, // set selected to false for all clutters
      }))
    );
    
  };


  const adjustCPositionOnTilemapOperation = (isAdded, isRow) => {
    setClutters((prevClutters) =>
      prevClutters.map(clutter => ({
        ...clutter,
        worldX: !isRow ? (isAdded ? clutter.worldX + TILE_SIZE : clutter.worldX - TILE_SIZE) : clutter.worldX,
        worldY: isRow ? (isAdded ? clutter.worldY + TILE_SIZE : clutter.worldY - TILE_SIZE) : clutter.worldY,
      }))
    );
  };

  const clearClutters = () => {
    setClutters([]); // Clear all clutters
  };

  return { clutters, addClutter, deleteClutter, makeClutterSelectedFromMap, makeAllClutterUnselected, adjustCPositionOnTilemapOperation, clearClutters };
};

export default useClutter;
