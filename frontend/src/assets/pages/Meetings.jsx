import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";

import axios from 'axios';

import SidebarDrawer from '../UI/Drawer';
import { Container, Row, Col } from 'react-bootstrap';
import LoadingSpinner from '../UI/LoadingSpinner';

import Breadcrumb from '../components/Breadcrumb';
import MeetingsList from '../components/MeetingsList';

import Paginate from '../UI/Pagination';

import { AuthContext } from '../context/auth-context';

const Meetings = () => {
    const auth = useContext(AuthContext)

    const user = JSON.parse(localStorage.getItem('userData'))
    const [isLoading, setIsLoading] = useState(false);
    const [loadedMeetings, setLoadedMeetings] = useState();
    const [totalArticles, setTotalArticles] = useState(0);
    const history = useNavigate();
  
    const [page, setPage] = useState(1);

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
    }, []);

    const requestPage = async (page) => {
           history({
              pathname: "/meetings",
              search: `?page=${page}`,
            });

            try {
              setIsLoading(true)
              const response = await axios.get(`http://localhost:5000/server/api/getmeetings?page=${page}`, 
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

    const handleUpdate = () => {
        fetchMeetings()
    }

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
                            <h1 className="my-4">Meetings</h1>
                            
                            {!isLoading && loadedMeetings && <MeetingsList items={loadedMeetings} onUpdateMeeting={handleUpdate} />}
                        </div>
                        </>
                    ) : (
                        <>
                        <div className="meetings-mobile display-on-mobile-device">
                            <h3 className="mb-4">Meetings</h3>

                            {!isLoading && loadedMeetings && <MeetingsList items={loadedMeetings} mobile={true} onUpdateMeeting={handleUpdate} />}
                        </div>
                        </>
                    )}

                    <div className="space20px"></div>

                    {isLoading && (
                    <center>
                        <LoadingSpinner asOverlay={false} />
                    </center>
                    )}

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

export default Meetings;