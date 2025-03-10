//src/buttons/FineGridButton.js
import React from 'react'

const FineGridButton = ({booleanButtons, setBooleanButtons}) => {

  const doThisOnClick = () => {
    setBooleanButtons(prev => ({...prev, fineGrid: !prev.fineGrid}));
  };

  return (
    <div className="tooltip-container">
      <button className={`my-button my-boolean-button ${booleanButtons.fineGrid ? "active" : ""}`} onClick={doThisOnClick}>
        <img src="/icons/finegridicon.png" alt="ShowFineGrid" className="my-icon"/>
        <span className="tooltip-text" style={{ bottom: "120%", left: "100%" }}>Show fine mesh of collision.</span>
      </button>
    </div>
  )
}

export default FineGridButton