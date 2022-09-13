/**
 *   @author : Vasu Gamdha (B00902737)
 */

import React, { useEffect, useState } from "react";
import { Navbar, Nav } from "react-bootstrap";

// inspired by https://www.dreamstime.com/stock-illustration-bed-breakfast-concept-symbol-icon-logo-template-image43720069
import bnblogo from "../../assets/bnblogo.drawio.png";

import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        console.log("useEffect");
        const email = localStorage?.getItem("email");
        setEmail(email);
    }, [localStorage?.getItem("isLoggedIn")]);

    const logoutClick = () => {
        localStorage.clear();
        setEmail(null);
        navigate("/");
    };

    return (
        <Navbar
            className="shadow-lg p-0"
            collapseOnSelect
            expand="md"
            sticky="top"
            id="navbar"
        >
            <div className="container-fluid">
                <Navbar.Brand href="/">
                    <img src={bnblogo} alt="Bed and Breakfast" className="logo-size" />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="colapse-nav" className="justify-content-end">
                    <Nav>
                        <Nav.Link href="/adminvisualize">Admin Visualization</Nav.Link>
                        <Nav.Link href="/visualize">Booking Trend</Nav.Link>
                        <Nav.Link href="/tours">Tours</Nav.Link>
                        <Nav.Link href="/menu">Food Menu</Nav.Link>
                        <Nav.Link href="/bookroom">Book Room</Nav.Link>
                        {email && <Nav.Link href="/message">Message</Nav.Link>}
                        {!email && <Nav.Link href="/login">Login</Nav.Link>}
                        {!email && <Nav.Link href="/signup">Signup</Nav.Link>}
                        {email && <Nav.Link onClick={logoutClick}>Log out</Nav.Link>}

                    </Nav>
                </Navbar.Collapse>
            </div>
        </Navbar>
    );

}

export default Header;