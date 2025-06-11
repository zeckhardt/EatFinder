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
                    <div className='list-button-group'>
                        <button className='add-button button-outline'>Add List</button>
                        <button className='remove-button button-outline'>Remove List</button>
                    </div>
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