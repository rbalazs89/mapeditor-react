//NewProject.js
import React from 'react'

const LoadButton = ({createNewMap}) => {

  const doThisOnClick = () => {
    createNewMap();
  };

  return (
    <div className="tooltip-container">
      <button className="global-button" onClick={doThisOnClick}>
        <img src="/icons/newfileicon2.png" alt="NewFile" className="global-icon"/>
        <span className="tooltip-text" style={{ bottom: "-20%", left: "-40%" }}>Create new project.</span>
      </button>
    </div>
  )
}

export default LoadButton