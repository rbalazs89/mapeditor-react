import React from 'react'

const CollisionButton = ({booleanButtons, setBooleanButtons}) => {
    
    const doThisOnClick = () => {
        setBooleanButtons(prev => ({...prev, tileCollision: !prev.tileCollision}));
    };
    
    return (
    <button className={`my-button my-boolean-button ${booleanButtons.tileCollision ? "active" : ""}`} onClick={doThisOnClick}>
        <img src="/icons/wallicon.png" alt="Wall" className="my-icon" />
    </button>
    )
}

export default CollisionButton