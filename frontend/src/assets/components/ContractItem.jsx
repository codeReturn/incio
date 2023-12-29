import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { Row, Col, Button, Modal } from 'react-bootstrap';

import moment from 'moment';

import { AuthContext } from '../context/auth-context';

const ContractItem = props => {
    const auth = useContext(AuthContext)
    const [openEdit, setOpenEdit] = useState(false)

    const [showInfo, setShowInfo] = useState(false);

    const handleCloseInfo = () => setShowInfo(false);
    const handleShowInfo = () => setShowInfo(true);
  
    return (
    <>
    {auth.windowWidth < 650 && (
      <>
      <Modal size="lg" show={showInfo} onHide={handleCloseInfo} className="display-on-mobile-device custom-mobile-modal modal-top-global">
          <Modal.Header closeButton>
            <Modal.Title className='text-center'>{props?.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="position-relative">
                  <div className="modal-custom-info-content">
                    <div className="contract-mobile-block-info-modal position-relative">
                      <div>
                        <label>Client:</label> <p>{props.signerEmail ? props.signerEmail : '/'}</p>
                      </div>

                      <hr />

                      <div>
                        <label>Date:</label> <p>{moment(props.date).format('ddd MMM D, YYYY')}</p>
                      </div>

                      <div>
                        <label>Status:</label> <p>
                        <div className="position-relative">
                          {props.status === 0 && props.othersign === true ? (
                              <>
                              <span className="contracts-status-red-rel statuscontracticomobile"></span> <b>Pending</b> 
                              </>
                          ) : props.status === 1 && props.othersign === true ? (
                              <>
                              <span className="contracts-status-green-rel statuscontracticomobile"></span> <b>Signed</b> 
                              </>
                          ) : (
                            <>
                              <span className="contracts-status-gray-rel statuscontracticomobile"></span> <b>No data required</b>
                            </>
                          )}
                        </div>
                        </p>
                      </div>

                      <hr />

                      <div className="display-contract-body">
                          <div className="contract-content-scroll">
                          <pre>{props.contractContent.replace(/&bull;/gi, "<br />").replace(/&ldquo;/gi, " ").replace(/(<([^>]+)>)/gi, "")}</pre>
                          </div>
                      </div>

                      <hr />

                      <div className='text-center'>
                      <Link to={`/contract/${props.id}`} className="invoice-link"> 
                        See contract 

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

                  </div>
          </Modal.Body>
      </Modal>
      </>
    )}

    <React.Fragment key={`c${props.index}`}>
    {props.mobile === true ? (
      <>
      <div className="contract-mobile-block">
        <div className="contract-mobile-block-title">{props.title}</div>

        <div className="contract-mobile-block-info">
          <div>
            <label>Client:</label> <span className="contract-mobile-block-info-company">{props.signerEmail ? props.signerEmail : '/'}</span>
          </div>
          <div className="position-relative">
            <label>Signature:</label> 
            {props.status === 0 && props.othersign === true ? (
                <>
                <span className="contracts-status-red-rel statuscontracticomobile addjusfont-onmob"></span> <b>Pending</b> 
                </>
            ) : props.status === 1 && props.othersign === true ? (
                <>
                <span className="contracts-status-green-rel statuscontracticomobile addjusfont-onmob"></span> <b>Signed</b> 
                </>
            ) : (
              <>
                <span className="contracts-status-gray-rel statuscontracticomobile addjusfont-onmob"></span> <b>No data required</b>
              </>
            )}
          </div>

          <div className="mobile-see-more-contract">
              <Link onClick={() => handleShowInfo()}>
              Details 
              <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
              </svg>
              </Link>
          </div>
        </div>
      </div>
      </>
    ) : (
      <>
      <tr className={`${openEdit === true ? 'custom-table-css-active' : 'custom-table-css'}`}>
          <td>{props.title}</td>
          <td>{moment(props.date).format('ddd MMM D, YYYY')}</td>
          <td className="">{props.status === 0 && props.othersign === true ? (
              <>
              <div className="contracts-status-red-rel"></div>
              </>
          ) : props.status === 1 && props.othersign === true ? (
              <>
              <div className="contracts-status-green-rel"></div>
              </>
          ) : (
            <>
              <div className="contracts-status-gray-rel"></div>
            </>
          )}</td>
          <td>
              {/* <Button variant='light' size='sm' className='m-1 table-btns' onClick={() => setOpenEdit(!openEdit)}><i className="fa-solid fa-gear"></i></Button> */}

              <Link to={`/contract/${props.id}`}>
                  <Button variant='light' size='sm' className='table-btns'><i className="fa-solid fa-link"></i></Button>
              </Link>

              <Button variant='light' size='sm' className='table-btns' onClick={() => props.onDisplay(props.id)}><i className="fa-solid fa-eye"></i></Button>
          </td>
      </tr>
      {openEdit && 
        <tr>
          <td colSpan="12">
            <div className="mx-4">

            test

            </div>
          </td>
        </tr>
      }
      </>
    )}
    </React.Fragment>
    </>
  );
};

export default ContractItem;
