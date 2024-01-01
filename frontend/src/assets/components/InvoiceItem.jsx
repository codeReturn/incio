import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Row, Col, Button, Form, Modal } from 'react-bootstrap';

import LoadingSpinner from '../UI/LoadingSpinner';
import axios from 'axios';
import Select from 'react-select';
import moment from 'moment';

import { AuthContext } from '../context/auth-context'

const InvoiceItem = props => {
  console.log(props)
    const auth = useContext(AuthContext)
    const user = JSON.parse(localStorage.getItem('userData'))
    const [isLoading, setIsLoading] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)

    const isoDate = new Date(props.date);

    const formattedDate = isoDate.toISOString().split('T')[0];
  
    const [invoiceName, setInvoiceName] = useState(props.name)
    const [companyName, setCompanyName] = useState(props.companyName)
    const [invoiceDate, setInvoiceDate] = useState(formattedDate);

    const resendInvoice = async (event) => {
            event.preventDefault();
                    
            try {
              setIsLoading(true);
          
              const response = await axios.post(
                "http://localhost:5000/server/api/connect/stripe/resendinvoice",
                {
                    invoiceId: props.id
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token,
                  }
                }
              );
          
              if (response.data.message === "global_success") {
                setOpenEdit(false);
                props.onUpdate();
              }
          
              setIsLoading(false);
            } catch (error) {
              console.log(error);
              toast.error(error, { position: toast.POSITION.BOTTOM_CENTER });
              setIsLoading(false);
            }
    }      
    
    const downloadInvoice = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/server/api/downloadinvoice/${props.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + user.token,
            },
            responseType: 'blob', 
          }
        );
    
        const downloadUrl = URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `invoice_${props.id}.pdf`); 
        document.body.appendChild(link);
        link.click();
    
        URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
      } catch (err) {
        console.log(err);
        toast.error(err, { position: toast.POSITION.BOTTOM_CENTER });
        setIsLoading(false);
      }
    };

    const [showInfo, setShowInfo] = useState(false);

    const handleCloseInfo = () => setShowInfo(false);
    const handleShowInfo = () => setShowInfo(true);

    return (
    <>
    {isLoading && <LoadingSpinner asOverlay={true} />}

    {auth.windowWidth < 650 && (
      <>
      <Modal size="lg" show={showInfo} onHide={handleCloseInfo} className="display-on-mobile-device custom-mobile-modal modal-top-global">
          <Modal.Header closeButton>
            <Modal.Title>{props.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="position-relative">
                  <div className="modal-custom-info-content">
                      <p>{props.description}</p>

                      <div className="custom-invoice-modal-block">
                        <label>Client</label> <br />
                        <span className="custom-invoice-modal-block-right">{props.email}</span>
                        <span>{props.name}</span>
                      </div>
                      <div className="custom-invoice-modal-block">
                        <label>Company</label> <br />
                        <span>{props.companyName}</span>
                      </div>
                      <div className="custom-invoice-modal-block">
                        <label>Address</label> <br />
                        <span>{props.address}</span>
                      </div>

                      <hr />

                      <div className="custom-invoice-modal-block">
                        <label>Product/Service</label> <br />
                        {props.items && props.items.map((item, index) => {
                          const price = item.price * item.qty
                          return (
                            <>
                            <div>
                            <span className="custom-invoice-modal-block-right">{price.toFixed(0)} <b>{props.currency}</b></span>
                            <span>{item.name} <small style={{ color: 'silver' }}>( {item.qty} )</small></span>
                            </div>
                            </>
                          )
                        })}
                      </div>

                      <div className="custom-invoice-modal-block">
                        <label>Due date</label> <br />
                        <span>{moment(props.date).format('MM.DD.YYYY')}</span>
                      </div>

                      <div className="custom-invoice-modal-block position-relative">
                        <label>Status</label>
                        <div className="mobileupper-status">{props.status === 0 ? (
                              <>
                              <div className="contracts-status-gray-rel addcssforstatus addjusfont-onmob-onlyf"></div> 
                              </>
                          ) : props.status === 1 ? (
                              <>
                              <div className="contracts-status-yellow-rel addcssforstatus addjusfont-onmob-onlyf"></div> <span className="add-left-p">Pending</span>
                              </>
                          ) : props.status === 2 ? (
                            <>
                              <div className="contracts-status-green-rel-update addcssforstatus addjusfont-onmob-onlyf"></div> <span className="add-left-p">Paid</span>
                            </>
                          ): (
                            <>
                              <div className="contracts-status-gray-rel addcssforstatus addjusfont-onmob-onlyf"></div>
                            </>
                          )}</div>
                      </div>

                      <hr />

                      <label>Amount due</label> <br />
                      <span className="custom-invoice-modal-block-right">{props.items && props.items.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2)} <b>{props.currency}</b></span>
                      <span>{props?.items.length} total products </span>

                      <hr />

                      <div className='text-center'>
                      <Link onClick={(e) => resendInvoice(e)} className="invoice-link"> 
                        Invoice Again 

                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M12.5 3.33317H4.16667V16.6665H15.8333V6.6665H12.5V3.33317ZM2.5 2.493C2.5 2.03655 2.87291 1.6665 3.33208 1.6665H13.3333L17.4998 5.83317L17.5 17.4936C17.5 17.9573 17.1292 18.3332 16.6722 18.3332H3.32783C2.87063 18.3332 2.5 17.9538 2.5 17.5067V2.493ZM10.8333 9.99984V13.3332H9.16667V9.99984H6.66667L10 6.6665L13.3333 9.99984H10.8333Z" fill="url(#paint0_linear_181_3554)"/>
                          <defs>
                          <linearGradient id="paint0_linear_181_3554" x1="10" y1="1.6665" x2="10" y2="18.3332" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#BF5AF2"/>
                          <stop offset="1" stopColor="#9444BC"/>
                          </linearGradient>
                          </defs>
                        </svg>
                      </Link>       
                      </div>                                               

                  </div>
          </Modal.Body>
      </Modal>

      </>
    )}

    <React.Fragment key={`invoice${props.index}`}>

    {props.mobile === false ? (
      <>
      <tr className={`${openEdit === true ? 'custom-table-css-active' : 'custom-table-css'}`}>
          <td className="text-center" style={{ fontWeight: 'bold' }}>{props.index}</td>
          <td>{props.name}</td>
          <td>{moment(props.date).format('MM.DD.YYYY')}</td>
          <td>{props.companyName}</td>
          <td>{props.items && props.items.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2)} <b>{props.currency}</b></td>
          <td className="position-relative no-border">{props.status === 0 ? (
              <>
              <div className="contracts-status-gray-rel"></div> 
              </>
          ) : props.status === 1 ? (
              <>
              <div className="contracts-status-yellow-rel"></div> <span className="add-left-p">Pending</span>
              </>
          ) : props.status === 2 ? (
            <>
              <div className="contracts-status-green-rel-update"></div> <span className="add-left-p">Paid</span>
            </>
          ): (
            <>
              <div className="contracts-status-gray-rel"></div>
            </>
          )}</td>
          <td className="align-to-right">
          <Link to={`/invoice/${props.id}`}>
          <Button variant='light' size='sm' className='table-btns'><i className="fa-solid fa-wallet"></i></Button>
          </Link>

          <Button variant='light' size='sm' className='table-btns' onClick={() => setOpenEdit(!openEdit)}><i className="fa-solid fa-gear"></i></Button>
          <Button variant='light' size='sm' className='table-btns' onClick={() => downloadInvoice()}><i className="fa-solid fa-download"></i></Button>
          </td>
      </tr>
      {openEdit && 
        <tr>
          <td colSpan="12">
            <div className="mx-4">

                      <Form className="global-form" onSubmit={resendInvoice}>
                          <Row className="form-row g-0">
                              <Col sm={3} className="px-2">
                                  <Form.Group className="mb-3" controlId="invoiceForm.name">
                                      <Form.Control
                                      type="text"
                                      disabled
                                      placeholder="Invoice Name"
                                      className="global-formcontrol"
                                      defaultValue={invoiceName}
                                      />
                                  </Form.Group>
                                  <Form.Group className="mb-3" controlId="invoiceForm.date">
                                      <Form.Control
                                      type="date"
                                      disabled
                                      placeholder="Invoice Date"
                                      className="global-formcontrol"
                                      defaultValue={invoiceDate}
                                      />
                                  </Form.Group>
                              </Col>
                              <Col sm={3} className="px-2">
                                  <Form.Group className="mb-3" controlId="invoiceForm.companyname">
                                      <Form.Control
                                      type="text"
                                      disabled
                                      placeholder="Company Name"
                                      className="global-formcontrol"
                                      defaultValue={companyName}
                                      />
                                  </Form.Group>
                                  <Form.Group className="mb-3" controlId="invoiceForm.amount">
                                      <Form.Control
                                      type="number"
                                      disabled
                                      placeholder="Amount"
                                      className="global-formcontrol"
                                      defaultValue={props.items && props.items.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2)}
                                      />
                                  </Form.Group>
                              </Col>
                              <Col sm={4} className="px-2"></Col>
                              <Col sm={2} className="px-2 position-relative"> 
                                    {props.status !== 2 && props.invoice_id ? (
                                    <>
                                    <Button variant="light" type="submit" className="general-light-btn invo-btn"> Invoice Again </Button>                                                      
                                    </>
                                    ) : null}
                              </Col>
                          </Row>
                      </Form>
            </div>
          </td>
        </tr>
      }
      </>
    ) : (
      <>
      <Col xs={7}>
        <div className="bg-mobile-block-info">
            <div className="bg-mobile-block-info-title">{props.name}</div>

            <div className="bg-mobile-block-info-block"><label>Client:</label > <span className="custom-text-gradient">{props.email}</span></div>
            <div className="bg-mobile-block-info-block"><label>Amount:</label > <span className="custom-text-gradient">{props.items && props.items.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2)} <b>{props.currency}</b></span></div>
            <div className="bg-mobile-block-info-block"><label>Status:</label > <span className="mobile-status-invoice">{props.status === 0 ? (
                <>
                <div className="contracts-status-gray-rel"></div> 
                </>
            ) : props.status === 1 ? (
                <>
                <div className="contracts-status-yellow-rel"></div> <span className="add-left-p">Pending</span>
                </>
            ) : props.status === 2 ? (
              <>
                <div className="contracts-status-green-rel-update"></div> <span className="add-left-p">Paid</span>
              </>
            ): (
              <>
                <div className="contracts-status-gray-rel"></div>
              </>
            )}</span></div>
        </div>
      </Col>
      <Col xs={5}>
        <div className="more-link">
          <Link onClick={() => handleShowInfo()}>
          Details 

          <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
          </svg>

          </Link>
        </div>
      </Col>
      </>
    )}
    </React.Fragment>
    </>
  );
};

export default InvoiceItem;
