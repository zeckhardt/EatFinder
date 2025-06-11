import '../styles/App.css'
import AppNavBar from "../components/NavBar.tsx";
import Map from "../components/Map.tsx";
import React from "react";


const Home: React.FC = () => {

    return (
        <div>
            <AppNavBar />
            <div className='main-content'>
                <Map />
            </div>
        </div>
    )
}

export default Home;