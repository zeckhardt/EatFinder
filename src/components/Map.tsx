import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useState, useRef } from "react";
import { LatLngBounds, type LatLngExpression } from "leaflet";
import SearchBar from "./SearchBar";
import Chip from "./Chips";
import '../Map.css'

interface MapListenerProps {
    onBoundsChange: (bounds: LatLngBounds) => void;
}

const MapListener: React.FC<MapListenerProps> = ({onBoundsChange}) => {
    useMapEvents({
        moveend: (event) => {
            const bounds = event.target.getBounds();
            onBoundsChange(bounds);
        },
    });

    return null;
};

interface OsmElement {
    id: number;
    lat: number;
    lon: number;
    tags?: {
        [key: string]: string;
    }
}

interface OverpassResponse {
    elements: OsmElement[];
}

const OverpassMap: React.FC = () => {
    const [restaurants, setRestaurants] = useState<OsmElement[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const center: LatLngExpression = [40.735, -73.930];
    const [, setSearchQuery] = useState<string>('');
    const boundsRef = useRef<LatLngBounds | null>(null);

    const fetchRestaurants = useCallback(async (bounds: LatLngBounds, query?: string) => {
            setLoading(true);

            const south = bounds.getSouth();
            const west = bounds.getWest();
            const north = bounds.getNorth();
            const east = bounds.getEast();

            const nameFilter = query ? `["name"~"${query}",i]` : "";

            const overpassQuery = `
			[out:json][timeout:25];
			node["amenity"~"^(restaurant|cafe|pub|bar|fast_food|biergarten|ice_cream)$"]${nameFilter}(${south},${west},${north},${east});
			out;
		`;

            try {
                const response = await fetch("https://overpass-api.de/api/interpreter", {
                    method: "POST",
                    body: overpassQuery,
                    headers: { "Content-Type": "text/plain" },
                });

                const data: OverpassResponse = await response.json();
                setRestaurants(data.elements || []);
            } catch (err) {
                console.error("Overpass fetch failed", err);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return (
        <div className="overpass-map-container">
            <MapContainer center={center} zoom={16} className="map-container">
                <TileLayer
                    attribution='&copy; <a href="https://www.hotosm.org/">Humanitarian OpenStreetMap Team</a>'
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                />

                <MapListener
                    onBoundsChange={(bounds) => {
                        boundsRef.current = bounds;
                    }}
                />

                <SearchBar
                    onSearch={(query) => {
                        setSearchQuery(query);
                        if (boundsRef.current) {
                            fetchRestaurants(boundsRef.current, query)
                        } else {
                            console.warn("Bounds not available")
                        }
                    }}
                />

                {restaurants.map((place) => (
                    <CircleMarker
                        key={place.id}
                        center={[place.lat, place.lon]}
                        radius={10}
                        pathOptions={{
                            color: "#ff6600",
                            fillColor: "#ffa366",
                            fillOpacity: 0.8,
                        }}
                    >
                        <Popup>
                            {place.tags?.name ?? "Unnamed Restaurant"}
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
                            {place.tags?.opening_hours ?? "unknown"}
                            <br />
                            <a href={place.tags?.website ?? "" } target="_blank" rel="noopener noreferrer">Website</a>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {loading && <div className="loading-indicator">Loading...</div>}
        </div>
    );
};

export default OverpassMap;