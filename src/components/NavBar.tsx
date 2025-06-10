import React, { useState } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap';
import {SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/clerk-react";

const AppNavBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <Navbar color="dark" dark expand="md" className="px-3">
            <NavbarBrand href="/">Where the Eats @</NavbarBrand>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpen} navbar>
                <Nav className="me-auto" navbar>
                    <UncontrolledDropdown nav inNavbar>
                        <DropdownToggle nav caret>
                            Options
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem>Option 1</DropdownItem>
                            <DropdownItem>Option 2</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem>Reset</DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </Nav>
                <div className="d-flex">
                    <SignedOut>
                        <SignInButton />
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