import React, {useState} from "react";
import Chip from "./Chips.tsx";
import {Popup} from "react-leaflet";
import type {OsmElement} from '../types.ts';
import {formatOpeningHours} from "../utils/openingHoursFormatter.ts";
import AddToListModal from "./AddPlaceModal.tsx";
import Visit from "./Visit.tsx";
import "../styles/MapPopup.css";

interface MapPopupProps {
    place: OsmElement;
}

const MapPopup: React.FC<MapPopupProps> = ({ place }) => {
    const formattedHours = formatOpeningHours(place.tags?.opening_hours);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <Popup>
                <div className='popup-card'>
                    <div className='popup-header'>
                        <div className='popup-title'>
                            {place.tags?.name ?? "Unnamed Restaurant"}
                        </div>
                        <Visit osmId={place.id} />
                    </div>

                    <div className="popup-chips">
                        {(place.tags?.cuisine ?? 'unknown').split(';').map((cuisine, idx) => (
                            <Chip key={`${place.id}-cuisine-${idx}`} label={cuisine} />
                        ))}
                    </div>

                    <div className='popup-section-title'>Hours</div>
                    <div className='hours-container'>
                        {formattedHours.map((dayHour, index) => (
                            <div key={index} className="day-hours">
                                {dayHour.day && <span className="day-name">{dayHour.day}:</span>}
                                <span className="hours-time">{dayHour.hours}</span>
                            </div>
                        ))}
                    </div>

                    <div className='popup-actions'>
                        <a className='popup-link' href={place.tags?.website ?? "" } target="_blank" rel="noopener noreferrer">Website</a>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="visit-button"
                        >
                            ➕
                        </button>
                    </div>

                    <AddToListModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        place={place}
                    />
                </div>
            </Popup>
        </div>
    )
}

export default MapPopup;