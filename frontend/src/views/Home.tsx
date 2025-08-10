import '../styles/Home.css'
import AppNavBar from "../components/NavBar.tsx";
import Map from "../components/Map.tsx";
import Table from '../components/Table.tsx';
import React from "react";

const Home: React.FC = () => {
    return (
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
    )
}

export default Home;