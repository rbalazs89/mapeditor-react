import React from 'react';

import Tab from './Tab';
import "./Topbar.css";
import RefreshButton from '../buttons/RefreshButton';
import CollisionButton from '../buttons/CollisionButton';
import SaveButton from '../buttons/SaveButton';
import LoadButton from '../buttons/LoadButton';
import NewProjectButton from '../buttons/NewProjectButton';
import ShowGridButton from '../buttons/ShowGridButton';
import FineGridButton from '../buttons/FineGridButton';

import AddRowTop from '../buttons/AddRowTop';
import AddRowRight from '../buttons/AddRowRight';
import AddRowBot from '../buttons/AddRowBot';
import AddRowLeft from '../buttons/AddRowLeft';

import RemoveRowTop from '../buttons/RemoveRowTop';
import RemoveRowRight from '../buttons/RemoveRowRight';
import RemoveRowBot from '../buttons/RemoveRowBot';
import RemoveRowLeft from '../buttons/RemoveRowLeft';

const Topbar = ({
  createNewMap, onFileLoad, handleSaveMap,
  tileGrid, setTileGrid,
  mapName, setMapName, mapData, setMapData,
  currentTab, setCurrentTab,
  gridZoomData, setGridZoomData,
  booleanButtons, setBooleanButtons,
  setSelectedClutter, makeAllClutterUnselected, adjustCPositionOnTilemapOperation,
  setSelectedMapblock, makeAllMapblockUnselected, adjustMPositionOnTilemapOperation,
  setCollisionClipboard, 
  selectedSingleTile, setSelectedSingleTile,
  collisionGrid, setCollisionGrid
}) => {
  const tabs = ["Tile", "Tile2", "Mapblock", "Clutter", "Collision", "Coll. QOL"];
  const tooltipTexts = [
    "Edit individual tiles. Saved as txt file.",
    "Modify second tile layer. Shows up behind the first layer and gets saved as txt file. To be implemented.",
    "Manage large map blocks, like trees, or houses, can make transparent when an entity walks behind them. Right click to select, left click to place. Press 'delete' key to remove selected. Saved as java method in txt.",
    "Place decorative elements, small elements like a pebble or flowers, strictly decorative, no interaction with player. Right click to select, left click to place. Press 'delete' key to remove selected. Saved as java method in txt.",
    "Adjust fine collision areas separately. 8 times more refined than tilemap. HOLD CTRL TO 'PAINT' THE WHOLE TILE.",
    "QOL Collision tab; allows to copy an existing collision mesh of a tile. Right click to get tile. Left click to place."
  ];
  const leftStyle = [
    "200%",
    "200%",
    "200%",
    "200%",
    "190%",
    "150%"  ,
  ]
  const bottomStyle = [
    "-150%",
    "-150%",
    "-300%",
    "-250%",
    "-150%",
    "-100%",
  ]

  return (
    <div className="top-bar-container">
      <div className="map-name">{mapName}</div>
      <div className="separator"></div>
      <div className="everything-else-topbar-container">
        <div className="tabs-and-buttons-container">
        <div className="tabs">
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              tabLabel={tab}
              tabId={index}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              tooltipText={tooltipTexts[index]}
              setSelectedClutter={setSelectedClutter}
              makeAllClutterUnselected={makeAllClutterUnselected}
              setSelectedMapblock={setSelectedMapblock}
              makeAllMapblockUnselected={makeAllMapblockUnselected}
              leftStyle={leftStyle[index]}    
              bottomStyle={bottomStyle[index]}
              setCollisionClipboard={setCollisionClipboard}
              selectedSingleTile={selectedSingleTile} setSelectedSingleTile={setSelectedSingleTile}
            />
          ))}
        </div>
        <div className="button-container">
          <AddRowTop setGridZoomData={setGridZoomData} tileGrid={tileGrid} setTileGrid={setTileGrid} mapData={mapData} setMapData={setMapData} collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid} adjustCPositionOnTilemapOperation={adjustCPositionOnTilemapOperation} adjustMPositionOnTilemapOperation={adjustMPositionOnTilemapOperation}/>
          <AddRowRight tileGrid={tileGrid} setTileGrid={setTileGrid} mapData={mapData} setMapData={setMapData} collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid} />
          <AddRowBot tileGrid={tileGrid} setTileGrid={setTileGrid} mapData={mapData} setMapData={setMapData}collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid} />
          <AddRowLeft setGridZoomData={setGridZoomData} tileGrid={tileGrid} setTileGrid={setTileGrid} mapData={mapData} setMapData={setMapData} collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid} adjustCPositionOnTilemapOperation={adjustCPositionOnTilemapOperation} adjustMPositionOnTilemapOperation={adjustMPositionOnTilemapOperation}/>
          <RemoveRowTop setGridZoomData={setGridZoomData} tileGrid={tileGrid} setTileGrid={setTileGrid} mapData={mapData} setMapData={setMapData} collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid} adjustCPositionOnTilemapOperation={adjustCPositionOnTilemapOperation} adjustMPositionOnTilemapOperation={adjustMPositionOnTilemapOperation}/>
          <RemoveRowRight tileGrid={tileGrid} setTileGrid={setTileGrid} mapData={mapData} setMapData={setMapData} collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid}/>
          <RemoveRowBot tileGrid={tileGrid} setTileGrid={setTileGrid} mapData={mapData} setMapData={setMapData} collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid}/>
          <RemoveRowLeft setGridZoomData={setGridZoomData} tileGrid={tileGrid} setTileGrid={setTileGrid} mapData={mapData} setMapData={setMapData} collisionGrid={collisionGrid} setCollisionGrid={setCollisionGrid} adjustCPositionOnTilemapOperation={adjustCPositionOnTilemapOperation} adjustMPositionOnTilemapOperation={adjustMPositionOnTilemapOperation}/>
        </div>
        </div>
        <div className="always-visible-buttons-container">
          <RefreshButton setGridZoomData={setGridZoomData} />
          <CollisionButton setGridZoomData={setGridZoomData} booleanButtons={booleanButtons} setBooleanButtons={setBooleanButtons}/>
          <ShowGridButton booleanButtons={booleanButtons} setBooleanButtons={setBooleanButtons}/>
          <FineGridButton booleanButtons={booleanButtons} setBooleanButtons={setBooleanButtons}/>
        </div>
        <div className="global-buttons-container">
          <SaveButton handleSaveMap={handleSaveMap}/>
          <LoadButton 
            onFileLoad={onFileLoad}
            mapName={mapName} setMapName={setMapName} mapData={mapData} setMapData={setMapData}
          />
          <NewProjectButton createNewMap={createNewMap}/>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
