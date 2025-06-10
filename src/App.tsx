import './styles/App.css'
import AppNavBar from "./components/NavBar.tsx";
import Map from "./components/Map.tsx";

function App() {

  return (
    <div>
        <AppNavBar />
      <div className='main-content'>
        <Map />
      </div>
    </div>
  )
}

export default App
