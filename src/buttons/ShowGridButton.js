//src/buttons/ShowGridButton.js
import React,{useEffect} from 'react'

const ShowGridButton = ({booleanButtons, setBooleanButtons}) => {

  const doThisOnClick = () => {
    setBooleanButtons(prev => ({...prev, grid: !prev.grid}));
  };

  // useEffect(() => {
  //   console.log("current buttons status", booleanButtons);
  // }, [booleanButtons]);

  return (
    <button className={`my-button my-boolean-button ${booleanButtons.grid ? "active" : ""}`} onClick={doThisOnClick}>
        <img src="/icons/gridicon.png" alt="ShowGrid" className="my-icon" />
    </button>
  )
}

export default ShowGridButton