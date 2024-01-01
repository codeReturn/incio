// Contracts.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';

import SidebarDrawer from '../UI/Drawer';
import NewContract from '../components/NewContract';

import LoadingSpinner from '../UI/LoadingSpinner';

import ContractsList from '../components/ContractsList';

import Paginate from '../UI/Pagination';

import axios from 'axios';

import { Transition } from 'react-transition-group';

import { AuthContext } from '../context/auth-context';

const Contracts = () => {
  const auth = useContext(AuthContext)

  const [openNewContract, setOpenNewContract] = useState(false)
  const user = JSON.parse(localStorage.getItem('userData'))
  const [isLoading, setIsLoading] = useState(false);
  const [loadedContracts, setLoadedContracts] = useState();
  const [totalArticles, setTotalArticles] = useState(0);
  const history = useNavigate();

  const [page, setPage] = useState(1);

  const [status, setStatus] = useState("all")

  const fetchContracts = async () => {
      try {
        setIsLoading(true)

        const response = await axios.get(`http://localhost:5000/server/api/getcontracts?page=1&status=${status}`, 
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + user.token
            }
        })

        const responseData = response?.data;

        setLoadedContracts(responseData.pageOfItems);
        setTotalArticles(responseData.pager.totalItems);
        setPage(responseData.pager.currentPage);

        setIsLoading(false)
      } catch (err) {
          console.log(err)
          setIsLoading(false)
      }
  };

  const [countStats, setCountStats] = useState()
  const fetchContractsCount = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/server/api/getcontractscounts`, 
      {
          headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + user.token
          }
      })

      setCountStats(response.data)
    } catch (err) {
        console.log(err)
        setIsLoading(false)
    }
};

  useEffect(() => {
      fetchContracts()
      fetchContractsCount()
  }, [status]);

  const requestPage = async (page) => {
         history({
            pathname: "/contracts",
            search: `?page=${page}`,
          });

          try {
            setIsLoading(true)
            const response = await axios.get(`http://localhost:5000/server/api/getcontracts?page=${page}&status=${status}`, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token
                }
            })

            const responseData = response?.data;
          
            setLoadedContracts(responseData.pageOfItems);
            setTotalArticles(responseData.pager.totalItems);
            setPage(responseData.pager.currentPage);
            setIsLoading(false)
          } catch (err) {
              console.log(err)
              setIsLoading(false)
          }
  };

  const handleUpdate = () => {
    setOpenNewContract(false)

    fetchContracts()
  }

  const [displayDate, setDisplayData] = useState()
  const handleDisplay = (id) => {
    const find = loadedContracts.find((contracts) => contracts.id === id)
    setDisplayData(find)
  }

  const [showUpload, setShowUpload] = useState(false)

  const [openModalContract, setOpenModalContract] = useState(false)

  return (
    <React.Fragment>
      <Container fluid>
        <Row className="flex-xl-nowrap position-relative">
          <Col xs={12} md={3} lg={2} className="p-0">
            <SidebarDrawer />
          </Col>
          <Col xs={12} md={9} lg={10} className="custom-main-right-side">
                <div className="meetings-buttons display-on-mobile-device">
                  <Row>
                      <Col xs={12}>
                              <Button
                                  variant="light"
                                  className={`custom-meetings-btn custom-meetings-btn-rounded-start custom-meetings-btn-full-width`}
                                  onClick={() => setShowUpload(true)}
                              >
                                  Upload
                              </Button>
                      </Col>
                  </Row>
              </div>


            <Row className="my-4 hide-on-mobile-device">
                      <Col sm={4}>
                          <div className="contracts-stats-block">
                            <div className="contracts-status-gray"></div>

                            <div className="contracts-info">{countStats && countStats.totalContracts ? countStats.totalContracts : 0} <span>total contracts</span></div>
                          </div>
                      </Col>
                      <Col sm={4}>
                          <div className="contracts-stats-block">
                            <div className="contracts-status-red"></div>

                            <div className="contracts-info">{countStats && countStats.pendingContracts ? countStats.pendingContracts : 0} <span>pending signatures</span></div>
                          </div>
                      </Col>
                      <Col sm={4}>
                          <div className="contracts-stats-block">
                            <div className="contracts-status-green"></div>

                            <div className="contracts-info">{countStats && countStats.signedContracts ? countStats.signedContracts : 0} <span>signed</span></div>
                          </div>
                      </Col>
            </Row>

            <div className="contacts-stats display-on-mobile-device">
                <h3>Signatures</h3>

                <Row className="addstats-margin position-relative">
                    <Col xs={2}>
                      <div className="contracts-stats-number contracts-styled-1">
                        {countStats && countStats.totalContracts ? countStats.totalContracts : 0}
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="contracts-stats-text contracts-styled-1-2">
                        Total contracts
                      </div>
                    </Col>
                    <Col xs={2}></Col>
                    <Col xs={2}>
                      <div className="status-contracts-stats contracts-status-gray"></div>
                    </Col>
                </Row>

                <Row className="addstats-margin position-relative">
                    <Col xs={2}>
                      <div className="contracts-stats-number contracts-styled-2">
                      {countStats && countStats.signedContracts ? countStats.signedContracts : 0}
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="contracts-stats-text contracts-styled-2-1">
                      Signed
                      </div>
                    </Col>
                    <Col xs={2}></Col>
                    <Col xs={2}>
                      <div className="status-contracts-stats contracts-status-green"></div>
                    </Col>
                </Row>

                <Row className="addstats-margin position-relative">
                    <Col xs={2}>
                      <div className="contracts-stats-number contracts-styled-2">
                        {countStats && countStats.pendingContracts ? countStats.pendingContracts : 0}
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="contracts-stats-text contracts-styled-2-1">
                      Pending
                      </div>
                    </Col>
                    <Col xs={2}></Col>
                    <Col xs={2}>
                      <div className="status-contracts-stats contracts-status-red"></div>
                    </Col>
                </Row>
            </div>

            <DndProvider backend={HTML5Backend}>

                <div className="section-buttons custom-contract-btn" style={{ margin: "20px 0px" }}>
                                {openNewContract === true ? (
                                  <>
                                  <Button variant="light" className="general-light-btn" onClick={() => setOpenNewContract(false)}> Close </Button>
                                  </>
                                ) : (
                                  <>
                                  <Button variant="light" className="general-light-btn" onClick={() => setOpenNewContract(true)}> New Contract </Button>
                                  </>
                                )}
                </div>
    
                    {auth.windowWidth > 650 && (
                      <>
                      <div className="section-title">
                      <h1>Contracts</h1>
                      </div>
                  
                      <div style={{ position: 'relative'}}>
                          <Transition in={openNewContract} timeout={500}>
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
                              <NewContract open={openNewContract} onCloseUpload={() => console.log()} upload={false} onUpdate={() => handleUpdate()} onClose={() => console.log()} />
                              </div>
                          )}
                          </Transition>
                      </div>
                      </>
                    )}
                    
                    {auth.windowWidth < 650 ? (
                      <>
                      <div className="events-mobile display-on-mobile-device">
                            <Button variant='dark' className='mobile-block-button' onClick={() => setOpenModalContract(true)}>New Contract</Button>
                            <NewContract modal={openModalContract} onUpdate={() => handleUpdate()} onCloseUpload={() => setShowUpload(false)} upload={showUpload} onClose={() => setOpenModalContract(false)} />

                            <h3 className="mb-4">Contracts</h3>

                            {!isLoading && loadedContracts && <ContractsList items={loadedContracts} onUpdateContract={handleUpdate} mobile={true} />}

                            <div className="space20px"></div>

                              
                            {!isLoading && (
                            <Paginate page={page} setPage={requestPage} totalArticles={totalArticles} maxButtons="2" maxPerPage="20" />
                            )}
                        </div>
                      </>
                    ) : (
                      <>
                   {!openNewContract && (
                      <>
                      <Row>
                          <Col sm={6}>
                              {isLoading && (
                              <center>
                                  <LoadingSpinner asOverlay={true} />
                              </center>
                              )}

                              {!isLoading && loadedContracts && <ContractsList items={loadedContracts} mobile={false} onDisplayContract={(id) => handleDisplay(id)} onUpdateContract={handleUpdate} />}

                              <div className="space20px"></div>

                              
                              {!isLoading && (
                              <Paginate page={page} setPage={requestPage} totalArticles={totalArticles} maxButtons="2" maxPerPage="20" />
                              )}

                              <div className="space20px"></div>
                            </Col>

                            <Col sm={6}>
                            <div className="display-contract position-relative">
                                {displayDate ? (
                                  <div className="display-contract-body">
                                    <h4>{displayDate.title}</h4>
                                    <div className="contract-content-scroll">
                                    <pre>{displayDate.contractContent.replace(/&bull;/gi, "<br />").replace(/&ldquo;/gi, " ").replace(/(<([^>]+)>)/gi, "")}</pre>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="display-contract-info">Select The Contract</div>
                                )}
                              </div>

                            </Col>
                          </Row>
                          </>
                        )}
                      </>
                    )}
            </DndProvider>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default Contracts;
