import "../App.css"
import React, { useState, useRef, useEffect, useCallback } from "react";
import tileImages from "../import/tileImages";
import { TILE_SIZE } from "../constants";
import clutterImages from '../import/clutter'; // Import the generated clutter file
import mapblockImages from "../import/mapblock"; 

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 10;
const imgClutter = new Image(); // for the selected
const imgMapblock = new Image();
const tempImage = new Image(); // only for elements here to be classified as image get height and width data, its not drawn anywhere

// tab 0, 1 tile
// tab 2 mapblock
// tab 3 clutter
// tab 4 collision

const MapArea = ({
  tileGrid, setTileGrid, gridZoomData, mapData, setGridZoomData, currentTab, booleanButtons, mousePosRef, setMousePosRef,
  clutters, addClutter, deleteClutter, selectedClutter, setSelectedClutter, makeClutterSelectedFromMap, makeAllClutterUnselected,
  mapblocks, addMapblock, deleteMapblock, selectedMapblock, setSelectedMapblock, makeMapblockSelectedFromMap, makeAllMapblockUnselected,
  collisionGrid, setCollisionGrid, collisionClipboard, setCollisionClipboard,
  selectedSingleTile, setSelectedSingleTile
 }) => {

  // useEffect(() => {
  //     console.log("gridZoomData.posX:", gridZoomData.posX);
  //     console.log("mousePosRef.x:", mousePosRef.x);
  //     console.log("gridZoomData.scale:", gridZoomData.scale);
  //   }, [gridZoomData]); // This runs when currentTab updates

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [hoveredTile, setHoveredTile] = useState(null);
  const [hoveredClutter, setHoveredClutter] = useState(null);
  const [hoveredMapblock, setHoveredMapblock] = useState(null);

  const [isPanning, setIsPanning] = useState(false);
  const [imageCacheTile, setImageCacheTile] = useState([]);
  const [imageCacheClutter, setImageCacheClutter] = useState([]);
  const [imageCacheMapblock, setImageCacheMapblock] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // for "painting" collision:
  const [isPainting, setIsPainting] = useState(false); // Tracks if mouse is pressed and painting 
  const [paintingType, setPaintingType] = useState(null); // Left or right click action (1 or 0)

  //only for redraw:
  const [containerDimensions, setContainerDimensions] = useState({ 
    width: 0, 
    height: 0 
  });
  // preload mapblock images
  useEffect(() => {
    const loadMapblockImages = async () => {
      const cache = await Promise.all(
        Object.keys(mapblockImages).map((key) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ id: key, img });
            img.src = mapblockImages[key];
          });
        })
      );
      const imageCacheMapblock = cache.reduce((acc, { id, img }) => {
        acc[id] = img;
        return acc;
      }, {});
      setImageCacheMapblock((prevCache) => ({ ...prevCache, ...imageCacheMapblock }));
    };
  
    loadMapblockImages();
  }, []);

  // Preload tile images
  useEffect(() => {
    const loadImages = async () => {
      const cache = await Promise.all(
        Object.keys(tileImages).map((key) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ id: key, img });
            img.src = tileImages[key];
          });
        })
      );
      const imageCacheTile = cache.reduce((acc, { id, img }) => {
        acc[id] = img;
        return acc;
      }, {});
      setImageCacheTile(imageCacheTile);
      setImagesLoaded(true);
    };
    loadImages();
  }, []);

  // preload clutter
  useEffect(() => {
    const loadClutterImages = async () => {
      const cache = await Promise.all(
        Object.keys(clutterImages).map((key) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ id: key, img });
            img.src = clutterImages[key];
          });
        })
      );
      const imageCacheClutter = cache.reduce((acc, { id, img }) => {
        acc[id] = img;
        return acc;
      }, {});
      setImageCacheClutter((prevCache) => ({ ...prevCache, ...imageCacheClutter }));
    };
  
    loadClutterImages();
  }, []);

  // Canvas setup
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setContainerDimensions({ width: rect.width, height: rect.height });
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);  

    return () => resizeObserver.disconnect();
  }, []);

  // Redraw canvas
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { scale, posX, posY} = gridZoomData;

    const tx = posX / scale;
    const ty = posY / scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    // draw tiles layer 1:
    tileGrid.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        const img = imageCacheTile[tile];
        if (img) {
          ctx.drawImage(img, colIndex * TILE_SIZE, rowIndex * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });
    });
    
    // draw clutter:
    clutters.forEach((clutter) => {
      const img = imageCacheClutter[clutter.imageNumber];
      
      if (img) {
        // Check if the clutter is selected and apply transparency if true
        if (clutter.selected) {
          ctx.globalAlpha = 0.5; // 50% transparent, adjust the value to your needs (0 is fully transparent, 1 is fully opaque)
        } else {
          ctx.globalAlpha = 1; // Full opacity for non-selected clutters
        }
    
        // Draw the image with the current alpha value
        ctx.drawImage(
          img,
          clutter.worldX,
          clutter.worldY,
          clutter.imageWidth,
          clutter.imageHeight,
        );
      }
    });

    // draw mapblock
    mapblocks.forEach((mapblock) => {
      const img = imageCacheMapblock[mapblock.imageNumber];
      if (img) {
        // Check if the clutter is selected and apply transparency if true
        if (mapblock.selected) {
          ctx.globalAlpha = 0.5; // 50% transparent, adjust the value to your needs (0 is fully transparent, 1 is fully opaque)
        } else {
          ctx.globalAlpha = 1; // Full opacity for non-selected clutters
        }
    
        // Draw the image with the current alpha value
        ctx.drawImage(
          img,
          mapblock.worldX,
          mapblock.worldY,
          mapblock.imageWidth,
          mapblock.imageHeight,
        );
      }
    });

    // Reset globalAlpha to 1 after the drawing (important for subsequent drawing operations)
    ctx.globalAlpha = 1;

    //selected elements:

    // draw selected clutter transparent:
    ctx.globalAlpha = 0.8;

    if(selectedClutter !== null){
      if(selectedClutter.imageNumber !== null){
        imgClutter.src = clutterImages[selectedClutter.imageNumber];
        ctx.drawImage(
        imgClutter,
        (mousePosRef.x - (gridZoomData.posX/gridZoomData.scale)) / gridZoomData.scale - imgClutter.naturalWidth/2,
        (mousePosRef.y - (gridZoomData.posY/gridZoomData.scale)) / gridZoomData.scale - imgClutter.naturalHeight/2,
        imgClutter.naturalWidth,
        imgClutter.naturalHeight);
      }
    }

    //draw selected mapblock
    if(selectedMapblock !== null){
      if(selectedMapblock.imageNumber !== null){
        imgMapblock.src = mapblockImages[selectedMapblock.imageNumber];
        ctx.drawImage(
        imgMapblock,
        (mousePosRef.x - (gridZoomData.posX/gridZoomData.scale)) / gridZoomData.scale - imgMapblock.naturalWidth/2,
        (mousePosRef.y - (gridZoomData.posY/gridZoomData.scale)) / gridZoomData.scale - imgMapblock.naturalHeight/2,
        imgMapblock.naturalWidth,
        imgMapblock.naturalHeight);
      }
    }
    
    ctx.globalAlpha = 1;

    // Draw grid show grid
    if (booleanButtons.grid) {
      ctx.lineWidth = 1 / scale; // Keep lines sharp regardless of zoom
      const numRows = tileGrid.length;
      const numCols = tileGrid[0]?.length || 0; // Prevent errors if tileGrid is empty
  
      // Loop through grid positions
      for (let x = 0; x <= numCols * TILE_SIZE; x += TILE_SIZE) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, numRows * TILE_SIZE);
  
          if (x % (10 * TILE_SIZE) === 0) {
              ctx.lineWidth = 2 / scale; // Thicker line every 10th column
              ctx.setLineDash([3 / scale, 2 / scale]); // Solid line
          } else {
              ctx.lineWidth = 1 / scale;
              ctx.setLineDash([3 / scale, 2 / scale]); // Dashed lines
          }
          ctx.stroke();
      }
  
      for (let y = 0; y <= numRows * TILE_SIZE; y += TILE_SIZE) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(numCols * TILE_SIZE, y);
  
          if (y % (10 * TILE_SIZE) === 0) {
              ctx.lineWidth = 2 / scale; // Thicker line every 10th row
              ctx.setLineDash([3 / scale, 2 / scale]); // Solid line
          } else {
              ctx.lineWidth = 1 / scale;
              ctx.setLineDash([3 / scale, 2 / scale]); // Dashed lines
          }
          ctx.stroke();
      }
  
      // Draw solid border around the tile area
      ctx.lineWidth = 2 / scale;
      ctx.setLineDash([]); // Ensure it's solid
      ctx.strokeStyle = "rgba(0, 0, 0, 1)"; // Fully black for the border
  
      ctx.beginPath();
      ctx.rect(0, 0, numCols * TILE_SIZE, numRows * TILE_SIZE);
      ctx.stroke();
  }

  // draw fine grid show fine grid
  if (booleanButtons.fineGrid) {
    ctx.lineWidth = 1 / scale; // Keep lines sharp regardless of zoom
    const numRows = tileGrid.length;
    const numCols = tileGrid[0]?.length || 0; // Prevent errors if tileGrid is empty
  
    // Loop through each tile and draw the fine grid inside each one
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      for (let colIndex = 0; colIndex < numCols; colIndex++) {
        const startX = colIndex * TILE_SIZE;
        const startY = rowIndex * TILE_SIZE;
  
        // Draw the fine grid (8x8 smaller grid inside each tile)
        for (let i = 1; i <= 8; i++) {
          // Vertical fine grid lines
          ctx.beginPath();
          ctx.moveTo(startX + (i * TILE_SIZE / 8), startY);
          ctx.lineTo(startX + (i * TILE_SIZE / 8), startY + TILE_SIZE);
          ctx.lineWidth = 1 / scale;
          ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; // Light gray for fine grid lines
          ctx.stroke();
  
          // Horizontal fine grid lines
          ctx.beginPath();
          ctx.moveTo(startX, startY + (i * TILE_SIZE / 8));
          ctx.lineTo(startX + TILE_SIZE, startY + (i * TILE_SIZE / 8));
          ctx.lineWidth = 1 / scale;
          ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; // Light gray for fine grid lines
          ctx.stroke();
        }
      }
    }
  }

  // show collision
  if( currentTab === 4 || currentTab === 5||booleanButtons.tileCollision) {
      tileGrid.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
          const img = imageCacheTile[tile];
          const collisionStartX = colIndex * TILE_SIZE;
          const collisionStartY = rowIndex * TILE_SIZE;
    
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              if (collisionGrid[rowIndex * 8 + y][colIndex * 8 + x] === 1) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Transparent red color
                ctx.fillRect(collisionStartX + (x * TILE_SIZE / 8), collisionStartY + (y * TILE_SIZE / 8), TILE_SIZE / 8, TILE_SIZE / 8);
              }
            }
          }
      });
    });
  }

    ctx.restore();
  }, [tileGrid, gridZoomData, imagesLoaded, imageCacheTile, imageCacheClutter, imageCacheMapblock, containerDimensions,
    booleanButtons, clutters, mapblocks, mousePosRef, selectedClutter, selectedMapblock, collisionGrid]);

  // Event handlers
  const handleMouseMove = (event) => {
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    setMousePosRef({ x: mouseX, y: mouseY });

    if (isPanning) {
      const dx = event.clientX - lastMousePos.current.x;
      const dy = event.clientY - lastMousePos.current.y;
      setGridZoomData((prev) => ({
        ...prev,
        posX: prev.posX + dx * prev.scale,
      posY: prev.posY + dy * prev.scale
      }));
      lastMousePos.current = { x: event.clientX, y: event.clientY };
      return;
    }

    const gridX = (mouseX - gridZoomData.posX / gridZoomData.scale) / gridZoomData.scale;
    const gridY = (mouseY - gridZoomData.posY / gridZoomData.scale) / gridZoomData.scale;
    const col = Math.floor(gridX / TILE_SIZE);
    const row = Math.floor(gridY / TILE_SIZE);

    if (currentTab === 4 && isPainting) {
      // const gridX = (mouseX - gridZoomData.posX / gridZoomData.scale) / gridZoomData.scale;
      // const gridY = (mouseY - gridZoomData.posY / gridZoomData.scale) / gridZoomData.scale;

    if (event.ctrlKey || event.metaKey) {
      const tileCol = Math.floor(gridX / TILE_SIZE);
      const tileRow = Math.floor(gridY / TILE_SIZE);
      
      
    setCollisionGrid(prev => 
      updateCollisionTile(tileRow, tileCol, paintingType, prev)
    );

    } else {
      // Existing single-cell handling
      const tileCol = Math.floor(gridX / TILE_SIZE);
      const tileRow = Math.floor(gridY / TILE_SIZE);
      const tileLocalX = gridX - tileCol * TILE_SIZE;
      const tileLocalY = gridY - tileRow * TILE_SIZE;
      const subCol = Math.floor(tileLocalX / (TILE_SIZE / 8));
      const subRow = Math.floor(tileLocalY / (TILE_SIZE / 8));
      const collisionCol = tileCol * 8 + subCol;
      const collisionRow = tileRow * 8 + subRow;

      if (validPosition(collisionRow, collisionCol)) {
        updateCollisionGrid(collisionRow, collisionCol);
      }
    }
  }

    // hovered tile decide
    if(currentTab === 0 || currentTab === 1 || currentTab === 5){
      if (row >= 0 && row < tileGrid.length && col >= 0 && col < tileGrid[0]?.length) {
        setHoveredTile({ row, col });
      } else {
        setHoveredTile(null);
      }
    }

    //hovered clutter decide
    if (currentTab === 3) {
      let closestHovered = null;
      let minDistance = Infinity;

      clutters.forEach((clutter) => {
        if (
          gridX >= clutter.worldX &&
          gridX <= clutter.worldX + clutter.imageWidth &&
          gridY >= clutter.worldY &&
          gridY <= clutter.worldY + clutter.imageHeight
        ) {
          // Calculate center of clutter
          const centerX = clutter.worldX + clutter.imageWidth / 2;
          const centerY = clutter.worldY + clutter.imageHeight / 2;

          // Calculate distance to pointer
          const distance = Math.sqrt((gridX - centerX) ** 2 + (gridY - centerY) ** 2);
        
    
          // Update closest hovered clutter
          if (distance < minDistance) {
            minDistance = distance;
            closestHovered = clutter;
          }
        }
      });   
      setHoveredClutter(closestHovered);
    }

    if (currentTab === 2) {
      let closestHovered = null;
      let minDistance = Infinity;

      mapblocks.forEach((mapblock) => {
        if (
          gridX >= mapblock.worldX &&
          gridX <= mapblock.worldX + mapblock.imageWidth &&
          gridY >= mapblock.worldY &&
          gridY <= mapblock.worldY + mapblock.imageHeight
        ) {
          // Calculate center of clutter
          const centerX = mapblock.worldX + mapblock.imageWidth / 2;
          const centerY = mapblock.worldY + mapblock.imageHeight / 2;

          // Calculate distance to pointer
          const distance = Math.sqrt((gridX - centerX) ** 2 + (gridY - centerY) ** 2);
    
          // Update closest hovered clutter
          if (distance < minDistance) {
            minDistance = distance;
            closestHovered = mapblock;
          }
        }
      });   
      setHoveredMapblock(closestHovered);
    }
}

