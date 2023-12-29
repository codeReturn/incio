import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import { Navbar, Container, Nav, NavDropdown, Button, OverlayTrigger, Tooltip, Row, Col } from 'react-bootstrap'

import PageTitle from '../components/PageTitle';

import { useAuth } from '../shared/auth-hook';

import logoImage from '../images/logo.png';
import avatarImage from '../images/avatar.png'
import notificationImage from '../images/notification.png';

import axios from 'axios';

import { AuthContext } from '../context/auth-context';

const renderTooltip = (props) => (
    <Tooltip id="tooltip" {...props}>
      <h3>Test our app</h3>
      <p>Press this button to simulate how the app would work with your data.</p>
    </Tooltip>
);

const Navigation = () => {
    const auth = useContext(AuthContext)
    const { logout, userId } = useAuth();

    const userData = JSON.parse(localStorage.getItem('userData'))

    const [user, setUser] = useState()
    const fetchUser = async () => {
        try {
            const response = await axios.get(`https://inciohost.com/server/api/users/getuserinfo`, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + userData.token
                }
            })
    
            setUser(response?.data?.user)
        } catch (err) {
            console.log(err)
        } 
    }
  
    useEffect(() => {
        userData && fetchUser()
    }, []);

    const scroll = (type) => {
        if(showMobileNav === true) setShowMobileNav(false)

        const section = document.querySelector( '#' + type );
        section.scrollIntoView( { behavior: 'smooth', block: 'start' } );
    };

    const localTestData = Boolean(localStorage.getItem('testdata'))
    const [testData, setTestData] = useState(localTestData || false);

    const callTestData = () => {
        localStorage.setItem('testdata', 'true')
        setTestData(true)
        window.dispatchEvent(new Event('testCalled'));
    }

    const [showMobileNav, setShowMobileNav] = useState(false);

    const handleCloseMobileNav = () => setShowMobileNav(false);
    const handleShowMobileNav = () => setShowMobileNav(true);  
  
    return (
        <>
        {showMobileNav && (
            <>
            <div className="mobile-nav-modal">
                <div className="mobile-nav-modal-content">
                
                <div className="mobile-nav-modal-content-nav">
                    <div className="logo-container">
                        <img src={logoImage} className="img-fluid mobile-nav-logo" alt="Incio Logo" />
                    </div>
                    <div className="close-icon-container" onClick={handleCloseMobileNav}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <path d="M16.0009 14.1153L22.6005 7.51562L24.4861 9.40124L17.8865 16.0009L24.4861 22.6005L22.6005 24.4861L16.0009 17.8865L9.40124 24.4861L7.51562 22.6005L14.1153 16.0009L7.51562 9.40124L9.40124 7.51562L16.0009 14.1153Z" fill="black"/>
                        </svg>
                    </div>
                </div>

                <div className="mobile-nav-modal-list">
                        <Nav.Link href="#" className="custom-main-nav-link" onClick={() => scroll('product-scroll')}>Product</Nav.Link>
                        <Nav.Link href="#" className="custom-main-nav-link" onClick={() => scroll('pricing-scroll')}>Pricing</Nav.Link>
                        <Nav.Link href="#" className="custom-main-nav-link" onClick={() => scroll('about-scroll')}>About</Nav.Link>
                        <Nav.Link href="/support" className="custom-main-nav-link">Contact</Nav.Link>
                </div>

                <div className="mobile-nav-modal-buttons">
                        <Row>
                        <Col xs={6}>
                            <a className="custom-main-nav-link-btn" href="/login">
                                <Button variant="outline-dark" className="nav-button-custom">Log In</Button>
                            </a>
                        </Col>
                        <Col xs={6}>
                            <a className="custom-main-nav-link-btn" href="/register">
                                <Button variant="dark" className="nav-button-custom">
                                Sign Up
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none" style={{ marginLeft: "8px" }}>
                                <path fillRule="evenodd" clipRule="evenodd" d="M11.0249 5.96743L7.27493 2.21743C7.13993 2.07493 6.95243 1.99243 6.74243 1.99243C6.32993 1.99243 5.99243 2.32993 5.99243 2.74243C5.99243 2.95243 6.07493 3.13993 6.20993 3.27493L8.67743 5.74243H1.49243C1.07993 5.74243 0.742432 6.07993 0.742432 6.49243C0.742432 6.90493 1.07993 7.24243 1.49243 7.24243H8.68493L6.21743 9.70993C6.08243 9.84493 5.99993 10.0324 5.99993 10.2424C5.99993 10.6549 6.33743 10.9924 6.74993 10.9924C6.95993 10.9924 7.14743 10.9099 7.28243 10.7749L11.0324 7.02493C11.1674 6.88993 11.2499 6.70243 11.2499 6.49243C11.2499 6.28243 11.1599 6.10243 11.0249 5.96743Z" fill="white"/>
                                </svg>
                                </Button>
                            </a> 
                        </Col>
                        </Row>
                </div>

                </div>
            </div>
            </>
        )}

        <Navbar collapseOnSelect expand="lg" bg="light" className="main-navigation" variant="light">
            <Container fluid>
            
            {auth.token ? (
                <>
                <Navbar.Brand href="/" className="col-md-2 hide-on-mobile-device"><img src={logoImage} className="img-fluid" alt="Incio Logo" /></Navbar.Brand>
                <Navbar.Brand href="/" className="ml-auto display-on-mobile-device"><img src={logoImage} className="img-fluid" alt="Incio Logo" /></Navbar.Brand>

                <Nav className="ml-auto mobile-display">
                    <Nav.Link href="/"><img src={notificationImage} className="img-fluid notfico" /></Nav.Link> 

                    <Link to="/account"><img src={user?.image ? `https://inciohost.com/server/${user?.image}` : avatarImage} alt="Picture" className="img-fluid main-avatar" /></Link>
                </Nav>
                </>
            ) : (
                <>
                <Navbar.Brand href="/" className="col-md-2 hide-on-mobile-device"><img src={logoImage} className="img-fluid" alt="Incio Logo" /></Navbar.Brand>
                <Navbar.Brand href="/" className="mx-auto display-on-mobile-device"><img src={logoImage} className="img-fluid" alt="Incio Logo" /></Navbar.Brand>

                <Nav className="ml-auto mobile-display">
                    <Nav.Link href="#" onClick={handleShowMobileNav}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="19" viewBox="0 0 24 19" fill="none">
                    <line x1="1.5" y1="1.5" x2="22.5" y2="1.5" stroke="black" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="1.5" y1="9.5" x2="22.5" y2="9.5" stroke="black" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="1.5" y1="17.5" x2="22.5" y2="17.5" stroke="black" strokeWidth="3" strokeLinecap="round"/>
                    </svg>

                    </Nav.Link> 
                </Nav>
                </>
            )}
            <Navbar.Toggle aria-controls="responsive-navbar-nav" className="mobile-hide" />
            <Navbar.Collapse id="responsive-navbar-nav" className="mobile-hide">
            <Nav className="me-auto mobile-hide">
                {user && (
                    <>
                    <Nav.Link href="#" className="nav-info"> <PageTitle /> </Nav.Link>
                    </>
                )}
            </Nav>
            <Nav className="ml-auto mobile-hide">
                {auth.token ? (
                    <>
                    {!testData ? (
                        <>
                        <OverlayTrigger
                            placement="bottom"
                            overlay={renderTooltip}
                            trigger={['hover','focus']}
                        >
                            <button className="test-data-btn main-nav-test-btn" onClick={() => callTestData()}>Test data</button>
                        </OverlayTrigger>
                        </>
                    ) : (
                        <>
                        {/* <div className="test-data-info">
                        *This data is not real data. <br /> To show real data, connect your services.
                        </div> */}
                        </>
                    )}

                    <Nav.Link href="/"><img src={notificationImage} className="img-fluid notfico" /></Nav.Link>

                    <NavDropdown title={<img src={user?.image ? `https://inciohost.com/server/${user?.image}` : avatarImage} alt="Picture" className="img-fluid main-avatar" />} id="collasible-nav-dropdown" className="custom-dropdown">
                        <NavDropdown.Item>
                            <Link to="/account">Account</Link>
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#" onClick={() => {
                            logout();
                            window.location.href = '/'
                        }}>
                            Logout
                        </NavDropdown.Item>
                    </NavDropdown>
                    </>
                ) : (
                    <>
                        <Nav.Link href="#" className="custom-main-nav-link" onClick={() => scroll('product-scroll')}>Product</Nav.Link>
                        <Nav.Link href="#" className="custom-main-nav-link" onClick={() => scroll('pricing-scroll')}>Pricing</Nav.Link>
                        <Nav.Link href="#" className="custom-main-nav-link" onClick={() => scroll('about-scroll')}>About</Nav.Link>
                        <Nav.Link href="/support" className="custom-main-nav-link">Contact</Nav.Link>
                        <a className="nav-btn-pad custom-main-nav-link-btn" href="/login">
                            <Button variant="outline-dark" className="nav-button-custom">Log In</Button>
                        </a>
                        <a className="nav-btn-pad no-right custom-main-nav-link-btn" href="/register">
                            <Button variant="dark" className="nav-button-custom">
                            Sign free
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none" style={{ marginLeft: "8px" }}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M11.0249 5.96743L7.27493 2.21743C7.13993 2.07493 6.95243 1.99243 6.74243 1.99243C6.32993 1.99243 5.99243 2.32993 5.99243 2.74243C5.99243 2.95243 6.07493 3.13993 6.20993 3.27493L8.67743 5.74243H1.49243C1.07993 5.74243 0.742432 6.07993 0.742432 6.49243C0.742432 6.90493 1.07993 7.24243 1.49243 7.24243H8.68493L6.21743 9.70993C6.08243 9.84493 5.99993 10.0324 5.99993 10.2424C5.99993 10.6549 6.33743 10.9924 6.74993 10.9924C6.95993 10.9924 7.14743 10.9099 7.28243 10.7749L11.0324 7.02493C11.1674 6.88993 11.2499 6.70243 11.2499 6.49243C11.2499 6.28243 11.1599 6.10243 11.0249 5.96743Z" fill="white"/>
                            </svg>
                            </Button>
                        </a> 
                    </>
                )}
            </Nav>
            </Navbar.Collapse>

            {auth.token && (
                <>
                {/* <div className="test-data-info mobile-display" style={{ textAlign: "normal"}}>
                            *This data is not real data. To show real data, connect your services.
                </div> */}
                </>
            )}
        </Container>
        </Navbar>
        </>
    )
}

export default Navigation;