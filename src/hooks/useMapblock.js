//src/hooks/useMapblock.js
import { useState } from "react";
import { TILE_SIZE } from "../constants";

const useMapblock = () => {
  const [mapblocks, setMapblocks] = useState([]);

  const addMapblock = (newMapblockData) => {
    setMapblocks((prevMapblocks) => {
      // Create the new mapblock without an idNumber
      const newMapblock = { ...newMapblockData, selected: false };
  
      // Insert it into the array while maintaining the order by worldY + imageHeight
      const updatedMapblocks = [...prevMapblocks, newMapblock].sort((a, b) => (a.worldY + a.imageHeight) - (b.worldY + b.imageHeight));
  
      // Reassign idNumbers based on the new order
      return updatedMapblocks.map((mapblock, index) => ({
        ...mapblock,
        idNumber: index, // Assign id based on sorted order
      }));
    });
  };
  
  const deleteMapblock = (idToDelete) => {
    setMapblocks((prevMapblocks) => {
      // Remove the mapblock by id
      const updatedMapblocks = prevMapblocks.filter(mapblock => mapblock.idNumber !== idToDelete);
  
      // Reassign idNumbers after deletion
      return updatedMapblocks.sort((a, b) => (a.worldY + a.imageHeight) - (b.worldY + b.imageHeight))
                              .map((mapblock, index) => ({
                                ...mapblock,
                                idNumber: index, // Recalculate ids after deletion
                              }));
    });
  };

  const makeMapblockSelectedFromMap = (idNumber) => {
    setMapblocks((prevMapblocks) =>
      prevMapblocks.map((mapblock) => ({
        ...mapblock,
        selected: mapblock.idNumber === idNumber, // Set true for the selected one, false for others
      }))
    );
    // console.log('Updated selected mapblock:', idNumber); // Debugging line
  };

  const makeAllMapblockUnselected = () => {
    setMapblocks(prevMapblocks =>
      prevMapblocks.map(mapblock => ({
        ...mapblock, // retain all other properties of mapblocks
        selected: false, // set selected to false for all mapblocks
      }))
    );
  };

  const adjustMPositionOnTilemapOperation = (isAdded, isRow) => {
      setMapblocks((prevMapblocks) =>
        prevMapblocks.map(mapblock => ({
          ...mapblock,
          worldX: !isRow ? (isAdded ? mapblock.worldX + TILE_SIZE : mapblock.worldX - TILE_SIZE) : mapblock.worldX,
          worldY: isRow ? (isAdded ? mapblock.worldY + TILE_SIZE : mapblock.worldY - TILE_SIZE) : mapblock.worldY,
        }))
    );
  };

  const clearMapblocks = () => {
    setMapblocks([]); // Clear all mapblocks
  };
  

  return { mapblocks, addMapblock, deleteMapblock, makeMapblockSelectedFromMap, makeAllMapblockUnselected, adjustMPositionOnTilemapOperation, clearMapblocks };
};

export default useMapblock;