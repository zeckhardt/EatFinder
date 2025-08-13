import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useState, useRef, useEffect } from "react";
import { LatLngBounds, type LatLngExpression } from "leaflet";
import SearchBar from "./SearchBar";
import type {OsmElement} from "../types.ts";
import MapPopup from "./MapPopup.tsx";
import '../styles/Map.css'
import axios from "axios";
import { useUserId } from "../UserIdContext.tsx";
import { useMapNavigation } from "../views/Home.tsx";

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

// Component to handle map navigation and popup management
const MapNavigator: React.FC = () => {
    const map = useMap();
    const { navigationTarget, clearNavigation } = useMapNavigation();

    useEffect(() => {
        if (navigationTarget) {
            // Center the map on the target location
            map.setView([navigationTarget.lat, navigationTarget.lon], 18);

            // Clear the navigation target after centering
            setTimeout(() => {
                clearNavigation();
            }, 100);
        }
    }, [navigationTarget, map, clearNavigation]);

    return null;
};

const OverpassMap: React.FC = () => {
    const [restaurants, setRestaurants] = useState<OsmElement[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [visitedPlaces, setVisitedPlaces] = useState<Set<number>>(new Set());
    const [watchedPlaces, setWatchedPlaces] = useState<Set<number>>(new Set());
    const [navigatedPlace, setNavigatedPlace] = useState<OsmElement | null>(null);
    const center: LatLngExpression = [40.735, -73.930];
    const [, setSearchQuery] = useState<string>('');
    const boundsRef = useRef<LatLngBounds | null>(null);
    const navigatedMarkerRef = useRef<any>(null);
    const userId = useUserId();
    const { navigationTarget } = useMapNavigation();

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

    // Fetch navigated place data when navigation target changes
    const fetchNavigatedPlace = useCallback(async (osmId: number, lat: number, lon: number) => {
        try {
            const overpassQuery = `
                [out:json][timeout:25];
                node(${osmId});
                out;
            `;

            const response = await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: overpassQuery,
                headers: { "Content-Type": "text/plain" },
            });

            const data = await response.json();
            if (data.elements && data.elements.length > 0) {
                const place = data.elements[0] as OsmElement;
                setNavigatedPlace(place);
            } else {
                // If not found in OSM, create a basic place object
                const fallbackPlace = {
                    id: osmId,
                    lat: lat,
                    lon: lon,
                    tags: {
                        name: `Place (${osmId})`,
                        amenity: 'restaurant'
                    }
                };
                setNavigatedPlace(fallbackPlace);
            }
        } catch (error) {
            console.error(`Error fetching navigated place:`, error);
            // Create a basic place object as fallback
            const fallbackPlace = {
                id: osmId,
                lat: lat,
                lon: lon,
                tags: {
                    name: `Place (${osmId})`,
                    amenity: 'restaurant'
                }
            };
            setNavigatedPlace(fallbackPlace);
        }
    }, []);

    // Handle navigation target changes
    useEffect(() => {
        if (navigationTarget) {
            fetchNavigatedPlace(navigationTarget.osmId, navigationTarget.lat, navigationTarget.lon);
        } else {
            // Clear navigated place when navigation is cleared
            setNavigatedPlace(null);
        }
    }, [navigationTarget, fetchNavigatedPlace]);

    // Open popup when navigated place is set
    useEffect(() => {
        if (navigatedPlace && navigatedMarkerRef.current) {
            // Small delay to ensure the marker is rendered
            setTimeout(() => {
                navigatedMarkerRef.current?.openPopup();
            }, 200);
        }
    }, [navigatedPlace]);

    // Handle popup close
    const handlePopupClose = () => {
        setNavigatedPlace(null);
    };

    // Function to handle when a place is marked as visited
    const handlePlaceVisited = useCallback((osmId: number) => {
        setVisitedPlaces(prev => new Set([...prev, osmId]));
        // Remove from watched places if it was being watched
        setWatchedPlaces(prev => {
            const newWatched = new Set(prev);
            newWatched.delete(osmId);
            return newWatched;
        });
    }, []);

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

    const fetchWatchStatus = useCallback(async (restaurantIds: number[]) => {
        if (!userId || restaurantIds.length === 0) return;

        const watchedSet = new Set<number>();

        try {
            const apiKey = import.meta.env.VITE_BACKEND_API_KEY;

            // Fetch watch status for each restaurant
            const watchPromises = restaurantIds.map(async (osmId) => {
                try {
                    const response = await axios.get(
                        `https://backend-frosty-lake-2293.fly.dev/api/users/${userId}/watch?osmID=${osmId}`,
                        {
                            headers: {
                                "x-api-key": apiKey,
                            },
                        }
                    );
                    if (response.data.place) {
                        watchedSet.add(osmId);
                    }
                } catch (err) {
                    // Ignore errors for individual visit status checks
                }
            });

            await Promise.all(watchPromises);
            setWatchedPlaces(watchedSet);
        } catch (err) {
            console.error("Error fetching watch status:", err);
        }
    }, [userId]);

    // Clean up watched places when visited places change
    useEffect(() => {
        setWatchedPlaces(prev => {
            const newWatched = new Set(prev);
            let hasChanged = false;

            // Remove any watched places that are now visited
            visitedPlaces.forEach(visitedId => {
                if (newWatched.has(visitedId)) {
                    newWatched.delete(visitedId);
                    hasChanged = true;
                }
            });

            return hasChanged ? newWatched : prev;
        });
    }, [visitedPlaces]);

    // Fetch visit & watch status' when restaurants change
    useEffect(() => {
        if (restaurants.length > 0) {
            const restaurantIds = restaurants.map(place => place.id);
            fetchVisitStatus(restaurantIds);
            fetchWatchStatus(restaurantIds);
        }
    }, [restaurants, fetchVisitStatus, fetchWatchStatus]);

    // Get marker style based on visit status
    const getMarkerStyle = (osmId: number) => {
        const isVisited = visitedPlaces.has(osmId);
        const isWatched = watchedPlaces.has(osmId);

        if (isVisited) {
            return {
                color: "#34C759", // Apple green
                fillColor: "rgba(52, 199, 89, 0.18)",
            };
        } else if (isWatched) {
            return {
                color: "#c79434", // Apple orange
                fillColor: "rgba(199,170,52,0.18)",
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
                <MapNavigator />
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
                            <MapPopup
                                place={place}
                                onVisited={() => handlePlaceVisited(place.id)}
                                isVisited={visitedPlaces.has(place.id)}
                            />
                        </CircleMarker>
                    );
                })}

                {/* Special marker for navigated place */}
                {navigatedPlace && (
                    <CircleMarker
                        ref={navigatedMarkerRef}
                        key={`navigated-${navigatedPlace.id}`}
                        center={[navigatedPlace.lat, navigatedPlace.lon]}
                        radius={10}
                        pathOptions={{
                            color: "#FF3B30",
                            fillColor: "rgba(255, 59, 48, 0.3)",
                            fillOpacity: 0.8,
                            weight: 3,
                            opacity: 1,
                        }}
                        className="navigated-marker"
                    >
                        <MapPopup
                            place={navigatedPlace}
                            onClose={handlePopupClose}
                            onVisited={() => handlePlaceVisited(navigatedPlace.id)}
                            isVisited={visitedPlaces.has(navigatedPlace.id)}
                        />
                    </CircleMarker>
                )}
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