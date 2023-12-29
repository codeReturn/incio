import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import { Container, Row, Col, Button, Modal } from 'react-bootstrap';

import SidebarDrawer from '../UI/Drawer';

import DashboardStats from '../components/DashboardStats';
import InvoiceStats from '../components/InvoiceStats';

import avatarImage from '../images/avatar.png';

import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from '../context/auth-context';

import moment from 'moment';

const Dashboard = () => {
    const auth = useContext(AuthContext)
    const user = JSON.parse(localStorage.getItem('userData'));
    const [userStatsLoading, setUserStatsLoading] = useState(true)
    const [userStats, setUserState] = useState()

    const [haveZoom, setHaveZoom] = useState(true)

    const fetchUserDashboardStats = async () => {
        try {
            setUserStatsLoading(true)

            const response = await axios.get(`https://inciohost.com/server/api/getuserstatsdashboard`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token
                }
            })

            console.log(response.data)
            setHaveZoom(response.data.hasZoom)
            setUserState(response.data)
            setUserStatsLoading(false)
        } catch (err) {
            toast.error(err, { position: toast.POSITION.BOTTOM_CENTER });
            console.error('Error fetching stats:', err);
            setUserStatsLoading(false)
        }
    }

    useEffect(() => {
        fetchUserDashboardStats()
    }, []);

    
  const [showInfoEvent, setShowInfoEvent] = useState(false);
  const [modalEventData, setModalEventData] = useState();

  const handleCloseInfoEvent = () => {
    setShowInfoEvent(false);

    setModalEventData('')
  }

  const handleShowInfoEvent = (id) => {
    setShowInfoEvent(true);

    const find = userStats.userEvents && userStats.userEvents.find((event) => event._id === id);
    setModalEventData(find)
  }

  const [showInfoContract, setShowInfoContract] = useState(false);
  const [modalContractData, setModalContractData] = useState();

  const handleCloseInfoContract = () => {
    setShowInfoContract(false);

    setModalContractData('')
  }

  const handleShowInfoContract = (id) => {
    setShowInfoContract(true);

    const find = userStats.contracts && userStats.contracts.find((contract) => contract._id === id);
    setModalContractData(find)
  }

  return (
        <>
        {auth.windowWidth < 650 && (
        <>
        <Modal size="lg" show={showInfoEvent} onHide={handleCloseInfoEvent} className="display-on-mobile-device custom-mobile-modal" centered>
            <Modal.Header closeButton>
                <Modal.Title className='text-align-start'>{modalEventData && modalEventData.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="position-relative">
                    <div className="modal-custom-info-content">
                        {modalEventData && (
                            <>
                            <p>{modalEventData.description}</p>
                            <p>{moment(modalEventData.eventdate).format('ddd MMM D, YYYY')}</p>

                            {modalEventData.questions && modalEventData.questions.length > 0 && (
                                <>
                                <div className="modal-custom-info-content-questions">
                                    <h3>Questions</h3>

                                    {modalEventData.questions.map((question, index) => {
                                    return (
                                        <React.Fragment key={`q` + index}>
                                        <div className="modal-question-d">
                                            <label>{question.type}</label>
                                            <p>{question.field_description}</p>
                                        </div>
                                        </React.Fragment>
                                    )
                                    })}
                                </div>
                                </>
                            )}
                            </>
                        )}
                    </div>
            </Modal.Body>
        </Modal>

        <Modal size="lg" show={showInfoContract} onHide={handleCloseInfoContract} className="display-on-mobile-device custom-mobile-modal" centered>
          <Modal.Header closeButton>
            <Modal.Title className='text-center'>{modalContractData && modalContractData?.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="position-relative">
                  {modalContractData && (
                    <>
                    <div className="modal-custom-info-content">
                        <div className="contract-mobile-block-info-modal position-relative">
                        <div>
                            <label>Client:</label> <p>{modalContractData.signerEmail ? modalContractData.signerEmail : '/'}</p>
                        </div>

                        <hr />

                        <div>
                            <label>Date:</label> <p>{moment(modalContractData.date).format('ddd MMM D, YYYY')}</p>
                        </div>

                        <div>
                            <label>Status:</label> <p>
                            <div className="position-relative">
                            {modalContractData.status === 0 && modalContractData.othersign === true ? (
                                <>
                                <span className="contracts-status-red-rel statuscontracticomobile"></span> <b>Pending</b> 
                                </>
                            ) : modalContractData.status === 1 && modalContractData.othersign === true ? (
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
                            <pre>{modalContractData.contractContent.replace(/&bull;/gi, "<br />").replace(/&ldquo;/gi, " ").replace(/(<([^>]+)>)/gi, "")}</pre>
                            </div>
                        </div>

                        <hr />

                        <div className='text-center'>
                        <Link to={`/contract/${modalContractData.id}`} className="invoice-link"> 
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
                    </>
                  )}
          </Modal.Body>
      </Modal>

        </>
        )}

        <Container fluid>
        <Row className="flex-xl-nowrap">
            <Col xs={12} md={3} lg={2} className="p-0">
            <SidebarDrawer />
            </Col>

            <Col xs={12} md={9} lg={10} className="px-0">
                {/* <DashboardStats /> */}

                <Row className="custom-dash-row custom-main-right-side mobile-for-first-screen">
                    <Col xxl={9} sm={12}>
                        <InvoiceStats single={true} zoom={haveZoom} />
                    </Col>
                    <Col xxl={3} sm={12}>

                        <div className="dashboard-events">

                            <div className="dashboard-events-title">
                                <span>
                                    See all 
                                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                                    </svg>
                                </span>

                                Events
                            </div>

                            <div className="dashboard-events-div">
                                
                                {userStats?.userEvents && userStats.userEvents.length < 1 ? (
                                    <>
                                    <div className="dashboard-events-block">
                                        <div className="dashboard-events-block-title-stats">
                                        Meetings
                                        </div>
                                        
                                        <div className="dashboard-events-block-title">
                                        Business Deals
                                        </div>

                                        <div className="dashboard-events-block-desc">
                                        Business Deals involve negotiations for partnerships or personal gains. Effective communication, strategy, and decision-making drive successful outcomes.
                                        </div>

                                        <div className="dashboard-events-block-footer-more">
                                            See more 
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M9.1874 4.55627L6.0624 1.43127C5.9499 1.31252 5.79365 1.24377 5.61865 1.24377C5.2749 1.24377 4.99365 1.52502 4.99365 1.86877C4.99365 2.04377 5.0624 2.20002 5.1749 2.31252L7.23115 4.36877H1.24365C0.899902 4.36877 0.618652 4.65002 0.618652 4.99377C0.618652 5.33752 0.899902 5.61877 1.24365 5.61877H7.2374L5.18115 7.67502C5.06865 7.78752 4.9999 7.94377 4.9999 8.11877C4.9999 8.46252 5.28115 8.74377 5.6249 8.74377C5.7999 8.74377 5.95615 8.67502 6.06865 8.56252L9.19365 5.43752C9.30615 5.32502 9.3749 5.16877 9.3749 4.99377C9.3749 4.81877 9.2999 4.66877 9.1874 4.55627Z" fill="#A94FD7"/>
                                            </svg>
                                        </div>

                                        <div className="dashboard-events-block-footer-coming">
                                        <img src={avatarImage} className="img-fluid" style={{ maxHeight: "20px" }} /> 
                                        </div>
                                    </div>

                                    <div className="dashboard-events-block">
                                        <div className="dashboard-events-block-title-stats">
                                        Meetings
                                        </div>
                                        
                                        <div className="dashboard-events-block-title">
                                        Team
                                        </div>

                                        <div className="dashboard-events-block-desc">
                                        Team involve collaborative negotiations within organizations to establish partnerships, aligning terms with goals. These events enhance teamwork, decision-making, and growth.
                                        </div>

                                        <div className="dashboard-events-block-footer-more">
                                            See more 
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M9.1874 4.55627L6.0624 1.43127C5.9499 1.31252 5.79365 1.24377 5.61865 1.24377C5.2749 1.24377 4.99365 1.52502 4.99365 1.86877C4.99365 2.04377 5.0624 2.20002 5.1749 2.31252L7.23115 4.36877H1.24365C0.899902 4.36877 0.618652 4.65002 0.618652 4.99377C0.618652 5.33752 0.899902 5.61877 1.24365 5.61877H7.2374L5.18115 7.67502C5.06865 7.78752 4.9999 7.94377 4.9999 8.11877C4.9999 8.46252 5.28115 8.74377 5.6249 8.74377C5.7999 8.74377 5.95615 8.67502 6.06865 8.56252L9.19365 5.43752C9.30615 5.32502 9.3749 5.16877 9.3749 4.99377C9.3749 4.81877 9.2999 4.66877 9.1874 4.55627Z" fill="#A94FD7"/>
                                            </svg>
                                        </div>

                                        <div className="dashboard-events-block-footer-coming">
                                        <img src={avatarImage} className="img-fluid" style={{ maxHeight: "20px" }} /> 
                                        </div>
                                    </div>

                                    <div className="dashboard-events-block">
                                        <div className="dashboard-events-block-title-stats">
                                        Meetings
                                        </div>
                                        
                                        <div className="dashboard-events-block-title">
                                        Personal
                                        </div>

                                        <div className="dashboard-events-block-desc">
                                        Personal Business Deals encompass individual pursuits of advantageous transactions, requiring research and negotiation. Prudence and informed decision-making are vital for success.
                                        </div>

                                        <div className="dashboard-events-block-footer-more">
                                            See more 
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M9.1874 4.55627L6.0624 1.43127C5.9499 1.31252 5.79365 1.24377 5.61865 1.24377C5.2749 1.24377 4.99365 1.52502 4.99365 1.86877C4.99365 2.04377 5.0624 2.20002 5.1749 2.31252L7.23115 4.36877H1.24365C0.899902 4.36877 0.618652 4.65002 0.618652 4.99377C0.618652 5.33752 0.899902 5.61877 1.24365 5.61877H7.2374L5.18115 7.67502C5.06865 7.78752 4.9999 7.94377 4.9999 8.11877C4.9999 8.46252 5.28115 8.74377 5.6249 8.74377C5.7999 8.74377 5.95615 8.67502 6.06865 8.56252L9.19365 5.43752C9.30615 5.32502 9.3749 5.16877 9.3749 4.99377C9.3749 4.81877 9.2999 4.66877 9.1874 4.55627Z" fill="#A94FD7"/>
                                            </svg>
                                        </div>

                                        <div className="dashboard-events-block-footer-coming">
                                        <img src={avatarImage} className="img-fluid" style={{ maxHeight: "20px" }} /> 
                                        </div>
                                    </div>

                                    <div className="dashboard-events-block-create">
                                        <h3>Create event</h3>

                                        <p>Create events, schedule and attend meetings.</p>

                                        <Link to={`/generalmeetings`}><Button variant='dark' className='w-100'>Create new Event</Button></Link>
                                    </div>
                                    </>
                                ) : (
                                    <>
                                    {userStats?.userEvents.length > 0 && userStats.userEvents.map((usere, index) => {
                                        const shade = userStats && userStats.userEvents && userStats.userEvents.length === (index + 1) ? true : false

                                        return (
                                            <React.Fragment key={`usere` + index}>
                                            <div className="dashboard-events-block position-relative">
                                                <div className="dashboard-events-block-title-stats">
                                                Meetings <span>{usere.meetingsNumber}</span>
                                                </div>
                                                
                                                <div className="dashboard-events-block-title">
                                                {usere.name}
                                                </div>

                                                <div className="dashboard-events-block-desc">
                                                {usere.description}
                                                </div>

                                                <div className="dashboard-events-block-footer-more">
                                                    <a to='#' onClick={() => handleShowInfoEvent(usere._id)}>
                                                    Details
                                                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                                                    </svg>
                                                    </a>
                                                </div>

                                                <div className="dashboard-events-block-footer-coming">
                                                <img src={avatarImage} className="img-fluid" style={{ maxHeight: "20px" }} /> 

                                                <span>{usere.quests} people attending</span>
                                                </div>

                                                {shade === true && <div className="blockshade"></div>}
                                            </div>
                                            </React.Fragment>
                                        )
                                    })}
                                    </>
                                )}

                            </div>
                        </div>
                    </Col>

                    <Col xl={9} sm={12}>
                            <Row>
                                {/* <Col xl={4} sm={12}>
                                    <div className="dashboard-main-block">
                                        <div className="dashboard-main-block-title">

                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M14.7002 7.28999L9.70023 2.28999C9.52023 2.09999 9.27023 1.98999 8.99023 1.98999C8.44023 1.98999 7.99023 2.43999 7.99023 2.98999C7.99023 3.26999 8.10023 3.51999 8.28023 3.69999L11.5702 6.98999H1.99023C1.44023 6.98999 0.990234 7.43999 0.990234 7.98999C0.990234 8.53999 1.44023 8.98999 1.99023 8.98999H11.5802L8.29023 12.28C8.11023 12.46 8.00023 12.71 8.00023 12.99C8.00023 13.54 8.45023 13.99 9.00023 13.99C9.28023 13.99 9.53023 13.88 9.71023 13.7L14.7102 8.69999C14.8902 8.51999 15.0002 8.26999 15.0002 7.98999C15.0002 7.70999 14.8802 7.46999 14.7002 7.28999Z" fill="#0A0A0A"/>
                                        </svg>

                                        Meetings
                                        </div>

                                        <div className="dashboard-main-stats-lines">
                                            <div className="dashboard-main-stats-parent">
                                                <div className="dashboard-main-stats-number"><label>{userStats?.eventsTodayCount ? userStats.eventsTodayCount : 0}</label></div> <div className="dashboard-main-stats-info">Events Today</div>
                                            </div>

                                            <div className="dashboard-main-stats-parent">
                                                <div className="dashboard-main-stats-number"><label>{userStats?.meetingsTodayCount ? userStats.meetingsTodayCount : 0}</label></div> <div className="dashboard-main-stats-info">Meetings Today</div>
                                            </div>
                                        </div>

                                        <div className="dashboard-main-stats-sub">
                                            <div><b><label>0</label></b> invitations</div>
                                            <div><b><label>{userStats?.confirmedMeetings ? userStats.confirmedMeetings : 0}</label></b> confirmed meetings</div>
                                        </div>
                                    </div>
                                </Col> */}
                                <Col xl={12} sm={12}>
                                    <div className="dashboard-main-block contracts-add-css mt-4">
                                        <div className="dashboard-main-block-title">

                                        <span>
                                            See all 
                                            <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                                            </svg>
                                        </span>

                                        Contracts 
                                        </div>

                                        <div className="dashboard-contracts-div">

                                            {userStats?.contracts && userStats.contracts.length < 1 ? (
                                                <>

                                                <div className="dashboard-contracts-block">
                                                <Row className="position-relative">
                                                    <Col sm={4}>
                                                        <div className="dashboard-contracts-block-p">
                                                            <b>Contract Name</b> <div className="space5px"></div>
                                                            Client: <span>youremail@mail.com</span>
                                                        </div>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <div className="dashboard-contracts-block-p">
                                                            Contract #: <span>000000</span> <div className="space5px"></div>
                                                            Status: -
                                                        </div>
                                                    </Col>
                                                    <Col sm={1}></Col>
                                                    <Col sm={3}>
                                                        <div className="dashboard-contracts-block-more">
                                                            Details
                                                            
                                                            <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                                                            </svg>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                </div>
                                                </>
                                            ) : (
                                                <>
                                                {userStats?.contracts && userStats.contracts.length > 0 && userStats.contracts.map((userc, index) => {
                                                    const shade = userStats && userStats.contracts && userStats.contracts.length === (index + 1) ? true : false

                                                    return (
                                                        <React.Fragment key={`userc` + index}>
                                                            <div className="dashboard-contracts-block position-relative">
                                                            <Row className="position-relative">
                                                                <Col sm={5}>
                                                                    <div className="dashboard-contracts-block-p">
                                                                        <b>{userc.title}</b> <div className="space5px"></div>
                                                                        Client: <span>{userc.signerEmail ? userc.signerEmail : 'No client'}</span>
                                                                    </div>
                                                                </Col>
                                                                <Col sm={5}>
                                                                    <div className="dashboard-contracts-block-p">
                                                                        Date: <span> {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(userc.date))}</span> <div className="space5px"></div>
                                                                        Status: {userc.status === 0 && userc.othersign === true ? (
                                                                                    <>
                                                                                    <span style={{ color: 'red'}}>Invalid</span>
                                                                                    </>
                                                                                ) : userc.status === 1 && userc.othersign === true ? (
                                                                                    <>
                                                                                    <span style={{ color: 'green'}}>Success</span>
                                                                                    </>
                                                                                ) : (
                                                                                <>
                                                                                    <span style={{ color: 'gray'}}>In progress</span>
                                                                                </>
                                                                                )}
                                                                    </div>
                                                                </Col>
                                                                <Col sm={2}>
                                                                    <div className="dashboard-contracts-block-more">
                                                                        <a to='#' onClick={() => handleShowInfoContract(userc._id)}>
                                                                        Details
                                                                        
                                                                        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                                                                        </svg>
                                                                        </a>
                                                                    </div>
                                                                </Col>
                                                            </Row>

                                                            {shade === true && <div className="blockshade"></div>}
                                                            </div>
                                                        </React.Fragment>
                                                    )
                                                })}
                                                </>
                                            )}

                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col xl={3} sm={12}>
                            <div className="dashboard-main-block mt-4">
                                        <div className="dashboard-main-block-title">

                                        <span>
                                            See all 
                                            <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                                            </svg>
                                        </span>

                                        Clients
                                        </div>

                                        <div className="dashboard-main-stats-lines">
                                            <div className="dashboard-main-stats-parent">
                                                <div className="dashboard-main-stats-number clients-parent-text">{userStats?.totalClients ? userStats.totalClients : 0}</div> <div className="dashboard-main-stats-info clients-parent-text-small">Total clients</div>
                                            </div>

                                            <div className="dashboard-main-stats-parent">
                                                <div className="dashboard-main-stats-number active-clients-parent-text">{userStats?.activeClients ? userStats?.activeClients : 0}</div> <div className="dashboard-main-stats-info active-clients-parent-text-small">Active clients</div>
                                            </div>
                                        </div>

                                        <div className="invite-clients">
                                            <Row className="position-relative"> 
                                                <Col sm={6}>
                                                    <div className="invite-clients-first">
                                                        <h3>Awaits Approval</h3>

                                                        <h2>0</h2>
                                                    </div>
                                                </Col>
                                                <Col sm={6}>
                                                    <div className="invite-clients-second">
                                                        Approve Clients

                                                        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                                                        </svg>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                            </div>
                        </Col>
                </Row>
            </Col>
        </Row>
        </Container>
        </>
    )
}

export default Dashboard;