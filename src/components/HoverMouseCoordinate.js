// In HoverMouseCoordinate.js
import React from 'react';
import "./RightSidebar.css";
import { TILE_SIZE } from "../constants";

const HoverMouseCoordinate = ({ mousePosRef, gridZoomData, mapData }) => {
    const calculateWorldCoord = (mouse, offset, scale) => {
        return Math.floor((mouse - (offset / scale)) / scale);
    };

    const worldX = calculateWorldCoord(mousePosRef.x, gridZoomData.posX, gridZoomData.scale);
    const worldY = calculateWorldCoord(mousePosRef.y, gridZoomData.posY, gridZoomData.scale);

    const isInsideGrid =
        worldX >= 0 && worldY >= 0 && worldX < mapData.maxColumn * TILE_SIZE && worldY < mapData.maxRow * TILE_SIZE ;
    
    return (
        <div className='hover-mouse-coordinate'>
            <div className='coord-table'>
                <div className='coord-row'>
                    <div className='coord-label'>X:</div>
                    <div className='coord-value' style={{ minWidth: '5ch' }}>{isInsideGrid ? worldX : ''}</div>
                    <div className='coord-label'>Y:</div>
                    <div className='coord-value' style={{ minWidth: '5ch' }}>{isInsideGrid ? worldY : ''}</div>
                </div>
                <div className='coord-row'>
                    <div className='coord-label'>Col:</div>
                    <div className='coord-value' style={{ minWidth: '5ch' }}>{isInsideGrid ? Math.floor(worldX  / TILE_SIZE) : ''}</div>
                    <div className='coord-label'>Row:</div>
                    <div className='coord-value' style={{ minWidth: '5ch' }}>{isInsideGrid ? Math.floor(worldY  / TILE_SIZE) : ''}</div>
                </div>
            </div>
        </div>
    );
};

export default HoverMouseCoordinate