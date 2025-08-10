import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useState, useRef, useEffect } from "react";
import { LatLngBounds, type LatLngExpression } from "leaflet";
import SearchBar from "./SearchBar";
import type {OsmElement} from "../types.ts";
import MapPopup from "./MapPopup.tsx";
import '../styles/Map.css'
import axios from "axios";
import { useUserId } from "../UserIdContext.tsx";

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

interface OverpassResponse {
    elements: OsmElement[];
}

const OverpassMap: React.FC = () => {
    const [restaurants, setRestaurants] = useState<OsmElement[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [visitedPlaces, setVisitedPlaces] = useState<Set<number>>(new Set());
    const center: LatLngExpression = [40.735, -73.930];
    const [, setSearchQuery] = useState<string>('');
    const boundsRef = useRef<LatLngBounds | null>(null);
    const userId = useUserId();

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

    // Fetch visit status for all restaurants
    const fetchVisitStatus = useCallback(async (restaurantIds: number[]) => {
        if (!userId || restaurantIds.length === 0) return;
        
        const visitedSet = new Set<number>();
        
        try {
            const apiKey = import.meta.env.VITE_BACKEND_API_KEY;
            
            // Fetch visit status for each restaurant
            const visitPromises = restaurantIds.map(async (osmId) => {
                try {
                    const response = await axios.get(
                        `https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/visit?osmID=${osmId}`,
                        {
                            headers: {
                                "x-api-key": apiKey,
                            },
                        }
                    );
                    if (response.data.place) {
                        visitedSet.add(osmId);
                    }
                } catch (err) {
                    // Ignore errors for individual visit status checks
                }
            });
            
            await Promise.all(visitPromises);
            setVisitedPlaces(visitedSet);
        } catch (err) {
            console.error("Error fetching visit status:", err);
        }
    }, [userId]);

    // Fetch visit status when restaurants change
    useEffect(() => {
        if (restaurants.length > 0) {
            const restaurantIds = restaurants.map(place => place.id);
            fetchVisitStatus(restaurantIds);
        }
    }, [restaurants, fetchVisitStatus]);

    // Get marker style based on visit status
    const getMarkerStyle = (osmId: number) => {
        const isVisited = visitedPlaces.has(osmId);
        
        if (isVisited) {
            return {
                color: "#34C759", // Apple green
                fillColor: "rgba(52, 199, 89, 0.18)",
            };
        } else {
            return {
                color: "#007AFF", // Apple blue
                fillColor: "rgba(0, 122, 255, 0.18)",
            };
        }
    };

    return (
        <div className="overpass-map-container">
            <MapContainer
                center={center}
                zoom={16}
                className="map-container apple-map"
                zoomControl={true}
                scrollWheelZoom={true}
                touchZoom={true}
                zoomSnap={0.5}
                wheelDebounceTime={35}
            >
                {/* More colorful but simple Carto Voyager basemap */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
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

                {restaurants.map((place) => {
                    const markerStyle = getMarkerStyle(place.id);

                    return (
                        <CircleMarker
                            key={place.id}
                            center={[place.lat, place.lon]}
                            radius={7}
                            pathOptions={{
                                color: markerStyle.color,
                                fillColor: markerStyle.fillColor,
                                fillOpacity: 0.6,
                                weight: 1.5,
                                opacity: 0.95,
                            }}
                            className="restaurant-marker"
                        >
                            <MapPopup place={place}/>
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            {loading && (
                <div className="loading-indicator">
                    Loading restaurants...
                </div>
            )}
        </div>
    );
};

export default OverpassMap;