import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";

import { Container, Row, Col, Button } from 'react-bootstrap';

import SidebarDrawer from '../UI/Drawer';
import NewInvoice from '../components/NewInvoice';

import LoadingSpinner from '../UI/LoadingSpinner';

import InvoicesList from '../components/InvoicesList';

import Paginate from '../UI/Pagination';

import axios from 'axios';

import InvoiceStats from '../components/InvoiceStats';

import { Transition } from 'react-transition-group';

import { AuthContext } from '../context/auth-context';

const Money = () => {
    const auth = useContext(AuthContext)

    const [openNewInvoice, setOpenNewInvoice] = useState(false)
    const user = JSON.parse(localStorage.getItem('userData'))
    const [isLoading, setIsLoading] = useState(false);
    const [loadedInvoices, setLoadedInvoices] = useState();
    const [totalArticles, setTotalArticles] = useState(0);
    const history = useNavigate();
  
    const [page, setPage] = useState(1);
  
    const [status, setStatus] = useState("all")
  
    const fetchInvoices = async () => {
        try {
          setIsLoading(true)
  
          const response = await axios.get(`https://inciohost.com/server/api/getinvoices?page=1&status=${status}`, 
          {
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + user.token
              }
          })
  
          const responseData = response?.data;
  
          setLoadedInvoices(responseData.pageOfItems);
          setTotalArticles(responseData.pager.totalItems);
          setPage(responseData.pager.currentPage);
  
          setIsLoading(false)
        } catch (err) {
            console.log(err)
            setIsLoading(false)
        }
    };
    
    useEffect(() => {
      fetchInvoices()
    }, [status]);
  
    const requestPage = async (page) => {
           history({
              pathname: "/money",
              search: `?page=${page}`,
            });
  
            try {
              setIsLoading(true)
              const response = await axios.get(`https://inciohost.com/server/api/getinvoices?page=${page}&status=${status}`, 
              {
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + user.token
                  }
              })
  
              const responseData = response?.data;
            
              setLoadedInvoices(responseData.pageOfItems);
              setTotalArticles(responseData.pager.totalItems);
              setPage(responseData.pager.currentPage);
              setIsLoading(false)
            } catch (err) {
                console.log(err)
                setIsLoading(false)
            }
    };
  
    const handleUpdate = () => {
      setOpenNewInvoice(false)
  
      fetchInvoices()
    }

    const [openModalInvoice, setOpenModalInvoice] = useState(false)

    return (
    <React.Fragment>
      <Container fluid>
        <Row className="flex-xl-nowrap">
          <Col xs={12} md={3} lg={2} className="p-0">
            <SidebarDrawer />
          </Col>
          <Col xs={12} md={9} lg={10} className="position-relative custom-main-right-side">

            <div className="events-mobile display-on-mobile-device">
                        <Button variant='dark' className='mobile-block-button' onClick={() => setOpenModalInvoice(true)}>New Invoice</Button>
                        <NewInvoice modal={openModalInvoice} onUpdateInvoice={handleUpdate} onClose={() => setOpenModalInvoice(false)} />

                        <h3>Invoices</h3>

                        <div className="custom-mobile-with-scroll top20px">
                            {!isLoading && loadedInvoices && <InvoicesList items={loadedInvoices} onUpdateInvoice={handleUpdate} mobile={true} />}
                        </div>
            </div>

            <div className="section-buttons hide-on-mobile-device" style={{ marginTop: "30px" }}>
                {!openNewInvoice ? (
                    <>
                        <Button variant="light" className="general-light-btn" onClick={() => setOpenNewInvoice(true)}> Create Invoice </Button>                    
                    </>
                ) : (
                    <>
                        <Button variant="light" className="general-light-btn" onClick={() => setOpenNewInvoice(false)}> Close </Button>                    
                    </>
                )}
            </div>

            
            <div style={{ position: 'relative'}}>
                    <Transition in={openNewInvoice} timeout={500}>
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
                        <NewInvoice open={openNewInvoice} modal={false} onUpdate={() => handleUpdate()} onClose={() => console.log()} />
                        </div>
                    )}
                    </Transition>
            </div>

            <div className="space20px"></div>

            <InvoiceStats mobile={auth.windowWidth > 650 ? false : true} />

            <div className="space20px hide-on-mobile-device"></div>
                    
                    {auth.windowWidth > 650 && (
                      <>
                      <div className="section-title custom-padding-top">
                      <h1>Invoices</h1>
                      </div>
                      </>
                    )}

                    <div className="space20px hide-on-mobile-device"></div>

                    {isLoading && (
                    <center>
                        <LoadingSpinner asOverlay={false} />
                    </center>
                    )}
                    
                    {auth.windowWidth > 650 && (
                    <>
                    {!isLoading && loadedInvoices && <InvoicesList items={loadedInvoices} mobile={false} onUpdateInvoice={handleUpdate} />}
                    
                    <div className="space20px hide-on-mobile-device"></div>
                    </>
                    )}
                    
                    {!isLoading && (
                    <Paginate page={page} setPage={requestPage} totalArticles={totalArticles} maxButtons="2" maxPerPage="20" />
                    )}

                    <div className="space20px hide-on-mobile-device"></div>

          </Col>
        </Row>
      </Container>
    </React.Fragment>
    )
}

export default Money;