import React, {useState} from "react";
import Chip from "./Chips.tsx";
import {Popup} from "react-leaflet";
import type {OsmElement} from '../types.ts';
import {formatOpeningHours} from "../utils/openingHoursFormatter.ts";
import AddToListModal from "./AddPlaceModal.tsx";

interface MapPopupProps {
    place: OsmElement;
}

const MapPopup: React.FC<MapPopupProps> = ({ place }) => {
    const formattedHours = formatOpeningHours(place.tags?.opening_hours);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                <div className='hours-contianer'>
                    {formattedHours.map((dayHour, index) => (
                        <div key={index} className="day-hours">
                            <span className="day-name">{dayHour.day}:</span>{' '}
                            <span className="hours-time">{dayHour.hours}</span>
                        </div>
                    ))}
                </div>
                <br />
                <a href={place.tags?.website ?? "" } target="_blank" rel="noopener noreferrer">Website</a>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-600 font-semibold hover:underline mt-2"
                >
                    ➕
                </button>
                <AddToListModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    place={place}
                />
            </Popup>
        </div>
    )
}

export default MapPopup;