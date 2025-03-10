//Refresh.js
import React from 'react'

const RefreshButton = ({setGridZoomData }) => {

  const doThisOnClick = () => {
    setGridZoomData({scale: 1, posX:0, posY:0});
  };

  return (
    <div className="tooltip-container">
      <button className="my-button" onClick={doThisOnClick}>
        <img src="/icons/refreshicon.png" alt="Refresh" className="my-icon"/>
        <span className="tooltip-text" style={{ bottom: "-140%", left: "100%" }}>Reset the grid position. Use mouse wheel + ctrl to zoom. Press mouse wheel to pan.</span>
      </button>
    </div>
  )
}

export default RefreshButton