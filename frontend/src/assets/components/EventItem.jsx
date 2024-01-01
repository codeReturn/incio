import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';

import { Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';

import moment from 'moment';
import axios from 'axios';

import LoadingSpinner from '../UI/LoadingSpinner';

import { AuthContext } from '../context/auth-context';

const EventItem = props => {
  const auth = useContext(AuthContext)
  const user = JSON.parse(localStorage.getItem('userData'))
  const [isLoading, setIsLoading] = useState(false)

  const copyLinkToClipboard = (link) => {
        navigator.clipboard
          .writeText(link)
          .then(() => {
            toast.success('Link copied to clipboard', {
              position: toast.POSITION.BOTTOM_CENTER,
            });
          })
          .catch((error) => {
            console.error('Failed to copy link to clipboard:', error);
          });
  };

  const deleteEvent = async (id) => {
    try {
        setIsLoading(true)
        const response = await axios.delete( `http://localhost:5000/server/api/eventdelete/${id}`, {
          headers: {
              Authorization: 'Bearer ' + user.token
          }
      });

      if(response.data.message === "global_success"){
        props.onUpdate();
      }

      setIsLoading(true)
    } catch (err) {
      toast.error(err, {position: toast.POSITION.BOTTOM_CENTER})
      console.log(err)
      setIsLoading(false)
    }
  }

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const locationOptions = [
    { value: 'live', label: 'Live' },
    { value: 'zoom', label: 'Zoom' }
  ];

  const calendarOptions = [
    { value: 'default', label: 'Default Calendar' },
    { value: 'google', label: 'Google Calendar' }
  ];

  const calendardefaultValue = calendarOptions.find(option => option.value === props.eventcalendar);

  const durationOptions = [
    { value: '15', label: '15' },
    { value: '30', label: '30' },
    { value: '45', label: '45' },
    { value: '60', label: '60' }
  ];

  const durationdefaultValue = durationOptions.find(option => option.value === props.eventduration);

  const questiontypeOptions = [
    { value: 'text', label: 'One Line text' },
    { value: 'radio', label: 'Radio Box' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'phone', label: 'Phone number' },
  ]

  const handleEventName = (value) => {
    setEventName(value);
    
    const formattedValue = value.toLowerCase().replace(/\s+/g, '-');
    const randomString = `${formattedValue}-${Math.floor(Math.random() * 1000000)}`;
    setUniqueLink(randomString);
  };

  const [displayAddress, setDisplayAddress] = useState(false);
  const [eventLocation, setEventLocation] = useState(props.location);

  const [selectedDates, setSelectedDates] = useState(props.scheduletimes || []);
  const [schedule, setSchedule] = useState(props.scheduletimes || []);

  const handleLocation = (e) => {
    if (e.value === 'live') {
      setDisplayAddress(true);
      setEventLocation('live')
    } else if (e.value === 'zoom') {
      setEventLocation('zoom')
      setDisplayAddress(false);
      callZoom();
    } else {
      return;
    }
  };

  const defaultValue = locationOptions.find(option => option.value === props.location);

  const [eventCalendar, setEventCalendar] = useState(props.eventcalendar);

  const handleCalender = (e) => {
    if (e.value === 'google') {
      setEventCalendar('google')
      callCalendar();
    } else if(e.value === 'default'){
      setEventCalendar('default')
    }
  };

  const [eventDuration, setEventDuration] = useState(props.eventduration)

  const handleDuration = (e) => {
    setEventDuration(e.value);
  };

  const connectToService = async (service, userId, token) => {
    try {
      // Check if the user is already connected
      const checkResponse = await axios.get(
        `http://localhost:5000/server/api/connect/check/${service}/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );
  
      // If the user is not connected, open a new tab for authentication
      if (!checkResponse.data.isConnected) {
        const response = await axios.post(
          `http://localhost:5000/server/api/connect/${service}`,
          { userId },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
          }
        );
  
        const authUrl = response.data.authUrl;
        window.open(`${authUrl}?userId=${userId}`, '_blank');
      }
    } catch (error) {
      toast.error(error, {position: toast.POSITION.BOTTOM_CENTER})
      console.error(`Error connecting to ${service}:`, error.response ? error.response.data : error);
    }
  };
  
  const callZoom = async () => {
    await connectToService('zoom', user.userId, user.token);
  };
  
  const callCalendar = async () => {
    await connectToService('google', user.userId, user.token);
  };  

  const [eventDate, setEventDate] = useState(props.eventdate);  
  const [eventAvailable, setEventAvailable] = useState(props.eventavailable);
    
  const closeCreating = () => {
    props.onUpdate();
  };

  // Days
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleCheckboxChange = (e, index) => {
    const isChecked = e.target.checked;
    const day = daysOfWeek[index];
  
    setSelectedDates((prevSelectedDates) => {
      if (isChecked) {
        return [...prevSelectedDates, day];
      } else {
        return prevSelectedDates.filter((selectedDate) => selectedDate !== day);
      }
    });
  };
    
  const [timeByDate, setTimeByDate] = useState({}); // Track start and end times by date
  
  const handleTimeChange = (e, type, day) => {
    const value = e.target.value;
    const timeValue = moment(value, 'HH:mm A').format('HH:mm');
  
    setTimeByDate((prevTimeByDate) => ({
      ...prevTimeByDate,
      [day]: {
        ...prevTimeByDate[day],
        [type]: timeValue,
      },
    }));
  };
    
  const handleAddTime = (day) => {
    const { start, end } = timeByDate[day];
  
    const startTime = moment(start, 'HH:mm');
    const endTime = moment(end, 'HH:mm');
  
    if (startTime.isBefore(endTime)) {
      const selectedDayIndex = schedule.findIndex((scheduleDay) => scheduleDay.day === day);
  
      if (selectedDayIndex !== -1) {
        const updatedSchedule = [...schedule];
        updatedSchedule[selectedDayIndex].schedule_times.push({ start, end });
        setSchedule(updatedSchedule);
      } else {
        setSchedule((prevSchedule) => [
          ...prevSchedule,
          {
            day: day,
            schedule_times: [{ start, end }],
          },
        ]);
      }
    }
  
    setTimeByDate((prevTimeByDate) => ({
      ...prevTimeByDate,
      [day]: { start: '', end: '' },
    }));
  };  
  
  const handleRemoveTime = (day, timeToRemove) => {
    setSchedule((prevSchedule) => {
      const updatedSchedule = prevSchedule.map((scheduleDay) => {
        if (scheduleDay.day === day) {
          scheduleDay.schedule_times = scheduleDay.schedule_times.filter(
            (time) => time.start !== timeToRemove.start || time.end !== timeToRemove.end
          );
        }
        return scheduleDay;
      });
      return updatedSchedule;
    });
  };
  
  // Questions
  const [showQuestionsForm, setShowQuestionsForm] = useState(false);
  const [questiontype, setQuestionType] = useState('');
  const [fieldDescription, setFieldDescription] = useState('');
  const [options, setOptions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState(props.questions || []);
  const [required, setRequired] = useState(false);

  const handleQuestiontypeChange = (selectedOption) => {
    setQuestionType(selectedOption.value);
    setOptions([]);
  };

  const handleAddQuestion = () => {
    if (!fieldDescription) {
      return;
    }
  
    const newQuestion = {
      type: questiontype,
      field_description: fieldDescription,
      required: required,
      questions: options.map((option) => ({
        type: questiontype,
        description: option,
      })),
    };
  
    setSavedQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
  
    setQuestionType('');
    setFieldDescription('');
    setOptions([]);
    setRequired(false);
  };
  

  const handleOptionChange = (index, value) => {
    setOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[index] = value;
      return updatedOptions;
    });
  };

  const handleAddOption = () => {
    setOptions((prevOptions) => [...prevOptions, '']);
  };

  const handleRemoveOption = (index) => {
    setOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions.splice(index, 1);
      return updatedOptions;
    });
  };

  const handleEditQuestion = (questionIndex) => {
    const questionToEdit = savedQuestions[questionIndex];
    setQuestionType(questionToEdit.type);
    setFieldDescription(questionToEdit.field_description);
    setOptions(questionToEdit.questions.map((question) => question.description));
    setRequired(questionToEdit.required);
    const updatedQuestions = [...savedQuestions];
    updatedQuestions.splice(questionIndex, 1);
    setSavedQuestions(updatedQuestions);
  };
  
  const handleDeleteQuestion = (questionIndex) => {
    const updatedQuestions = [...savedQuestions];
    updatedQuestions.splice(questionIndex, 1);
    setSavedQuestions(updatedQuestions);
  };

  let defaultDate = new Date(props.eventdate);
  defaultDate = defaultDate.toISOString().substr(0,10);

  // create event
  const [eventName, setEventName] = useState(props.name);
  const [eventDescription, setEventDescription] = useState(props.description);
  const [locationAddress, setLocationAddress] = useState(props.locationaddress);
  const [uniqueLink, setUniqueLink] = useState(props.uniquelink);

  const updateEvent = async (event) => {
    event.preventDefault();

    const formattedSchedule = schedule.map((day) => ({
      ...day,
      schedule_times: day.schedule_times.map((time) => ({
        start: moment(time.start, 'HH:mm').format('hh:mm A'),
        end: moment(time.end, 'HH:mm').format('hh:mm A')
      }))
    }));

    const eventObj = {
      id: props.id,
      name: eventName,
      description: eventDescription,
      location: eventLocation,
      locationaddress: locationAddress,
      eventcalendar: eventCalendar,
      eventdate: eventDate,
      eventavailable: eventAvailable,
      eventduration: eventDuration,
      questions: savedQuestions,
      uniquelink: uniqueLink,
      scheduletimes: formattedSchedule
    }

    try {
      setIsLoading(true)
      
      const response = await axios.post(
        `http://localhost:5000/server/api/eventupdate`,
        { event: eventObj },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + user.token,
          },
        }
      );

      if(response.data.message === 'global_success') {
        window.location.href = '/events'
      }

      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      toast.error(err, {position: toast.POSITION.BOTTOM_CENTER})
    }
  }

  function truncateName(name) {
    if (name.length > 20) {
      name = name.substring(0, 20) + "...";
    }
    return name;
  }

  const customStyles = {
    control: (provided, { isFocused }) => ({
      ...provided,
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      color: isFocused ? 'white' : 'inherit',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
      color: state.isSelected ? 'black' : 'inherit',
      '&:hover': {
        backgroundColor: 'black',
        color: 'white',
      },
    }),
  };

  const [showInfo, setShowInfo] = useState(false);

  const handleCloseInfo = () => setShowInfo(false);
  const handleShowInfo = () => setShowInfo(true);

  return (
    <>
    <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body className="position-relative">
        {isLoading && <LoadingSpinner asOverlay={true} />}
        <Form className="global-form" onSubmit={updateEvent}>
              <Row className="form-row g-0">
                <Col sm={6} className="px-2">
                  <Form.Group className="mb-3" controlId="eventForm.name">
                    <Form.Control
                      type="text"
                      placeholder="Event Name"
                      className="global-formcontrol"
                      defaultValue={props.name}
                      onChange={(e) => handleEventName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="eventForm.location">
                    <Select
                      options={locationOptions}
                      onChange={(e) => handleLocation(e)}
                      defaultValue={defaultValue}
                      className="global-select"
                      classNamePrefix="custom-select"
                      placeholder="Location"
                      styles={customStyles}
                    />
                  </Form.Group>

                  {displayAddress && (
                    <>
                      <Form.Group
                        className="mb-3"
                        controlId="eventForm.locationaddress"
                      >
                        <Form.Control
                          type="text"
                          placeholder="Address"
                          className="global-formcontrol"
                          defaultValue={props.locationaddress}
                          onChange={(e) => setLocationAddress(e.target.value)}
                        />
                      </Form.Group>
                    </>
                  )}

                  <Form.Group className="mb-3" controlId="eventForm.description">
                    <Form.Control
                      as="textarea"
                      placeholder="Description"
                      defaultValue={props.description}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={4}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="eventForm.calender">
                    <Select
                      options={calendarOptions}
                      onChange={(e) => handleCalender(e)}
                      defaultValue={calendardefaultValue}
                      className="global-select"
                      classNamePrefix="custom-select"
                      placeholder="Connect Calender"
                      styles={customStyles}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6} className="px-2">
                  <Form.Group className="mb-3" controlId="eventForm.date">
                    <Form.Control type="date" placeholder="Date" defaultValue={defaultDate} onChange={(e) => setEventDate(e.target.value)} />
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="eventForm.eventDuration"
                  >
                    <Form.Control
                      type="text"
                      placeholder="Event duration"
                      className="global-formcontrol"
                      defaultValue={props.eventavailable}
                      onChange={(e) => setEventAvailable(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="eventForm.duration">
                    <Select
                      options={durationOptions}
                      onChange={(e) => handleDuration(e)}
                      className="global-select"
                      defaultValue={durationdefaultValue}
                      classNamePrefix="custom-select"
                      placeholder="Duration"
                      styles={customStyles}
                    />
                  </Form.Group>

                  <div className="event-dates">
                  {eventCalendar === 'default' && daysOfWeek.map((day, index) => {
                    const timeByDateExists = timeByDate[day] && Object.keys(timeByDate[day]).length > 0;

                    return (
                      <div key={index} className="event-dates-date">
                        <Form.Check
                          type="checkbox"
                          id={index}
                          label={day}
                          onChange={(e) => handleCheckboxChange(e, index)}
                          checked={selectedDates.includes(day)}
                        />

                        {selectedDates.includes(day) && (
                          <>
                            <Row>
                              <Col sm={5}>
                                <Form.Control
                                  id={`start-time` + index}
                                  type="time"
                                  value={timeByDate[day]?.start || ''}
                                  onChange={(e) => handleTimeChange(e, 'start', day)}
                                  className="custom-picker-css"
                                />
                              </Col>
                              <Col sm={5}>
                                <Form.Control
                                  id={`end-time` + index}
                                  type="time"
                                  value={timeByDate[day]?.end || ''}
                                  onChange={(e) => handleTimeChange(e, 'end', day)}
                                  className="custom-picker-css"
                                />
                              </Col>
                              <Col sm={2}>
                                {timeByDateExists && (
                                  <Button onClick={() => handleAddTime(day)} className="general-light-btn" size="sm">
                                    <i className="fa-solid fa-plus"></i>
                                  </Button>
                                )}
                              </Col>
                            </Row>
                            {schedule.map((scheduleDay) =>
                              scheduleDay.day === day ? (
                                scheduleDay.schedule_times.map((time, index) => {
                                  const startTime = moment(time.start, 'HH:mm');
                                  const endTime = moment(time.end, 'HH:mm');
                                  const isTimeSelected =
                                    timeByDate[day] &&
                                    startTime.isSameOrBefore(moment(timeByDate[day].end, 'HH:mm')) &&
                                    endTime.isSameOrAfter(moment(timeByDate[day].start, 'HH:mm'));

                                  return (
                                    <Row key={index} className="event-dates-date-time">
                                      <Col sm={5}>{moment(time.start, 'HH:mm').format('hh:mm A')}</Col>
                                      <Col sm={5}>{moment(time.end, 'HH:mm').format('hh:mm A')}</Col>
                                      <Col sm={2}>
                                        <Button
                                          onClick={() => handleRemoveTime(day, time)}
                                          className="general-light-btn"
                                          size="sm"
                                          disabled={isTimeSelected}
                                        >
                                          <i className="fa-solid fa-minus"></i>
                                        </Button>
                                      </Col>
                                    </Row>
                                  );
                                })
                              ) : null
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}

                  </div>
                </Col>
                <Col sm={6} className="px-2">
                  <div className="questions-title">
                    {showQuestionsForm ? (
                      <Button
                        onClick={() => setShowQuestionsForm(false)}
                        className="general-light-btn added-class float-end btn-sm"
                      >
                        <i className="fa-solid fa-minus"></i>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowQuestionsForm(true)}
                        className="general-light-btn added-class float-end btn-sm"
                      >
                        <i className="fa-solid fa-plus"></i>
                      </Button>
                    )}
                    Questions
                  </div>

                  {showQuestionsForm && (
                    <Row className="my-4">
                      <Col sm={12}>
                        <Form.Group className="mb-3" controlId="eventForm.questiontype">
                          <Select
                            options={questiontypeOptions}
                            onChange={handleQuestiontypeChange}
                            className="global-select"
                            classNamePrefix="custom-select"
                            placeholder="Select"
                            value={questiontypeOptions.find((option) => option.value === questiontype)}
                            styles={customStyles}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="eventForm.questiondescription">
                          <Form.Control
                            type="text"
                            placeholder="Field Description"
                            className="global-formcontrol"
                            value={fieldDescription}
                            onChange={(e) => setFieldDescription(e.target.value)}
                          />
                        </Form.Group>

                        {questiontype === 'checkbox' && (
                          <>
                            {options.map((option, index) => (
                              <div key={index} className="d-flex align-items-center mb-3">
                                <Form.Check
                                  type="checkbox"
                                  id={`checkbox-option-${index}`}
                                  disabled
                                />
                                <Form.Control
                                  type="text"
                                  placeholder="Option"
                                  className="style-input ml-3"
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, e.target.value)}
                                />
                                <Button
                                  className="general-light-btn added-class ml-3"
                                  size="sm"
                                  onClick={() => handleRemoveOption(index)}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </Button>
                              </div>
                            ))}
                            <Button
                              className="general-light-btn custom-buttons-quest"
                              size="sm"
                              onClick={handleAddOption}
                            >
                              <i className="fa-solid fa-plus"></i>
                            </Button>
                          </>
                        )}

                        {questiontype === 'radio' && (
                          <>
                            {options.map((option, index) => (
                              <div key={index} className="d-flex align-items-center mb-3">
                                <Form.Check
                                  type="radio"
                                  id={`radio-option-${index}`}
                                  disabled
                                />
                                <Form.Control
                                  type="text"
                                  placeholder="Option"
                                  className="style-input ml-3"
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, e.target.value)}
                                />
                                <Button
                                  className="general-light-btn custom-buttons-quest ml-3"
                                  size="sm"
                                  onClick={() => handleRemoveOption(index)}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </Button>
                              </div>
                            ))}
                            <Button
                              className="general-light-btn custom-buttons-quest mb-3"
                              size="sm"
                              onClick={handleAddOption}
                            >
                              <i className="fa-solid fa-plus"></i>
                            </Button>
                          </>
                        )}

                        {questiontype === 'dropdown' && (
                          <>
                            {options.map((option, index) => (
                              <div key={index} className="d-flex align-items-center mb-3">
                                <Form.Control
                                  type="text"
                                  placeholder="Option"
                                  className="style-input"
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, e.target.value)}
                                />
                                <Button
                                  className="general-light-btn custom-buttons-quest ml-3"
                                  size="sm"
                                  onClick={() => handleRemoveOption(index)}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </Button>
                              </div>
                            ))}
                            <Button
                              className="general-light-btn custom-buttons-quest mb-3"
                              size="sm"
                              onClick={handleAddOption}
                            >
                              <i className="fa-solid fa-plus"></i>
                            </Button>
                          </>
                        )}

                        <Row className="align-items-center">
                          <Col sm={6}>
                          <Form.Check
                            type="checkbox"
                            id="default-checkbox"
                            checked={required}
                            onChange={(e) => setRequired(e.target.checked)}
                            label="Required"
                          />                          
                          </Col>
                          <Col sm={6}>
                            <Button onClick={handleAddQuestion} className="general-light-btn float-end btn-sm">
                              Save
                            </Button>
                          </Col>
                        </Row>

                        <Form.Group className="clearfix"></Form.Group>
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Col sm={12}>
                      {savedQuestions.length > 0 && (
                        <div className="saved-questions-container">
                          {savedQuestions.map((question, index) => (
                            <div key={index} className="saved-question my-3">
                              <Row className="align-items-center">
                                <Col sm={9}>
                                  <div className="saved-question-description">{question.field_description}</div>
                                </Col>
                                <Col sm={3}>
                                  <Button
                                    className="general-light-btn custom-buttons-quest float-end radius-0"
                                    size="sm"
                                    onClick={() => handleEditQuestion(index)}
                                  >
                                    <i className="fa-solid fa-pencil"></i>
                                  </Button>
                                  <Button
                                    className="general-light-btn custom-buttons-quest float-end radius-0"
                                    size="sm"
                                    onClick={() => handleDeleteQuestion(index)}
                                  >
                                    <i className="fa-solid fa-trash"></i>
                                  </Button>
                                </Col>
                              </Row>
                            </div>
                          ))}
                        </div>
                      )}
                    </Col>
                  </Row>
                </Col>
                <Col sm={6} className="px-2">
                  <Form.Group className="mb-3" controlId="eventForm.unique-link">
                    <Form.Control
                      type="text"
                      placeholder="/unique-link"
                      className="global-formcontrol"
                      onChange={(e) => setUniqueLink(e.target.value)}
                      defaultValue={props.uniquelink}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="light"
                className="general-light-btn"
                type="submit"
                >
                 Save
              </Button>
            </Form>
        </Modal.Body>
    </Modal>

    {auth.windowWidth < 650 && (
      <>
      <Modal size="lg" show={showInfo} onHide={handleCloseInfo} className="display-on-mobile-device custom-mobile-modal modal-top-global">
          <Modal.Header closeButton>
            <Modal.Title className='text-align-start'>{props.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="position-relative">
                  <div className="modal-custom-info-content">
                      <p>{props.description}</p>
                      <p>{moment(props.eventdate).format('ddd MMM D, YYYY')}</p>

                      {props.questions && props.questions.length > 0 && (
                        <>
                        <div className="modal-custom-info-content-questions">
                            <h3>Questions</h3>

                            {props.questions.map((question, index) => {
                              console.log(question)
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
                  </div>
          </Modal.Body>
      </Modal>
      </>
    )}

    {isLoading && <LoadingSpinner asOverlay={true} />}

    {!props.mobile || props.mobile === false ? (
      <>
      <Card key={`event${props.index}`} className="event-card my-2">
          <Card.Body>
            <Card.Title className="event-title-name">{truncateName(props.name)}</Card.Title>
            <div className="event-details">
              <p className="event-time">
                <label>Time:</label> {moment(props.eventdate).format('ddd MMM D, YYYY')}
              </p>
              <p className="event-place">
                <label>Place:</label> {props.location}
              </p>
            </div>
            <div className="event-footer">
              <div className="float-end card-buttons">
              <Button variant='light' size='sm' className='m-1' onClick={() => handleShow()}><i className="fa-solid fa-gear"></i></Button>
              <Button variant='light' size='sm' className='m-1' onClick={() => deleteEvent(props.id)}><i className="fa-solid fa-trash"></i></Button>
              </div>

              <p
                className="event-copy-link"
                onClick={() => copyLinkToClipboard(`https://incio.io/meeting/${props.uniquelink}`)}
              >
                <i className="fa-solid fa-link"></i> Copy Link
              </p>
            </div>
          </Card.Body>
      </Card>   
      </>
    ) : (
      <>
      <div className="mobile-event-list-block position-relative">
          <span className="mobile-event-list-block-stats">Meetings <b>{props.meetingsCount}</b></span>

          <h4>{props.name}</h4>

          <div className="mobile-event-list-block-stats-description">{props.description}</div>

          <div className="mobile-event-list-block-footer-more">
              <Link onClick={() => handleShowInfo()}>
              Details 
              <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
              </svg>
              </Link>
          </div>

          <div className="mobile-event-list-block-footer-coming">
              <span style={{ fontSize: "14px" }}>{moment(props.eventdate).format('ddd MMM D, YYYY')}</span>
              {props.shade}
          </div>

          {props.shade === true && <div className="blockshade"></div>}
      </div>
      </>
    )}
    </>
  );
};

export default EventItem;
