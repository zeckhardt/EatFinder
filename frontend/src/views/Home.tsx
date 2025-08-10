import '../styles/Home.css'
import AppNavBar from "../components/NavBar.tsx";
import Map from "../components/Map.tsx";
import Table from '../components/Table.tsx';
import React, { createContext, useState, useContext } from "react";

type MapNavigationContextType = {
    navigateToLocation: (lat: number, lon: number, osmId: number) => void;
    navigationTarget: { lat: number; lon: number; osmId: number } | null;
    clearNavigation: () => void;
};

const MapNavigationContext = createContext<MapNavigationContextType | null>(null);

export const useMapNavigation = () => {
    const context = useContext(MapNavigationContext);
    if (!context) {
        throw new Error('useMapNavigation must be used within a MapNavigationProvider');
    }
    return context;
};

const Home: React.FC = () => {
    const [navigationTarget, setNavigationTarget] = useState<{ lat: number; lon: number; osmId: number } | null>(null);

    const navigateToLocation = (lat: number, lon: number, osmId: number) => {
        setNavigationTarget({ lat, lon, osmId });
    };

    const clearNavigation = () => {
        setNavigationTarget(null);
    };

    return (
        <MapNavigationContext.Provider value={{ navigateToLocation, navigationTarget, clearNavigation }}>
            <div>
                <AppNavBar />
                <div className='main-content'>
                    <div className='table-wrapper'>
                        <Table />
                    </div>
                    <div className='map-wrapper'>
                        <Map />
                    </div>
                </div>
            </div>
        </MapNavigationContext.Provider>
    )
}

export default Home;