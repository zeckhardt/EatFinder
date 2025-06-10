import React from "react";
import Chip from "./Chips.tsx";
import {Popup} from "react-leaflet";
import type {OsmElement} from '../types.ts';

interface MapPopupProps {
    place: OsmElement;
}

const MapPopup: React.FC<MapPopupProps> = ({ place }) => {

    return (
        <div>
            <Popup>
                <div className='name-container'>
                    {place.tags?.name ?? "Unnamed Restaurant"}
                </div>
                <br />
                {"Cuisine: "}
                <div className="chip-container">
                    {(() => {
                        const rawCuisine = place.tags?.cuisine ?? 'unknown';
                        const cuisines = rawCuisine.split(';');

                        return cuisines.map((cuisine) => (
                            <Chip label={cuisine} />
                        ));
                    })()}
                </div>
                <br/>
                {"Hours: "}
                <br/>
                {place.tags?.opening_hours ?? "unknown"}
                <br />
                <a href={place.tags?.website ?? "" } target="_blank" rel="noopener noreferrer">Website</a>
            </Popup>
        </div>
    )
}

export default MapPopup;