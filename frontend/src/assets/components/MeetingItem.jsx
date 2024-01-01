import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';

import LoadingSpinner from '../UI/LoadingSpinner';
import axios from 'axios';

import moment from 'moment'

import TimeDisplay from '../helpers/TimeDisplay';

import zoomSmallIco from '../images/zoom_small.png'

import { AuthContext } from '../context/auth-context';

const MeetingItem = (props) => {
    console.log(props.questions)

    const auth = useContext(AuthContext)
    const user = JSON.parse(localStorage.getItem('userData'))
    const [isLoading, setIsLoading] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)

    const deleteMeeting = async (id) => {
      try {
          setIsLoading(true)
          const response = await axios.delete( `http://localhost:5000/server/api/meetingdelete/${id}`, {
            headers: {
                Authorization: 'Bearer ' + user.token
            }
        });
  
        if(response.data.message === "global_success"){
          props.onUpdate()
        }
  
        setIsLoading(true)
      } catch (err) {
        console.log(err)
        toast.error(err, {position: toast.POSITION.BOTTOM_CENTER})
        setIsLoading(false)
      }
  }

  const copyLinkToClipboard = (link) => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        console.log('Link copied to clipboard:', link);
      })
      .catch((error) => {
        console.error('Failed to copy link to clipboard:', error);
      });
  };

  const deleteZoomMeeting = async (id) => {
    try {
      setIsLoading(true);
  
      const response = await axios.post(
        'http://localhost:5000/server/api/connect/zoom/remove',
        { meetingId: id, dbId: props.id },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + user.token,
          },
        }
      );
  
      props.onUpdate();
      setIsLoading(false);
    } catch (err) {
      toast.error(err.message, { position: toast.POSITION.BOTTOM_CENTER });
      setIsLoading(false);
    }
  };

  const [show, setShow] = useState(false);
  const [newDate, setNewDate] = useState('')
  const [newStartTime , setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const rescheduleTime = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:5000/server/api/connect/zoom/reschedule',
        {
          meetingId: props.selected_time.zoomEventId,
          newDateTime: newDate + 'T' + newStartTime,
          newEndTime: newDate + 'T' + newEndTime,
          dbId: props.id
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + user.token,
          },
        }
      );

      if (response.data.message === 'global_success') {
        toast.success('Meeting rescheduled successfully!', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
        props.onUpdate();
      } else {
        toast.error('Error rescheduling meeting.', {
          position: toast.POSITION.BOTTOM_CENTER,
        });
      }
    } catch (err) {
      console.log(err);
      toast.error('Error rescheduling meeting.', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }

    handleClose();
  };
  
  const [showInfo, setShowInfo] = useState(false);

  const handleCloseInfo = () => setShowInfo(false);
  const handleShowInfo = () => setShowInfo(true);

  
  return (
    <>
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Reschedule Time</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="global-form" onSubmit={rescheduleTime}>
          <Form.Group controlId="newDate">
            <Form.Label>Date:</Form.Label>
            <Form.Control
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="newStartTime">
            <Form.Label>Start Time:</Form.Label>
            <Form.Control
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="newEndTime">
            <Form.Label>End Time:</Form.Label>
            <Form.Control
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
            />
          </Form.Group>

          <Button variant="success" type="submit" className="my-4">
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>

    {auth.windowWidth < 650 && (
      <>
      <Modal size="lg" show={showInfo} onHide={handleCloseInfo} className="display-on-mobile-device custom-mobile-modal modal-top-global">
          <Modal.Header closeButton>
            <Modal.Title className='text-align-start'>{props?.event?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="position-relative">
                  <div className="modal-custom-info-content">
                      <p>{props?.event?.description}</p>

                      <hr />

                      <div className="modal-custom-info-witht">
                      <p>Time</p>
                      <TimeDisplay date={props.selected_time.date} start={props.selected_time.start} end={props.selected_time.end} />
                      </div>
                      
                      <div className="modal-custom-info-witht">
                      {props.selected_time.zoomMeetingLink && (
                          <>
                                <hr />

                                <p>Place</p>
                                <b><img src={zoomSmallIco} className="img-fluid" /> Zoom meeting</b>


                                <a
                                  className="event-copy-link-modal"
                                  style={{ marginRight: "0.5rem" }}
                                  onClick={() => copyLinkToClipboard(`${props.selected_time.zoomMeetingLink}`)}
                                >
                                  <i className="fa-solid fa-link"></i> Copy link
                                </a>
                              
                          </>
                        )}
                      </div>

                        
                      {props.questions && props.questions.length > 0 && (
                        <>
                          <div className="modal-custom-info-content-questions mt-2">
                            <h3>Questions</h3>

                            {props.questions.map((questionSet, index) => {
                              return (
                                <React.Fragment key={`q${index}`}>
                                  {Object.keys(questionSet).map((key, innerIndex) => {
                                    const question = questionSet[key];
                                    return (
                                      <div className="modal-question-d" key={`q${index}-${innerIndex}`}>
                                        <p>{question.field_description}</p>

                                        <div className="modal-question-d-reply">
                                          {question.answer}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </>
                      )}

                  </div>
          </Modal.Body>
      </Modal>
      </>
    )}

    {isLoading && <LoadingSpinner asOverlay={true} />}
    <React.Fragment key={`meeting${props.index}`}>
    {props.mobile === false ? (
      <>
      <tr className={`${openEdit === true ? 'custom-table-css-active' : 'custom-table-css'}`} onClick={() => setOpenEdit(!openEdit)}>
              <td className="table-index">{props.index}.</td>
              <td>{props.link}</td>
              {/* <td>{props.selected_times.length} schedule times</td> */}
              <td>{props.email}</td>
              <td>{props.quests.length} people</td>
              <td>
                  {/* <Button variant='light' size='sm' className='m-1 table-btns' onClick={() => setOpenEdit(!openEdit)}><i className="fa-solid fa-gear"></i></Button> */}
                  <Button variant='light' size='sm' className='m-1 table-btns' onClick={() => deleteMeeting(props.id)}><i className="fa-solid fa-trash"></i></Button>
              </td>
          </tr>
          {openEdit && 
            <tr>
              <td colSpan="12">
                <div>
                  <Row className="m-0">
                    <Col sm={4}>
                      <div className="meetinginfo-panel-info">
                      <label>Name:</label> {props.name}
                      </div>

                      <div className="meetinginfo-panel-info">
                      <label>Email:</label> {props.email}
                      </div>
                    </Col>
                    <Col sm={4}>
                      <div className="meetinginfo-panel-info">
                      <label>Date:</label> {moment(props.date).format('MM.DD.YYYY')}
                      </div>

                      {props.selected_time && (
                        <>
                            <div className="meetinginfo-panel-info">
                            {props.selected_time.zoomMeetingLink && (<>
                              <div className="meeting-panel-btns">
                                <a
                                  className="event-copy-link"
                                  style={{ marginRight: "0.5rem" }}
                                  onClick={() => handleShow()}
                                >
                                  <i className="fa-solid fa-calendar-days"></i>
                                </a>

                                <a
                                  className="event-copy-link"
                                  style={{ marginRight: "0.5rem" }}
                                  onClick={() => deleteZoomMeeting(props.selected_time.zoomEventId)}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </a>
                              </div>

                              <a
                                className="event-copy-link"
                                style={{ marginRight: "0.5rem" }}
                                onClick={() => copyLinkToClipboard(`${props.selected_time.zoomMeetingLink}`)}
                              >
                                <i className="fa-solid fa-link"></i>
                              </a>
                            </>)}  
                            
                            <TimeDisplay date={props.selected_time.date} start={props.selected_time.start} end={props.selected_time.end} />
                            </div>
                        </>
                      )}
                    </Col>
                    <Col sm={4}>
                      <div className="meetinginfo-panel-info">
                      <label>Link:</label> {props.link}
                      </div>

                      <div className="meetinginfo-panel-info">
                      <label>Questions:</label> {props.questions.length}
                      </div>

                      <div className="meetinginfo-panel-info">
                      <label>Guests:</label> {props.quests.length}
                      </div>

                      <Button variant="light" className="float-end" size="sm" onClick={() => setOpenEdit(!openEdit)}>Close</Button>
                    </Col>
                  </Row>
                </div>
              </td>
            </tr>
          }
      </>
    ) : (
      <>
      <Col lg={12} key={`m` + props.index}>
        <div className="mobile-event-list-block position-relative">
            <h4>{props?.event?.name}</h4>

            <p><TimeDisplay date={props.selected_time.date} start={props.selected_time.start} end={props.selected_time.end} /></p>

            <div className="mobile-event-list-block-stats-description">{props?.event?.description}</div>

            <div className="mobile-event-list-block-footer-more" style={{ marginTop: "-5px"}}>
                <Link onClick={() => handleShowInfo()}>
                Details 
                <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                </svg>
                </Link>
            </div>

            <div className="mobile-event-list-block-footer-coming">
                                        <a href="#" onClick={() => copyLinkToClipboard(`https://incio.io/meeting/${props.link}`)}>
                                        <span className="meeting-f-b">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M4.08322 3.49984V1.74984C4.08322 1.42767 4.34439 1.1665 4.66655 1.1665H11.6666C11.9887 1.1665 12.2499 1.42767 12.2499 1.74984V9.9165C12.2499 10.2387 11.9887 10.4998 11.6666 10.4998H9.91655V12.2493C9.91655 12.5718 9.65411 12.8332 9.32925 12.8332H2.33722C2.01284 12.8332 1.75 12.5738 1.75 12.2493L1.75152 4.08368C1.75157 3.76123 2.01404 3.49984 2.33883 3.49984H4.08322ZM2.91808 4.6665L2.91678 11.6665H8.74988V4.6665H2.91808ZM5.24988 3.49984H9.91655V9.33317H11.0832V2.33317H5.24988V3.49984Z" fill="#BF5AF2"/>
                                        </svg>
  
                                        Copy link
                                        </span>
                                        </a>
            </div>

            {props.shade === true && <div className="blockshade"></div>}
        </div>
      </Col>
      </>
    )}
    </React.Fragment>
    </>
  );
};

export default MeetingItem;
