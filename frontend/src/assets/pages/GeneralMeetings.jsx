import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import { Container, Row, Col, ButtonGroup, Button, Table } from 'react-bootstrap';

import SidebarDrawer from '../UI/Drawer';

import NewEvent from '../components/NewEvent';
import SliderEvents from '../components/SliderEvents'
import Breadcrumb from '../components/Breadcrumb';

import LoadingSpinner from '../UI/LoadingSpinner';
import axios from 'axios';

import EventsList from '../components/EventsList';
import MeetingsList from '../components/MeetingsList';

import { Transition } from 'react-transition-group';

import { AuthContext } from '../context/auth-context';

const GeneralMeetings = () => {
    const auth = useContext(AuthContext);

    const user = JSON.parse(localStorage.getItem('userData'))
    const [isLoading, setIsLoading] = useState(false)
    const [openNewEvent, setOpenNewEvent] = useState(false)

    const [loadedEvents, setLoadedEvents] = useState();
    const [loadedMeetings, setLoadedMeetings] = useState()

    const [page, setPage] = useState(1);
    const [totalArticles, setTotalArticles] = useState(0);

    const fetchEvents = async () => {
        try {
          setIsLoading(true)

          const response = await axios.get(`http://localhost:5000/server/api/getevents?page=1`, 
          {
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + user.token
              }
          })

          const responseData = response?.data;
  
          setLoadedEvents(responseData.pageOfItems);
          setTotalArticles(responseData.pager.totalItems);
          setPage(responseData.pager.currentPage);

          setIsLoading(false)
        } catch (err) {
            console.log(err)
            setIsLoading(false)
        }
    };

    const handleUpdate = () => {
        setOpenNewEvent(false)

        fetchEvents()
        fetchMeetings()
    }

    const eventSliderRef = React.useRef(null);

    const handlePrevious = () => {
      eventSliderRef.current.previous();
    };
  
    const handleNext = () => {
      eventSliderRef.current.next();
    };

    const [meetings, setMeetings] = useState();
    
    const fetchMeetings = async () => {
        try {
          setIsLoading(true)

          const response = await axios.get(`http://localhost:5000/server/api/getmeetings?page=1`, 
          {
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + user.token
              }
          })

          const responseData = response?.data;
  
          setLoadedMeetings(responseData.pageOfItems);
          setTotalArticles(responseData.pager.totalItems);
          setPage(responseData.pager.currentPage);

          setIsLoading(false)
        } catch (err) {
            console.log(err)
            setIsLoading(false)
        }
    };

    useEffect(() => {
        fetchMeetings()
        fetchEvents()
    }, []);

    const [displaySection, setDisplaySection] = useState("all")

    const [openModalEvent, setOpenModalEvent] = useState(false)

    const handleOpenEvent = () => {
        setOpenNewEvent(true);
    };
      
    return (
        <>
        {isLoading && <LoadingSpinner asOverlay={true} />}
        <Container fluid>
        <Row className="flex-xl-nowrap position-relative">
            <Col xs={12} md={3} lg={2} className="p-0">
            <SidebarDrawer />
            </Col>

            <Col xs={12} md={9} lg={10} className="custom-main-right-side">
                
                <Breadcrumb />

                <div style={{ position: 'relative'}}>
                    <Transition in={openNewEvent} timeout={500}>
                    {(state) => (
                        <div
                        style={{
                            position: 'relative',
                            top: state === 'entered' ? '0%' : '0%',
                            transition: 'all 0.5s ease',
                            opacity: state === 'entered' ? 1 : 0,
                            transform: state === 'entered' ? 'translate3d(0px, 0%, 0px)' : 'translate3d(0px, 0%, 0px)',
                        }}
                        >
                        <NewEvent open={openNewEvent} modal={false} onUpdate={handleUpdate} onClose={() => console.log()} />
                        </div>
                    )}
                    </Transition>
                </div>


                <div className="section-buttons custom-contract-btn">
                                <Button variant="light" className="general-light-btn" onClick={() => handleOpenEvent()}> New Event </Button>
                                <Button variant="light" className="general-light-btn arrow" onClick={handlePrevious}><i className="fa-solid fa-angle-left"></i></Button>
                                <Button variant="light" className="general-light-btn arrow" onClick={handleNext}><i className="fa-solid fa-angle-right"></i></Button>
                </div>
    
                {displaySection === "all" || displaySection === "events" ? (
                <>
                {auth.windowWidth > 650 ? (
                    <>
                    <div className="section-title hide-on-mobile-device">
                        <h1>Events</h1>
                        <p>Latest events</p>

                        {/* <SliderEvents ref={eventSliderRef} /> */}
                        {!isLoading && loadedEvents && <EventsList items={loadedEvents} onUpdateEvent={handleUpdate} slider={true} ref={eventSliderRef} />}
                    </div>
                    </>
                ) : (
                    <>
                    <div className="events-mobile display-on-mobile-device">
                        <Button variant='dark' className='mobile-block-button' onClick={() => setOpenModalEvent(true)}>New Event</Button>
                        <NewEvent modal={openModalEvent} onUpdate={handleUpdate} onClose={() => setOpenModalEvent(false)} />
                        
                        <h3>Events</h3>

                        <div className="custom-mobile-with-scroll top20px">
                            {!isLoading && loadedEvents && <EventsList items={loadedEvents} onUpdateEvent={handleUpdate} slider={false} mobile={true} />}
                        </div>
                    </div>
                    </>
                )}
                </>
                ) : null}

                {displaySection === "all" || displaySection === "meetings" ? (
                <>
                {auth.windowWidth > 650 ? (
                    <>
                    <div className="section-title hide-on-mobile-device">
                        <h1>Meetings</h1>
                        <p>Latest meetings</p>

                        {!isLoading && loadedMeetings && <MeetingsList items={loadedMeetings} onUpdateMeeting={handleUpdate} />}
                    </div>
                    </>
                ) : (
                    <>
                    <div className="meetings-mobile display-on-mobile-device">
                        <Link to={`/meetings`} className='global-mobile-right-link'>
                            See all

                            <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                            </svg>
                        </Link>
                        <h3>Meetings</h3>

                        <div className="custom-mobile-with-scroll top20px">
                            {!isLoading && loadedMeetings && <MeetingsList items={loadedMeetings} onUpdateMeeting={handleUpdate} mobile={true} />}
                        </div>
                    </div>
                    </>
                )}
                </>
                ) : null}

            </Col>
        </Row>
        </Container>
        </>
    )
}

export default GeneralMeetings;