import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";

import axios from 'axios';

import SidebarDrawer from '../UI/Drawer';
import { Container, Row, Col, Button } from 'react-bootstrap';
import LoadingSpinner from '../UI/LoadingSpinner';

import Breadcrumb from '../components/Breadcrumb';
import EventsList from '../components/EventsList';

import Paginate from '../UI/Pagination';

import { AuthContext } from '../context/auth-context';

import NewEvent from '../components/NewEvent';

const Events = () => {
    const auth = useContext(AuthContext);
    const user = JSON.parse(localStorage.getItem('userData'))
    const [isLoading, setIsLoading] = useState(false);
    const [loadedEvents, setLoadedEvents] = useState();
    const [totalArticles, setTotalArticles] = useState(0);
    const history = useNavigate();
  
    const [page, setPage] = useState(1);

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

    useEffect(() => {
        fetchEvents()
    }, []);

    const requestPage = async (page) => {
           history({
              pathname: "/events",
              search: `?page=${page}`,
            });

            try {
              setIsLoading(true)
              const response = await axios.get(`http://localhost:5000/server/api/getevents?page=${page}`, 
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
        fetchEvents()
    }

    const [openModalEvent, setOpenModalEvent] = useState(false)

    return (
        <>
        <Container fluid>
        <Row className="flex-xl-nowrap">
            <Col xs={12} md={3} lg={2} className="p-0">
            <SidebarDrawer />
            </Col>

            <Col xs={12} md={9} lg={10} className="custom-main-right-side">

                <Breadcrumb />
    
                <div className="section-title custom-padding-top">
                    
                    {auth.windowWidth > 650 ? (
                        <>
                        <div className="hide-on-mobile-device">
                            <h1 className="my-4">Events</h1>
                            
                            {!isLoading && loadedEvents && <EventsList items={loadedEvents} onUpdateEvent={handleUpdate} />}
                        </div>
                        </>
                    ) : (
                        <>
                        <div className="events-mobile display-on-mobile-device">
                            <Button variant='dark' className='mobile-block-button' onClick={() => setOpenModalEvent(true)}>New Event</Button>
                            <NewEvent modal={openModalEvent} onUpdate={handleUpdate} onClose={() => setOpenModalEvent(false)} />

                            <h3 className="mb-4">Events</h3>

                            {!isLoading && loadedEvents && <EventsList items={loadedEvents} onUpdateEvent={handleUpdate} slider={false} mobile={true} />}
                        </div>
                        </>
                    )}


                    <div className="space20px"></div>

                    {isLoading && (
                    <center>
                        <LoadingSpinner asOverlay={false} />
                    </center>
                    )}

                    <div className="space20px"></div>

                    
                    {!isLoading && (
                    <Paginate page={page} setPage={requestPage} totalArticles={totalArticles} maxButtons="2" maxPerPage="20" />
                    )}

                    <div className="space20px"></div>
                </div>

            </Col>
        </Row>
        </Container>
        </>
    )
}

export default Events;