const updateCollisionGrid = (row, col) => {
  const newCollisionGrid = collisionGrid.map(r => [...r]); // Deep clone each row
  newCollisionGrid[row][col] = paintingType;
  setCollisionGrid(newCollisionGrid);
};

const validPosition = (row, col) => {
  return row >= 0 && row < collisionGrid.length && 
         col >= 0 && col < collisionGrid[0]?.length;
};

const updateCollisionTile = (tileRow, tileCol, value, grid) => {
  const newGrid = grid.map(row => [...row]);
  const startRow = tileRow * 8;
  const startCol = tileCol * 8;
  
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const row = startRow + y;
      const col = startCol + x;
      if (row < newGrid.length && col < newGrid[0]?.length) {
        newGrid[row][col] = value;
      }
    }
  }
  return newGrid;
};

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    if (!event.ctrlKey) return;
  
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left; // Mouse X relative to container
    const mouseY = event.clientY - rect.top; // Mouse Y relative to container
    const zoomFactor = event.deltaY < 0 ? 1.05 : 0.95; // Zoom in or out
  
    setGridZoomData((prev) => {
      const oldScale = prev.scale;
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldScale * zoomFactor));

      // Adjust position to keep the same map point under the mouse
      const x = ((mouseX - prev.posX/ oldScale)/oldScale) /
      (mapData.maxColumn * TILE_SIZE) * (TILE_SIZE * newScale * mapData.maxColumn - TILE_SIZE * oldScale * mapData.maxColumn)
      const y = ((mouseY - prev.posY/ oldScale)/oldScale) /
      (mapData.maxRow * TILE_SIZE) * (TILE_SIZE * newScale * mapData.maxRow - TILE_SIZE * oldScale * mapData.maxRow)
  

      const newPosX = (mouseX - (mouseX - prev.posX / oldScale * newScale )) - x * newScale;
      const newPosY = (mouseY - (mouseY - prev.posY / oldScale * newScale )) - y * newScale;

      return {
        scale: newScale,
        posX: newPosX,
        posY: newPosY,
        scaledTileSize: Math.round(TILE_SIZE * newScale), // Update scaledTileSize
      };
    });
  }, [setGridZoomData, mapData]);

  // for zoom refinement:
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
  
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (event) => {
    if (event.button === 1) {
      event.preventDefault();
      setIsPanning(true);
      lastMousePos.current = { x: event.clientX, y: event.clientY };
      return; // delete this if problem
    }

    if (currentTab === 4 && !isPanning) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const gridX = (mouseX - gridZoomData.posX / gridZoomData.scale) / gridZoomData.scale;
      const gridY = (mouseY - gridZoomData.posY / gridZoomData.scale) / gridZoomData.scale;

      const tileCol = Math.floor(gridX / TILE_SIZE);
      const tileRow = Math.floor(gridY / TILE_SIZE);
      const paintingType = event.button === 0 ? 1 : 0;

      if (event.ctrlKey || event.metaKey) { // Handle both Ctrl and Cmd keys
          setCollisionGrid(prev => 
            updateCollisionTile(tileRow, tileCol, paintingType, prev)
          );
        
        setIsPainting(true);
        setPaintingType(paintingType);
      } else {
        // Existing single-cell handling
        const tileLocalX = gridX - tileCol * TILE_SIZE;
        const tileLocalY = gridY - tileRow * TILE_SIZE;
        const subCol = Math.floor(tileLocalX / (TILE_SIZE / 8));
        const subRow = Math.floor(tileLocalY / (TILE_SIZE / 8));
        const collisionCol = tileCol * 8 + subCol;
        const collisionRow = tileRow * 8 + subRow;

        if (validPosition(collisionRow, collisionCol)) {
          setIsPainting(true);
          setPaintingType(paintingType);
          updateCollisionGrid(collisionRow, collisionCol);
        }
      }
    }
  };

  const handleMouseUp = (event) => {
    if (event.button === 1) {
      setIsPanning(false);
    }
    setIsPainting(false); // Stop painting on mouse up for fine collision
  };

  const handleMouseClick = (e) => {
    if (e.buttons === 4) return;
    if (currentTab === 5 && collisionClipboard.isTileSelected) {
      const { tileCol, tileRow, isValidPosition } = getTilePosition();
  
      // Validate both destination and clipboard data
      if (!isValidPosition || 
          !collisionClipboard.copiedTile ||
          !Array.isArray(collisionClipboard.copiedTile)) {
        return;
      }
  
      try {
        const newGrid = collisionGrid.map(row => [...row]);
        const destStartRow = tileRow * 8;
        const destStartCol = tileCol * 8;
  
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const targetRow = destStartRow + y;
            const targetCol = destStartCol + x;
            
            if (newGrid[targetRow] && 
                newGrid[targetRow][targetCol] !== undefined &&
                collisionClipboard.copiedTile[y] &&
                collisionClipboard.copiedTile[y][x] !== undefined) {
              newGrid[targetRow][targetCol] = collisionClipboard.copiedTile[y][x];
            }
          }
        }
        
        setCollisionGrid(newGrid);

      } catch (error) {
        console.error("Paste failed:", error);
      }
    }

    //place clutter:
    if(selectedClutter !== null && selectedClutter.imageNumber !== null && currentTab === 3){
      if(mousePosRef.x >= gridZoomData.posX / gridZoomData.scale &&
        mousePosRef.x <= gridZoomData.posX / gridZoomData.scale + mapData.maxColumn * TILE_SIZE * gridZoomData.scale &&
        mousePosRef.y >= gridZoomData.posY / gridZoomData.scale &&
        mousePosRef.y <= gridZoomData.posY / gridZoomData.scale + mapData.maxRow * TILE_SIZE * gridZoomData.scale
      ){
        tempImage.src = clutterImages[selectedClutter.imageNumber] // only to get width and height, this image is  not used
        const newClutter = {
          // idNumber: 0, //should be auto generated
          imageNumber: selectedClutter.imageNumber,
          imageWidth: tempImage.naturalWidth,
          imageHeight: tempImage.naturalHeight,

          worldX: (mousePosRef.x - (gridZoomData.posX/gridZoomData.scale)) / gridZoomData.scale - tempImage.naturalWidth/2,
          worldY: (mousePosRef.y - (gridZoomData.posY/gridZoomData.scale)) / gridZoomData.scale - tempImage.naturalHeight/2,
        }
        addClutter(newClutter);
      }
    }

    // place mapblock:
    if(selectedMapblock !== null && selectedMapblock.imageNumber !== null && currentTab === 2){
      if(mousePosRef.x >= gridZoomData.posX / gridZoomData.scale - TILE_SIZE * 5 * gridZoomData.scale &&
        mousePosRef.x <= gridZoomData.posX / gridZoomData.scale + (mapData.maxColumn + 5) * TILE_SIZE * gridZoomData.scale &&
        mousePosRef.y >= gridZoomData.posY / gridZoomData.scale - TILE_SIZE * 5 * gridZoomData.scale &&
        mousePosRef.y <= gridZoomData.posY / gridZoomData.scale + (mapData.maxRow + 5) * TILE_SIZE * gridZoomData.scale
      ){
        tempImage.src = mapblockImages[selectedMapblock.imageNumber] // only to get width and height, this image is  not used
        const newMapblock = {
          // idNumber: 0, //should be auto generated
          imageNumber: selectedMapblock.imageNumber,
          imageWidth: tempImage.naturalWidth,
          imageHeight: tempImage.naturalHeight,

          worldX: (mousePosRef.x - (gridZoomData.posX/gridZoomData.scale)) / gridZoomData.scale - tempImage.naturalWidth/2,
          worldY: (mousePosRef.y - (gridZoomData.posY/gridZoomData.scale)) / gridZoomData.scale - tempImage.naturalHeight/2,
        }
        addMapblock(newMapblock);
      }
    }

    if(currentTab === 0 && selectedSingleTile !== null && selectedSingleTile.imageNumber !== null){
      const { tileCol, tileRow, isValidPosition } = getTilePosition(e);
      if(isValidPosition){
          setTileGrid(prevGrid => {
            // Create a copy of the grid (deep copy)
            const newGrid = prevGrid.map(row => [...row]);
            
            // Update the specific tile
            newGrid[tileRow][tileCol] = selectedSingleTile.imageNumber;
            
            return newGrid;
          });
        }
    }
  };

  // for tile collision copy
  const getTilePosition = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e ? e.clientX - rect.left : mousePosRef.x;
    const mouseY = e ? e.clientY - rect.top : mousePosRef.y;
  
    const gridX = (mouseX - gridZoomData.posX / gridZoomData.scale) / gridZoomData.scale;
    const gridY = (mouseY - gridZoomData.posY / gridZoomData.scale) / gridZoomData.scale;
  
    const tileCol = Math.floor(gridX / TILE_SIZE);
    const tileRow = Math.floor(gridY / TILE_SIZE);
  
    // Validate against tile grid dimensions
    const isValidPosition = tileRow >= 0 && 
                           tileRow < tileGrid.length && 
                           tileCol >= 0 && 
                           tileCol < (tileGrid[0]?.length || 0);
  
    return { tileCol, tileRow, isValidPosition };
  };

  //for tile collision copy
  const extractCollisionTile = (tileRow, tileCol) => {
    const startRow = tileRow * 8;
    const startCol = tileCol * 8;
    
    if (startRow + 8 > collisionGrid.length ||
        startCol + 8 > (collisionGrid[0]?.length || 0)) {
      throw new Error("Source tile out of collision grid bounds");
    }
  
    return collisionGrid
      .slice(startRow, startRow + 8)
      .map(row => row.slice(startCol, startCol + 8));
  };

  const handleRightClick = (e) => {
    
    if (currentTab === 5) {
      const { tileCol, tileRow, isValidPosition } = getTilePosition(e);
      
      if (!isValidPosition) {
        setCollisionClipboard(prev => ({
          ...prev,
          isTileSelected: false,
          sourceTile: { row: -1, col: -1 }
        }));
        return;
      }
  
      try {
        const copiedTile = extractCollisionTile(tileRow, tileCol);
        setCollisionClipboard({
          isTileSelected: true,
          copiedTile,
          sourceTile: { row: tileRow, col: tileCol }
        });
      } catch (error) {
        console.error("Copy failed:", error);
        setCollisionClipboard(prev => ({ ...prev, isTileSelected: false }));
      }
    }

    if(currentTab === 3){
      if (hoveredClutter !== null) {
        makeClutterSelectedFromMap(hoveredClutter.idNumber);
        setSelectedClutter(prevState => ({
          ...prevState, // Spread previous state to retain other properties
          idNumber: hoveredClutter.idNumber,
          imageNumber: hoveredClutter.imageNumber,
          fromMapArea: true,
          worldX: hoveredClutter.worldX,
          worldY: hoveredClutter.worldY,
          imageHeight: hoveredClutter.imageHeight,
          imageWidth: hoveredClutter.imageWidth,
          selected: hoveredClutter.selected,
        }));
      } else {
        setSelectedClutter(null);
        makeAllClutterUnselected();
      }
    }

    if(currentTab === 2){
      if (hoveredMapblock !== null) {
        makeMapblockSelectedFromMap(hoveredMapblock.idNumber);
        setSelectedMapblock(prevState => ({
          ...prevState, // Spread previous state to retain other properties
          idNumber: hoveredMapblock.idNumber,
          imageNumber: hoveredMapblock.imageNumber,
          fromMapArea: true,
          worldX: hoveredMapblock.worldX,
          worldY: hoveredMapblock.worldY,
          imageHeight: hoveredMapblock.imageHeight,
          imageWidth: hoveredMapblock.imageWidth,
          selected: hoveredMapblock.selected,
        }));
      } else {
        setSelectedMapblock(null);
        makeAllMapblockUnselected();
      }
    }
    if (currentTab === 0) {
      const { tileCol, tileRow, isValidPosition } = getTilePosition(e);
      
      if (isValidPosition) {
        setSelectedSingleTile(prev => ({
          ...prev,
          imageNumber: tileGrid[tileRow][tileCol], // Get tile number from the grid
          isSelectedFromMapArea: true,
          column: tileCol,
          row: tileRow,
        }));
      } else {
        setSelectedSingleTile(prev => ({
          ...prev,
          imageNumber: null,
          isSelectedFromMapArea: false,
          column: null,
          row: null,
        }));
      }
    }
  };

  // handle delete
  const handleKeyDown = (e) => {
    if (e.key === "Delete") { // You can also use e.keyCode === 46 for "Delete" key
      e.preventDefault();
      //clutter
      if(currentTab === 3){
        if(selectedClutter !== null){
          if(selectedClutter.idNumber !== null){
            if(selectedClutter.fromMapArea === true){
              deleteClutter(selectedClutter.idNumber);
            }
          }
        }
      }

      //mapblock:
      if(currentTab === 2){
        if(selectedMapblock !== null){
          if(selectedMapblock.idNumber !== null){
            if(selectedMapblock.fromMapArea === true){
              deleteMapblock(selectedMapblock.idNumber);
            }
          }
        }
      }
    }
  };

  //renders:
  // render hovered tile only
  const renderHoveredTileBracket = () => {
    if (!hoveredTile || (currentTab !== 1 && currentTab !== 0)) return null;
  
    const left = hoveredTile.col * TILE_SIZE * gridZoomData.scale + gridZoomData.posX / gridZoomData.scale;
    const top = hoveredTile.row * TILE_SIZE * gridZoomData.scale + gridZoomData.posY / gridZoomData.scale;
    const size = TILE_SIZE * gridZoomData.scale;
  
    return (
      <>
        <div
          style={{
            position: "absolute",
            left,
            top,
            width: size,
            height: size,
            backgroundColor: "rgba(173, 216, 230, 0.3)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left,
            top,
            width: size,
            height: size,
            border: "3px solid rgba(30, 144, 255, 0.8)",
            pointerEvents: "none",
            boxSizing: "border-box",
          }}
        />
      </>
    );
  };

  // render hovered tile collision only
  const renderCollisionCopyFeedback = () => {
    if (currentTab !== 5) return null;
  
    return (
      <>
        {/* Source tile highlight */}
        {collisionClipboard.sourceTile.row >= 0 && (
          <div
            style={{
              position: "absolute",
              left: collisionClipboard.sourceTile.col * TILE_SIZE * gridZoomData.scale + gridZoomData.posX / gridZoomData.scale,
              top: collisionClipboard.sourceTile.row * TILE_SIZE * gridZoomData.scale + gridZoomData.posY / gridZoomData.scale,
              width: TILE_SIZE * gridZoomData.scale,
              height: TILE_SIZE * gridZoomData.scale,
              border: "3px solid #00ff00",
              pointerEvents: "none",
              boxSizing: "border-box"
            }}
          />
        )}
  
        {/* Destination tile preview */}
        {hoveredTile && collisionClipboard.isTileSelected && (
          <div
            style={{
              position: "absolute",
              left: hoveredTile.col * TILE_SIZE * gridZoomData.scale + gridZoomData.posX / gridZoomData.scale,
              top: hoveredTile.row * TILE_SIZE * gridZoomData.scale + gridZoomData.posY / gridZoomData.scale,
              width: TILE_SIZE * gridZoomData.scale,
              height: TILE_SIZE * gridZoomData.scale,
              border: "3px dashed #ff0000",
              pointerEvents: "none",
              boxSizing: "border-box"
            }}
          />
        )}
      </>
    );
  };

  // hovered clutter
  const renderHoveredClutter = () => {
  if (!hoveredClutter || currentTab !== 3) return null;

  const left = gridZoomData.posX / gridZoomData.scale + hoveredClutter.worldX * gridZoomData.scale;
  const top = gridZoomData.posY / gridZoomData.scale + hoveredClutter.worldY * gridZoomData.scale;
  const width = hoveredClutter.imageWidth * gridZoomData.scale;
  const height = hoveredClutter.imageHeight * gridZoomData.scale;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          backgroundColor: "rgba(255, 165, 0, 0.3)", // Transparent orange fill
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          border: "3px solid rgba(255, 140, 0, 0.8)", // Orange border
          pointerEvents: "none",
          boxSizing: "border-box",
        }}
      />
    </>
  );
};

  // hovered clutter
  const renderHoveredMapblock = () => {
    if (!hoveredMapblock || currentTab !== 2) return null;
  
    const left = gridZoomData.posX / gridZoomData.scale + hoveredMapblock.worldX * gridZoomData.scale;
    const top = gridZoomData.posY / gridZoomData.scale + hoveredMapblock.worldY * gridZoomData.scale;
    const width = hoveredMapblock.imageWidth * gridZoomData.scale;
    const height = hoveredMapblock.imageHeight * gridZoomData.scale;
  
    return (
      <>
        <div
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            backgroundColor: "rgba(197, 253, 29, 0.3)", // Transparent orange fill
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left,
            top,
            width,
            height,
            border: "3px solid rgba(234, 255, 0, 0.97)", // Orange border
            pointerEvents: "none",
            boxSizing: "border-box",
          }}
        />
      </>
    );
  };

  const renderCollisionFeedback = () => (
    <>
      {collisionClipboard.sourceTile.row >= 0 && (
        <div className="source-tile-highlight" />
      )}
      {hoveredTile && collisionClipboard.isTileSelected && (
        <div className="paste-preview" />
      )}
    </>
  );

  return (
    <div
      className="map-area"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPanning(false)}
      onContextMenu={handleRightClick}
      onClick={handleMouseClick}
      onKeyDown={handleKeyDown}
      tabIndex={0} //{/* Make the div focusable */}
      
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: isPanning ? "grabbing" : "default",
        width: "100%",
        height: "100%",
      }}
    >
      <canvas
      ref={canvasRef}
      style={{ position: "absolute" }} />
      {renderHoveredTileBracket()}
      {renderHoveredClutter()}
      {renderHoveredMapblock()}
      {renderCollisionFeedback()}
      {renderCollisionCopyFeedback()}
    </div>
  );
};


export default MapArea;