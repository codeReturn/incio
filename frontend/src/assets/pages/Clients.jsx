import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";

import NewClient from '../components/NewClient';

import axios from 'axios';

import SidebarDrawer from '../UI/Drawer';
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import LoadingSpinner from '../UI/LoadingSpinner';

import ClientsList from '../components/ClientsList';

import Paginate from '../UI/Pagination';

import { Transition } from 'react-transition-group';

import { AuthContext } from '../context/auth-context';

const Clients = () => {
    const auth = useContext(AuthContext)
    const [openNewClient, setOpenNewClient] = useState(false)

    const user = JSON.parse(localStorage.getItem('userData'))
    const [isLoading, setIsLoading] = useState(false);
    const [loadedClients, setLoadedClients] = useState();
    const [totalArticles, setTotalArticles] = useState(0);
    const history = useNavigate();
  
    const [page, setPage] = useState(1);

    const [status, setStatus] = useState("all")

    const fetchClients = async () => {
        try {
          setIsLoading(true)

          const response = await axios.get(`https://inciohost.com/server/api/getclients?page=1&status=${status}`, 
          {
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + user.token
              }
          })

          const responseData = response?.data;
  
          setLoadedClients(responseData.pageOfItems);
          setTotalArticles(responseData.pager.totalItems);
          setPage(responseData.pager.currentPage);

          setIsLoading(false)
        } catch (err) {
            console.log(err)
            setIsLoading(false)
        }
    };

    useEffect(() => {
        fetchClients()
    }, [status]);

    const requestPage = async (page) => {
           history({
              pathname: "/clients",
              search: `?page=${page}`,
            });

            try {
              setIsLoading(true)
              const response = await axios.get(`https://inciohost.com/server/api/getclients?page=${page}&status=${status}`, 
              {
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + user.token
                  }
              })

              const responseData = response?.data;
            
              setLoadedClients(responseData.pageOfItems);
              setTotalArticles(responseData.pager.totalItems);
              setPage(responseData.pager.currentPage);
              setIsLoading(false)
            } catch (err) {
                console.log(err)
                setIsLoading(false)
            }
    };

    const handleUpdate = () => {
        setOpenNewClient(false)

        fetchClients()
    }

    const [openModalClient, setOpenModalClient] = useState(false)

    return (
        <>
        <Container fluid>
        <Row className="flex-xl-nowrap position-relative">
            <Col xs={12} md={3} lg={2} className="p-0">
            <SidebarDrawer />
            </Col>

            <Col xs={12} md={9} lg={10} className="custom-main-right-side">

            <div className="meetings-buttons hide-on-mobile-device">
            <ButtonGroup aria-label="filter-buttons">
                <Button
                    variant="light"
                    onClick={() => setStatus('all')}
                    className={`${
                        status === "all"
                        ? "custom-meetings-btn-active"
                        : "custom-meetings-btn"
                    } custom-meetings-btn-rounded-start`}
                >
                    All
                </Button>

                <Button
                    variant="light"
                    onClick={() => setStatus('active')}
                    className={`${
                        status === "active"
                        ? "custom-meetings-btn-active"
                        : "custom-meetings-btn"
                    }`}
                >
                    Active
                </Button>

                <Button
                    variant="light"
                    onClick={() => setStatus('past')}
                    className={`${
                    status === "past"
                        ? "custom-meetings-btn-active"
                        : "custom-meetings-btn"
                    } custom-meetings-btn-rounded-end`}
                >
                    Past
                </Button>
            </ButtonGroup>
            </div>

            <div className="meetings-buttons display-on-mobile-device">
                <Row style={{ marginLeft: "5px" }}>
                    <Col className="custom-class-col ml-4">
                        <Button
                        variant="light"
                        onClick={() => setStatus('all')}
                        className={`${
                            status === "all"
                            ? "custom-meetings-btn-active"
                            : "custom-meetings-btn"
                        } custom-meetings-btn-rounded-start`}
                        >
                            All
                        </Button>
                    </Col>

                    <Col className="custom-class-col">
                        <Button
                        variant="light"
                        onClick={() => setStatus('active')}
                        className={`${
                            status === "active"
                            ? "custom-meetings-btn-active"
                            : "custom-meetings-btn"
                        }`}
                        >
                            Active
                        </Button>
                    </Col>

                    <Col className="custom-class-col">
                    <Button
                        variant="light"
                        onClick={() => setStatus('past')}
                        className={`${
                        status === "past"
                            ? "custom-meetings-btn-active"
                            : "custom-meetings-btn"
                        } custom-meetings-btn-rounded-end`}
                    >
                        Past
                    </Button>
                    </Col>
                </Row>
            </div>

            <div style={{ position: 'relative'}}>
                    <Transition in={openNewClient} timeout={500}>
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
                        <NewClient open={openNewClient} onUpdate={() => handleUpdate()} onClose={() => console.log()} />
                        </div>
                    )}
                    </Transition>
            </div>

            {auth.windowWidth > 650 ? (
                <>
                <div className="section-title custom-padding-top">
                        <div className="section-buttons custom-contract-btn" style={{ marginTop: "10px" }}>
                                <Button variant="light" className="general-light-btn " onClick={() => setOpenNewClient(true)}> New Client </Button>
                        </div>

                        <h1>Clients</h1>

                        {isLoading && (
                        <center>
                            <LoadingSpinner asOverlay={false} />
                        </center>
                        )}

                        {!isLoading && loadedClients && <ClientsList items={loadedClients} onUpdateClient={handleUpdate} mobile={false} />}

                        <div className="space20px"></div>

                        
                        {!isLoading && (
                        <Paginate page={page} setPage={requestPage} totalArticles={totalArticles} maxButtons="2" maxPerPage="20" />
                        )}

                        <div className="space20px"></div>
                </div>
                </>
            ) : (
                <>
                <div className="events-mobile display-on-mobile-device">
                            <Button variant='dark' className='mobile-block-button' onClick={() => setOpenModalClient(true)}>New Client</Button>
                            <NewClient modal={openModalClient} onUpdate={() => handleUpdate()} onClose={() => setOpenModalClient(false)} />

                            <h3 className="mb-4">Clients</h3>

                            {!isLoading && loadedClients && <ClientsList items={loadedClients} onUpdateClient={handleUpdate} mobile={true} />}

                            <div className="space20px"></div>
                              
                            {!isLoading && (
                            <Paginate page={page} setPage={requestPage} totalArticles={totalArticles} maxButtons="2" maxPerPage="20" />
                            )}
                </div>
                </>
            )}

            </Col>
        </Row>
        </Container>
        </>
    )
}

export default Clients;