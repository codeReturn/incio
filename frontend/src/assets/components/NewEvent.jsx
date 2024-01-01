import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import Select from 'react-select';
import moment from 'moment';

import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../UI/LoadingSpinner';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { AuthContext } from '../context/auth-context';


const NewEvent = props => {
  const auth = useContext(AuthContext);

  const user = JSON.parse(localStorage.getItem('userData'))
  const [openStatus, setOpenStatus] = useState(props.open);
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setOpenStatus(props.open);
  }, [props.open]);

  const locationOptions = [
    { value: 'live', label: 'Live' },
    { value: 'zoom', label: 'Zoom' }
  ];

  const calendarOptions = [
    { value: 'default', label: 'Default Calendar' },
    { value: 'google', label: 'Google Calendar' }
  ];

  const durationOptions = [
    { value: '15', label: '15' },
    { value: '30', label: '30' },
    { value: '45', label: '45' },
    { value: '60', label: '60' }
  ];

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
  const [eventLocation, setEventLocation] = useState();

  const [selectedDates, setSelectedDates] = useState([]);
  const [schedule, setSchedule] = useState([]);

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

  const [eventCalendar, setEventCalendar] = useState();

  const handleCalender = (e) => {
    console.log(e.value)
    if (e.value === 'google') {
      setEventCalendar('google')
      callCalendar();
    } else if (e.value === 'default') {
      setEventCalendar('default')
    }
  };

  const [eventDuration, setEventDuration] = useState()

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

  const [eventDate, setEventDate] = useState();  
  const [eventAvailable, setEventAvailable] = useState(7);
    
  const closeCreating = () => {
    setOpenStatus(false)
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
    const duration = eventDuration; // Use the selected duration from state

    const startTime = moment(start, 'HH:mm');
    const endTime = moment(end, 'HH:mm');

    // Check if the duration between start and end times is greater than or equal to the selected duration
    const diffInMinutes = endTime.diff(startTime, 'minutes');
    if (diffInMinutes >= duration) {
      if (startTime.isBefore(endTime)) {
        const selectedDayIndex = schedule.findIndex((scheduleDay) => scheduleDay.day === day);

        // Check for overlaps with existing time ranges
        let overlaps = false;
        if (selectedDayIndex !== -1) {
          const existingTimes = schedule[selectedDayIndex].schedule_times;
          for (const timeRange of existingTimes) {
            const existingStartTime = moment(timeRange.start, 'HH:mm');
            const existingEndTime = moment(timeRange.end, 'HH:mm');

            // Check for overlaps
            if (
              (startTime.isSameOrAfter(existingStartTime) && startTime.isBefore(existingEndTime)) ||
              (endTime.isAfter(existingStartTime) && endTime.isSameOrBefore(existingEndTime))
            ) {
              overlaps = true;
              break;
            }
          }
        }

        if (!overlaps) {
          // No overlaps, add the new time range to the schedule
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
        } else {
          toast.error('Time range overlaps with existing time!', {position: toast.POSITION.BOTTOM_CENTER})
          return;
        }
      }
    } else {
      toast.error('Selected duration is too short!', {position: toast.POSITION.BOTTOM_CENTER})
      return;
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
  const [savedQuestions, setSavedQuestions] = useState([]);
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
  
  // create event
  const [eventName, setEventName] = useState();
  const [eventDescription, setEventDescription] = useState();
  const [locationAddress, setLocationAddress] = useState();
  const [uniqueLink, setUniqueLink] = useState();

  const createEvent = async (event) => {
    event.preventDefault();

    if(!eventName || !eventDescription || !eventDate || !eventAvailable || !eventDuration || !uniqueLink){
      toast.error('Required inputs cant be empty!', {position: toast.POSITION.BOTTOM_CENTER})
      return;
    }

    if(eventLocation === 'live' && !locationAddress) {
      toast.error('Location address is missing!', {position: toast.POSITION.BOTTOM_CENTER})
      return;
    }

    const formattedSchedule = schedule.map((day) => ({
      ...day,
      schedule_times: day.schedule_times.map((time) => ({
        start: moment(time.start, 'HH:mm').format('hh:mm A'),
        end: moment(time.end, 'HH:mm').format('hh:mm A')
      }))
    }));

    const eventObj = {
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
        `http://localhost:5000/server/api/eventcreate`,
        { event: eventObj },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + user.token,
          },
        }
      );

      if(response.data.message === 'global_success') {
        props.onUpdate()
        handleClose()
      }

      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      toast.error(err, {position: toast.POSITION.BOTTOM_CENTER})
    }
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

  const minDate = new Date();

  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    props.onClose();
  }
  const handleShow = () => setShow(true);

  useEffect(() => {
    if(props.modal === true){
      handleShow()
    } else {
      handleClose()
    }
  }, [props.modal]);

  return (
    <>
      {isLoading && <LoadingSpinner asOverlay />}

      {auth.windowWidth < 650 && (
        <>
        <Modal show={show} onHide={handleClose} className="display-on-mobile-device custom-mobile-modal modal-top-global">
          <Modal.Header closeButton>
            <Modal.Title>New event</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form className="global-form" onSubmit={createEvent}>
                <Form.Group className="mb-3" controlId="modaleventForm.EventName">
                  <Form.Label>Event name</Form.Label>
                  <Form.Control type="text" placeholder="Event name" onChange={(e) => handleEventName(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="modaleventForm.description">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        placeholder="Description"
                        onChange={(e) => setEventDescription(e.target.value)}
                        rows={4}
                      />
                </Form.Group>
                <Form.Group className="mb-3" controlId="modaleventForm.location">
                      <Form.Label>Location</Form.Label>
                      <Select
                        options={locationOptions}
                        onChange={handleLocation}
                        className="global-select"
                        classNamePrefix="custom-select-modal"
                        placeholder="Location"
                        styles={customStyles}
                      />
                </Form.Group>

                {displayAddress && (
                      <>
                        <Form.Group
                          className="mb-3"
                          controlId="modaleventForm.locationaddress"
                        >
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Address"
                            onChange={(e) => setLocationAddress(e.target.value)}
                          />
                        </Form.Group>
                      </>
                )}

                <Form.Group className="mb-3" controlId="modaleventForm.calender">
                      <Form.Label>Calendar</Form.Label>
                      <Select
                        options={calendarOptions}
                        onChange={(e) => handleCalender(e)}
                        className="global-select"
                        classNamePrefix="custom-select-modal"
                        placeholder="Connect Calender"
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

                        <Container className="modal-times-container">
                        {selectedDates.includes(day) && (
                          <>
                            <Row>
                              <Col xs={5}>
                                <Form.Control
                                  id={`start-time` + index}
                                  type="time"
                                  value={timeByDate[day]?.start || ''}
                                  onChange={(e) => handleTimeChange(e, 'start', day)}
                                  className="custom-picker-css"
                                />
                              </Col>
                              <Col xs={5}>
                                <Form.Control
                                  id={`end-time` + index}
                                  type="time"
                                  value={timeByDate[day]?.end || ''}
                                  onChange={(e) => handleTimeChange(e, 'end', day)}
                                  className="custom-picker-css"
                                />
                              </Col>
                              <Col xs={2}>
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
                                      <Col xs={5}>{moment(time.start, 'HH:mm').format('hh:mm A')}</Col>
                                      <Col xs={5}>{moment(time.end, 'HH:mm').format('hh:mm A')}</Col>
                                      <Col xs={2}>
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
                        </Container>

                      </div>
                    );
                  })}

                </div>

                <Form.Group className="mb-3 datepicker-custom" controlId="modaleventForm.date">
                    <Form.Label>Date</Form.Label>
                    <DatePicker
                      onChange={(date) => {
                        setEventDate(date); 
                      }}
                      selected={eventDate}
                      minDate={minDate}
                      showDisabledMonthNavigation
                      placeholderText="Select date"
                      className="form-control custom-datepicker"
                    />
                </Form.Group>

                <Form.Group
                      className="mb-3"
                      controlId="modaleventForm.eventDuration"
                    >
                      <Form.Label>Event Duration</Form.Label>

                      <Form.Control
                        type="text"
                        placeholder="Event duration"
                        defaultValue={eventAvailable}
                        onChange={(e) => setEventAvailable(e.target.value)}
                      />
                </Form.Group>

              <Form.Group className="mb-3" controlId="modaleventForm.duration">
                      <Form.Label>Event Time Duration</Form.Label>

                      <Select
                        options={durationOptions}
                        onChange={(e) => handleDuration(e)}
                        className="global-select"
                        classNamePrefix="custom-select-modal"
                        placeholder="Event time duration"
                        styles={customStyles}
                      />
              </Form.Group>

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
                          <Form.Group className="mb-3" controlId="modaleventForm.questiontype">
                            <Select
                              options={questiontypeOptions}
                              onChange={handleQuestiontypeChange}
                              className="global-select"
                              classNamePrefix="custom-select-modal"
                              placeholder="Select"
                              value={questiontypeOptions.find((option) => option.value === questiontype)}
                              styles={customStyles}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3" controlId="modaleventForm.questiondescription">
                            <Form.Control
                              type="text"
                              placeholder="Field Description"
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
                            <Col xs={6}>
                            <Form.Check
                              type="checkbox"
                              id="default-checkbox"
                              checked={required}
                              onChange={(e) => setRequired(e.target.checked)}
                              label="Required"
                            />                          
                            </Col>
                            <Col xs={6}>
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
                                  <Col xs={9}>
                                    <div className="saved-question-description">{question.field_description}</div>
                                  </Col>
                                  <Col xs={3}>
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
                    
                    <div className='modal-submit-btn'>
                        <Button variant='dark' size='lg' className='w-100' type='submit'>
                        Create event
                        </Button>
                    </div>

                    </Form>
          </Modal.Body>
        </Modal>

        </>
      )}

      {openStatus === true && (
        <>
          <div className="section-title hide-mobile">
            <Button
              variant="light"
              className="general-light-btn float-end mt-2"
              onClick={() => closeCreating()}
            >
              Close
            </Button>

            <h1>New Event</h1>

            <Form className="global-form" onSubmit={createEvent}>
              <Row className="form-row g-0">
                <Col sm={3}>
                  <Form.Group className="mb-3" controlId="eventForm.name">
                    <Form.Control
                      type="text"
                      placeholder="Event Name"
                      className="global-formcontrol"
                      onChange={(e) => handleEventName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="eventForm.location">
                    <Select
                      options={locationOptions}
                      onChange={handleLocation}
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
                          onChange={(e) => setLocationAddress(e.target.value)}
                        />
                      </Form.Group>
                    </>
                  )}

                  <Form.Group className="mb-3" controlId="eventForm.description">
                    <Form.Control
                      as="textarea"
                      placeholder="Description"
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={4}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="eventForm.calender">
                    <Select
                      options={calendarOptions}
                      onChange={(e) => handleCalender(e)}
                      className="global-select"
                      classNamePrefix="custom-select"
                      placeholder="Connect Calender"
                      styles={customStyles}
                    />
                  </Form.Group>
                </Col>
                <Col sm={3} className="col-pd">
                  <Form.Group className="mb-3 datepicker-custom" controlId="eventForm.date">
                  <DatePicker
                    onChange={(date) => {
                      setEventDate(date); 
                    }}
                    selected={eventDate}
                    minDate={minDate}
                    showDisabledMonthNavigation
                    placeholderText="Date"
                    className="form-control custom-datepicker"
                  />
                  </Form.Group>

                  <Form.Group
                    className="mb-3"
                    controlId="eventForm.eventDuration"
                  >
                    <Form.Control
                      type="text"
                      placeholder="Event duration"
                      className="global-formcontrol"
                      defaultValue={eventAvailable}
                      onChange={(e) => setEventAvailable(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="eventForm.duration">
                    <Select
                      options={durationOptions}
                      onChange={(e) => handleDuration(e)}
                      className="global-select"
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
                <Col sm={3} className="col-pd">
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
                <Col sm={3}>
                  <Form.Group className="mb-3" controlId="eventForm.unique-link">
                    <Form.Control
                      type="text"
                      placeholder="/unique-link"
                      className="global-formcontrol"
                      onChange={(e) => setUniqueLink(e.target.value)}
                      defaultValue={uniqueLink}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="light"
                className="general-light-btn"
                type="submit"
                >
                  Add Event
              </Button>
            </Form>
          </div>
        </>
      )}
    </>
  );
};

export default NewEvent;
