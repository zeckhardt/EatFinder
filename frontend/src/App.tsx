import './styles/App.css';
import {BrowserRouter} from 'react-router-dom';
import {Routes, Route} from "react-router-dom";
import Landing from "./views/Landing.tsx";
import Home from "./views/Home.tsx";
import {RedirectToSignIn, SignedIn, SignedOut, SignIn, SignUp} from "@clerk/clerk-react";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Page */}
                <Route path="/" element={<Landing />} />

                {/* Only show when signed in */}
                <Route
                    path="/dashboard"
                    element={
                        <>
                            <SignedIn>
                                <Home />
                            </SignedIn>
                            <SignedOut>
                                <RedirectToSignIn />
                            </SignedOut>
                        </>
                    }
                />

                <Route
                    path="/signup/*"
                    element={
                        <div className="flex h-screen justify-center items-center">
                            <SignUp
                                path="/signup"
                                routing="path"
                                signInUrl="/sign-in"
                            />
                        </div>
                    }
                />

                <Route
                    path="/sign-in/*"
                    element={
                        <div className="flex h-screen justify-center items-center">
                            <SignIn
                                path="/sign-in"
                                routing="path"
                                signUpUrl="/signup"
                            />
                        </div>
                    }
                />

                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;