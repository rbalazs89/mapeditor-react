//app.js
import "react-resizable/css/styles.css";
import "./App.css";
import LeftSidebar from "./components/leftbar/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import Topbar from "./components/Topbar";
import MapArea from "./components/MapArea";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { TILE_SIZE } from "./constants"; // Import TILE_SIZE
import useClutter from "./hooks/useClutter";
import clutterImages from './import/clutter'; // Import the generated clutter file
import useMapblock from "./hooks/useMapblock";
import mapblockImages from './import/mapblock' // generated mapblock files

const App = () => {
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    // console.log("showmapname", mapName);
    // console.log("mapnumber", mapData.mapNumber)
    // console.log("grid", collisionGrid)
  }, [currentTab]);


  const { clutters, addClutter, deleteClutter, makeClutterSelectedFromMap, makeAllClutterUnselected, adjustCPositionOnTilemapOperation, clearClutters } = useClutter();
  const { mapblocks, addMapblock, deleteMapblock, makeMapblockSelectedFromMap, makeAllMapblockUnselected, adjustMPositionOnTilemapOperation, clearMapblocks } = useMapblock();

  const clutterInitialized = useRef(false);
  const mapblockInitialized = useRef(false);

  //disable zoom:
  useEffect(() => {
    const disableZoom = (event) => {
      if (event.ctrlKey) {
        event.preventDefault(); // Prevents browser zoom
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault(); // Prevent default context menu
    };

    window.addEventListener('wheel', disableZoom, { passive: false });
    window.addEventListener('keydown', disableZoom, { passive: false });
    window.addEventListener('contextmenu', handleContextMenu, { passive: false });
  
    return () => {
      window.removeEventListener('wheel', disableZoom);
      window.removeEventListener('keydown', disableZoom);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);


  // fetch map data:
  const [mapData, setMapData] = useState({
    mapNumber: 1,
    maxColumn: 1,
    maxRow: 1,
  });
  // mouse to import right side
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); //pass this to rightside coordinates
  const [tileGrid, setTileGrid] = useState([]); // 2D array of tiles
  const [collisionGrid, setCollisionGrid] = useState(); // 2D array dimensions 8 x 8 miniTiles in 1 tile
  const [collisionClipboard, setCollisionClipboard] = useState({
    isTileSelected: false,
    copiedTile: null,
    sourceTile: { row: -1, col: -1 }
  });

  const [mapName, setMapName] = useState("map1");
  const [showGrid, setShowGrid] = useState(true);
  const [gridZoomData, setGridZoomData] = useState({
    scale: 1,
    posX: 0,
    posY: 0,
    scaledTileSize: Math.round(TILE_SIZE * 1), // Initial scale is 1
  });
  const [mapPath, setMapPath] = useState(null);
  const [booleanButtons, setBooleanButtons] = useState({
    tileCollision: false,
    grid: false,
    fineGrid: false,
    previousFineGrid: false,
  });
  const [selectedMapblock, setSelectedMapblock] = useState({
    imageNumber: null,
    idNumber: null,
    fromMapArea: false,
    worldX: null,
    worldY: null,
    imageHeight: null,
    imageWidth: null,
  })

  const [selectedClutter, setSelectedClutter] = useState({
    imageNumber: null,
    idNumber: null,
    fromMapArea: false,
    worldX: null,
    worldY: null,
    imageHeight: null,
    imageWidth: null,
  });
  const [selectedSingleTile, setSelectedSingleTile] = useState({
    imageNumber: null,
    column: null,
    row: null,
    isSelectedFromMapArea: false,
  })

  //initialize mapblocks
  const parseMapblocksData = (data, mapblockImages) => {
    const mapblocks = [];
    const regex = /mapBlock\[(\d+)\]\.worldX\s*=\s*(\d+);.*?\.worldY\s*=\s*(\d+);.*?setup\("\/mapblock\/a1\/(.+?)"\)/gs;
    
    let match;
    while ((match = regex.exec(data)) !== null) {
      const imageName = match[4]; // e.g. "barrel2"
      const imageNumber = Object.keys(mapblockImages).find(key => 
        mapblockImages[key].includes(imageName)
      ); 

  
      if (imageNumber) {
        mapblocks.push({
          imageNumber: parseInt(imageNumber),
          worldX: parseInt(match[2]),
          worldY: parseInt(match[3])
        });
      }
    }
    return mapblocks;
  };

  const parseClutterData = (data, clutterImages) => {
    const clutterArray = [];
    const regex = /clutter\[(\d+)\]\.worldX\s*=\s*(\d+);.*?\.worldY\s*=\s*(\d+);.*?setup\("\/clutter\/a1\/(.+?)"\)/gs;
    
    let match;
    while ((match = regex.exec(data)) !== null) {
      const imageName = match[4]; // e.g. "bush1"
      const imageNumber = Object.keys(clutterImages).find(key => 
        clutterImages[key].includes(imageName)
      );
  
      if (imageNumber) {
        clutterArray.push({
          imageNumber: parseInt(imageNumber),
          worldX: parseInt(match[2]),
          worldY: parseInt(match[3])
        });
      }
    }
    return clutterArray;
  };

  const adjustCollisionGrid = (parsedGrid, expectedRows, expectedCols) => {
    const adjustedGrid = [];
    
    // Process each row up to expectedRows
    for (let i = 0; i < expectedRows; i++) {
      if (i < parsedGrid.length) {
        // Take existing row and adjust columns
        const row = parsedGrid[i].slice(0, expectedCols);
        while (row.length < expectedCols) row.push(0);
        adjustedGrid.push(row);
      } else {
        // Create new row filled with zeros
        adjustedGrid.push(Array(expectedCols).fill(0));
      }
    }
    
    return adjustedGrid;
  };

  //initialize grid + fine collision grid:
  const loadFullMapData = useCallback(async (mapNumber) => {
    try {
      // Clear existing data
      clearClutters();
      clearMapblocks();
  
       // Load map data first to get dimensions
    const mapResponse = await fetch(`./all-user-data/maps/map${mapNumber}/map${mapNumber}.txt`);
    const mapDataText = await mapResponse.text();
    
    // Parse map data
    const mapLines = mapDataText.trim().split('\n');
    const mapGrid = mapLines.map(line => 
      line.trim().split(/\s+/).map(tile => parseInt(tile, 10))
    );
    
    // Calculate expected collision grid size
    const expectedCollisionRows = mapGrid.length * 8;
    const expectedCollisionCols = (mapGrid[0]?.length || 0) * 8;

    // Load and adjust collision data
    const collisionResponse = await fetch(`./all-user-data/maps/map${mapNumber}/map${mapNumber}collision.txt`);
    const collisionDataText = await collisionResponse.text();
    
    let parsedCollisionGrid = [];
    if (collisionDataText.trim()) {
      parsedCollisionGrid = collisionDataText.trim().split('\n').map(line =>
        line.trim().split(/\s+/).map(num => parseInt(num, 10))
      );
    }
    
    // Apply safety adjustments
    const finalCollisionGrid = adjustCollisionGrid(
      parsedCollisionGrid,
      expectedCollisionRows,
      expectedCollisionCols
    );

    // Update state
    setCollisionGrid(finalCollisionGrid);
    setTileGrid(mapGrid);
    setMapData(prev => ({
      ...prev,
      maxRow: mapGrid.length,
      maxColumn: mapGrid[0]?.length || 0,
      mapNumber: mapNumber
    }));
  
      // Load and parse mapblocks
      const mapblocksResponse = await fetch(`./all-user-data/maps/map${mapNumber}/map${mapNumber}mapblocks.txt`);
      const mapblocksData = await mapblocksResponse.text();
      const parsedMapblocks = parseMapblocksData(mapblocksData, mapblockImages);
      
      // Load and add mapblocks
      const mapblockPromises = parsedMapblocks.map(mb => 
        new Promise(resolve => {
          const img = new Image();
          img.src = mapblockImages[mb.imageNumber];
          img.onload = () => resolve({
            ...mb,
            imageWidth: img.naturalWidth,
            imageHeight: img.naturalHeight
          });
        })
      );
      const loadedMapblocks = await Promise.all(mapblockPromises);
      loadedMapblocks.forEach(mb => addMapblock(mb));
  
      // Repeat same process for clutter
      const clutterResponse = await fetch(`./all-user-data/maps/map${mapNumber}/map${mapNumber}clutter.txt`);
      const clutterData = await clutterResponse.text();
      const parsedClutter = parseClutterData(clutterData, clutterImages);
      
      const clutterPromises = parsedClutter.map(cl => 
        new Promise(resolve => {
          const img = new Image();
          img.src = clutterImages[cl.imageNumber];
          img.onload = () => resolve({
            ...cl,
            imageWidth: img.naturalWidth,
            imageHeight: img.naturalHeight
          });
        })
      );
      const loadedClutter = await Promise.all(clutterPromises);
      loadedClutter.forEach(cl => addClutter(cl));
  
    } catch (error) {
      console.error('Error loading map:', error);
    }
  }, [clearClutters, clearMapblocks, addMapblock, addClutter]);

  useEffect(() => {
    if (!mapblockInitialized.current || !clutterInitialized.current) {
      loadFullMapData(mapData.mapNumber);
      mapblockInitialized.current = true;
      clutterInitialized.current = true;
    }
  }, [mapData.mapNumber, loadFullMapData]);

  const parseMapData = useCallback((data) => {
    const lines = data.trim().split('\n');
  
    if (lines.length === 0) {
      console.error('Empty map file');
      return;
    }
  
    const grid = lines.map(line =>
      line.trim().split(/\s+/).map(tile => parseInt(tile, 10))
    );
  
    const maxRowGet = grid.length;
    const maxColumnGet = grid[0]?.length || 0;
  
    if (!grid.every(row => row.length === maxColumnGet)) {
      console.error('Inconsistent grid: Rows have different lengths');
      return;
    }
  
    setMapData((prev) => ({ ...prev, maxColumn: maxColumnGet, maxRow: maxRowGet }));
    setTileGrid(grid);
  }, []);

  const parseCollisionData = useCallback((data) => {
    const lines = data.trim().split('\n');
  
    if (lines.length === 0) {
      console.error('Empty collision file');
      return;
    }
  
    const grid = lines.map(line =>
      line.trim().split(/\s+/).map(num => parseInt(num, 10))
    );
  
    if (!grid.every(row => row.length === grid[0].length)) {
      console.error('Inconsistent collision grid: Rows have different lengths');
      return;
    }
  
    setCollisionGrid(grid);
    console.log("Collision Grid:", grid);
  }, []);

  //dragging windows:
  const [leftWidth, setLeftWidth] = useState(250);
  const [rightWidth, setRightWidth] = useState(250);

  const handleLeftResize = (e) => {
    setLeftWidth(Math.min(Math.max(e.clientX, 250), 500)); // Limits 250px - 500px
  };

  const handleRightResize = (e) => {
    const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 150), 500);
    setRightWidth(newWidth);
  };

  useEffect(() => {

  }, [mapData])
  // ALL SAVE METHODS:
  const handleSaveMap = () => {
    const { mapNumber } = mapData;
    
    // 1. Save tile grid (mapX.txt)
    const tileContent = tileGrid.map(row => 
      row.map(tile => tile.toString().padStart(3, '0')).join(' ')
    ).join('\n');
    saveFile(`map${mapNumber}.txt`, tileContent);
  
    // 2. Save collision grid (mapXcollision.txt)
    const collisionContent = collisionGrid.map(row => 
      row.join(' ')
    ).join('\n');
    saveFile(`map${mapNumber}collision.txt`, collisionContent);
  
    // 3. Save mapblocks (mapXmapblocks.txt)
    const mapblocksContent = generateMapblocksContent(mapblocks, mapblockImages);
    saveFile(`map${mapNumber}mapblocks.txt`, mapblocksContent);
  
    // 4. Save clutter (mapXclutter.txt)
    const clutterContent = generateClutterContent(clutters, clutterImages);
    saveFile(`map${mapNumber}clutter.txt`, clutterContent);
  };
  
  // Helper functions
  const saveFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const generateMapblocksContent = (mapblocks, images) => {
    let content = 'public void setMap' + mapData.mapNumber + '() {\n';
    mapblocks.forEach((mb, index) => {
      const imagePath = images[mb.imageNumber].split('/').pop().replace('.png', '');
      content += `    mapBlock[${index}] = new MapBlock();\n` +
                 `    mapBlock[${index}].worldX = ${mb.worldX};\n` +
                 `    mapBlock[${index}].worldY = ${mb.worldY};\n` +
                 `    mapBlock[${index}].image = setup("/mapblock/a1/${imagePath}");\n\n`;
    });
    content += '}';
    return content;
  };
  
  const generateClutterContent = (clutters, images) => {
    let content = 'public void setMap' + mapData.mapNumber + '() {\n';
    clutters.forEach((cl, index) => {
      const imagePath = images[cl.imageNumber].split('/').pop().replace('.png', '');
      content += `    clutter[${index}] = new Clutter();\n` +
                 `    clutter[${index}].worldX = ${cl.worldX};\n` +
                 `    clutter[${index}].worldY = ${cl.worldY};\n` +
                 `    clutter[${index}].image = setup("/clutter/a1/${imagePath}");\n\n`;
    });
    content += '}';
    return content;
  };

  // new file:

  const createNewMap = () => {
    // Determine next available map number
    let newMapNumber = 1;
    while (mapList.includes(`map${newMapNumber}`)) {
      newMapNumber++;
    }
  
    // Create new 10x10 tile grid
    const newTileGrid = Array(10).fill().map(() => 
      Array(10).fill(0).map(n => n.toString().padStart(1, '0'))
    );
  
    // Create corresponding collision grid (80x80)
    const newCollisionGrid = Array(80).fill().map(() => 
      Array(80).fill(0)
    );
  
    // Clear existing data
    clearClutters();
    clearMapblocks();
  
    // Update state
    setMapName(`map${newMapNumber}`);
    setMapData(prev => ({
      ...prev,
      mapNumber: newMapNumber,
      maxRow: 10,
      maxColumn: 10
    }));
    setTileGrid(newTileGrid);
    setCollisionGrid(newCollisionGrid);
  };
  
  // Add state for tracking existing maps (initialize from config)
  const [mapList, setMapList] = useState(["map1"]); // Initial default

  return (
    <div className="app-container">
      <Topbar
        // onFileLoad={(fileContent) => parseMapData(fileContent)} // Pass file loading function
        createNewMap={createNewMap}
        handleSaveMap={handleSaveMap}
        onFileLoad={(fileContent, mapNumber) => loadFullMapData(mapNumber)}
        tileGrid={tileGrid} setTileGrid={setTileGrid}
        mapName = {mapName} setMapName={setMapName} mapData= {mapData} setMapData={setMapData} 
        setCurrentTab={setCurrentTab} currentTab={currentTab}
        gridZoomData = {gridZoomData} setGridZoomData={setGridZoomData}
        showGrid={showGrid} setShowGrid={setShowGrid}
        booleanButtons={booleanButtons} setBooleanButtons={setBooleanButtons}
        setSelectedClutter={setSelectedClutter} makeAllClutterUnselected ={makeAllClutterUnselected} adjustCPositionOnTilemapOperation={adjustCPositionOnTilemapOperation}
        setSelectedMapblock={setSelectedMapblock} makeAllMapblockUnselected={makeAllMapblockUnselected} adjustMPositionOnTilemapOperation={adjustMPositionOnTilemapOperation}
        setCollisionClipboard={setCollisionClipboard}
        selectedSingleTile={selectedSingleTile} setSelectedSingleTile={setSelectedSingleTile}
        collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid}
        />
      <div className="main-content">
        <LeftSidebar
          leftWidth={leftWidth}
          handleLeftResize={handleLeftResize}
          currentTab={currentTab}
          selectedClutter={selectedClutter} setSelectedClutter={setSelectedClutter} makeAllClutterUnselected ={makeAllClutterUnselected}
          selectedMapblock={selectedMapblock} setSelectedMapblock={setSelectedMapblock} makeAllMapblockUnselected ={makeAllMapblockUnselected}
          selectedSingleTile={selectedSingleTile} setSelectedSingleTile={setSelectedSingleTile} 
        />
        <MapArea
          tileGrid={tileGrid} setTileGrid={setTileGrid}
          mapData={mapData}
          gridZoomData={gridZoomData} setGridZoomData={setGridZoomData}
          currentTab={currentTab}
          booleanButtons={booleanButtons}
          mousePosRef={mousePos} setMousePosRef={setMousePos}
          clutters={clutters} addClutter={addClutter} deleteClutter={deleteClutter} makeClutterSelectedFromMap={makeClutterSelectedFromMap} makeAllClutterUnselected ={makeAllClutterUnselected}
          selectedClutter={selectedClutter} setSelectedClutter={setSelectedClutter}
          mapblocks={mapblocks} addMapblock ={addMapblock} deleteMapblock={deleteMapblock} makeMapblockSelectedFromMap={makeMapblockSelectedFromMap} makeAllMapblockUnselected={makeAllMapblockUnselected}
          selectedMapblock={selectedMapblock} setSelectedMapblock={setSelectedMapblock}
          collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid} collisionClipboard={collisionClipboard} setCollisionClipboard={setCollisionClipboard}
          selectedSingleTile={selectedSingleTile} setSelectedSingleTile={setSelectedSingleTile}
        />
        <RightSidebar
          rightWidth={rightWidth} handleRightResize={handleRightResize}
          currentTab={currentTab}
          gridZoomData={gridZoomData}
          mousePosRef={mousePos}
          mapData={mapData}
          selectedClutter={selectedClutter}
          selectedMapblock={selectedMapblock}
          selectedSingleTile={selectedSingleTile}
        />
      </div>
    </div>
  );
};

export default App;