import React, {useState} from "react";
import Chip from "./Chips.tsx";
import {Popup} from "react-leaflet";
import type {OsmElement} from '../types.ts';
import {formatOpeningHours} from "../utils/openingHoursFormatter.ts";
import AddToListModal from "./AddPlaceModal.tsx";
import Visit from "./Visit.tsx";
import "../styles/MapPopup.css";
import Watch from "./Watch.tsx";

interface MapPopupProps {
    place: OsmElement;
    onClose?: () => void;
    onVisited?: () => void;
    isVisited?: boolean;
}

const MapPopup: React.FC<MapPopupProps> = ({
                                               place,
                                               onClose,
                                               onVisited,
                                               isVisited = false
                                           }) => {
    const formattedHours = formatOpeningHours(place.tags?.opening_hours);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleVisited = () => {
        if (onVisited) {
            onVisited();
        }
    };

    return (
        <div>
            <Popup>
                <div className='popup-card'>
                    <div className='popup-header'>
                        <div className='popup-title'>
                            {place.tags?.name ?? "Unnamed Restaurant"}
                        </div>
                        <div className='popup-header-actions'>
                            {!isVisited && <Watch osmId={place.id} />}
                            <Visit osmId={place.id} onVisited={handleVisited} />
                            {onClose && (
                                <button
                                    className="popup-close-btn"
                                    onClick={handleClose}
                                    title="Close"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
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