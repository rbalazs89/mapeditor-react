//src/components/SelectedObjectInfo.js
import React from 'react'
import "./RightSidebar.css";
import clutterImages from '../import/clutter'; // Import the generated clutter file
import mapblockImages from '../import/mapblock';
import tileImages from '../import/tileImages';


const SelectedObjectInfo = ({selectedClutter, selectedMapblock, currentTab, selectedSingleTile}) => {
  return (
    <div className="selected-object-container">
      {currentTab === 3 && selectedClutter !== null && selectedClutter.imageNumber !== null ? (
        <div>
          <div className="image-container" style={{ backgroundColor: 'var(--representing-null-color)' }}>
            <img
              src={clutterImages[selectedClutter.imageNumber]}
              alt="Selected Object"
              className="selected-object-image"
            />
          </div>
          <table className="selected-object-table">
            <thead>
              <tr>
                <th className="table-header">Attribute</th>
                <th className="table-header">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row"><td>Image Number</td><td>{selectedClutter.imageNumber}</td></tr>
              <tr className="table-row-alt"><td>Height</td><td>{selectedClutter.imageHeight}</td></tr>
              <tr className="table-row"><td>Width</td><td>{selectedClutter.imageWidth}</td></tr>
              {selectedClutter.fromMapArea && (
                <>
                  <tr className="table-row-alt"><td>ID</td><td>{selectedClutter.idNumber}</td></tr>
                  <tr className="table-row"><td>X</td><td>{selectedClutter.worldX.toFixed(0)}</td></tr>
                  <tr className="table-row-alt"><td>Y</td><td>{selectedClutter.worldY.toFixed(0)}</td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      ) : null}
      
      {currentTab === 2 && selectedMapblock !== null && selectedMapblock.imageNumber !== null ? (
        <div>
          <div className="image-container" style={{ backgroundColor: 'var(--representing-null-color)' }}>
            <img
              src={mapblockImages[selectedMapblock.imageNumber]}
              alt="Selected Mapblock"
              className="selected-object-image"
            />
          </div>
          <table className="selected-object-table">
            <thead>
              <tr>
                <th className="table-header">Attribute</th>
                <th className="table-header">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row"><td>Image Number</td><td>{selectedMapblock.imageNumber}</td></tr>
              <tr className="table-row-alt"><td>Height</td><td>{selectedMapblock.imageHeight}</td></tr>
              <tr className="table-row"><td>Width</td><td>{selectedMapblock.imageWidth}</td></tr>
              {selectedMapblock.fromMapArea && (
                <>
                  <tr className="table-row-alt"><td>ID</td><td>{selectedMapblock.idNumber}</td></tr>
                  <tr className="table-row"><td>X</td><td>{selectedMapblock.worldX.toFixed(0)}</td></tr>
                  <tr className="table-row-alt"><td>Y</td><td>{selectedMapblock.worldY.toFixed(0)}</td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {currentTab === 0 && selectedSingleTile !== null && selectedSingleTile.imageNumber !== null ? (
        <div>
          <div className="image-container" style={{ backgroundColor: 'var(--representing-null-color)' }}>
            <img
              src={tileImages[selectedSingleTile.imageNumber]}
              alt="Selected Tile"
              className="selected-object-image"
            />
          </div>
          <table className="selected-object-table">
            <thead>
              <tr>
                <th className="table-header">Attribute</th>
                <th className="table-header">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row"><td>ID</td><td>{selectedSingleTile.imageNumber}</td></tr>
              {selectedSingleTile.isSelectedFromMapArea && (
                <>
                  <tr className="table-row-alt"><td>Col:</td><td>{selectedSingleTile.column}</td></tr>
                  <tr className="table-row"><td>Row:</td><td>{selectedSingleTile.row}</td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      
    </div>
  );
};

export default SelectedObjectInfo