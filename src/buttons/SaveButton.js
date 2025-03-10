import React from 'react'

const SaveButton = ({ handleSaveMap }) => {
  
      return (
        <div className="tooltip-container">
          <button className="global-button" onClick={handleSaveMap}>
            <img src="/icons/saveicon.png" alt="Save" className="global-icon"/>
            <span className="tooltip-text" style={{ bottom: "-20%", left: "-40%" }}>Overwrite current project files.</span>
          </button>
        </div>
      )
}

export default SaveButton