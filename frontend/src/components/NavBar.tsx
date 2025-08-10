import React, { useState } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
} from 'reactstrap';
import {SignedIn, SignedOut, SignInButton, UserButton, useAuth} from "@clerk/clerk-react";

const AppNavBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {isSignedIn} = useAuth();

    const toggle = () => setIsOpen(!isOpen);

    return (
        <Navbar color="dark" dark expand="md" className="px-3">
            <NavbarBrand href={isSignedIn ? '/EatFinder/dashboard' : '/'}>Where the Eats @</NavbarBrand>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpen} navbar>
                <Nav className="me-auto" navbar>

                </Nav>
                <div className="d-flex">
                    <SignedOut>
                        <SignInButton
                            mode="redirect"
                            forceRedirectUrl='/EatFinder/dashboard'
                            signUpForceRedirectUrl='/EatFinder/dashboard'
                        />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </Collapse>
        </Navbar>
    );
}

export default AppNavBar;