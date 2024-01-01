import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import LoadingSpinner from '../UI/LoadingSpinner';
import Select from 'react-select';

const Meeting = () => {
  const link = useParams().link;
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const user = JSON.parse(localStorage.getItem('userData'))

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/server/api/getevent/${link}`);
      setEvent(response.data.event);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      if (err.response && err.response.data.message === 'Event does not exist!') {
        window.location.href = '/';
      }
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [link]);

  const handleQuestionInputChange = (event, questionIndex) => {
    const { name, value, type, checked } = event.target;

    let answer;
    if (type === 'checkbox') {
      if (checked) {
        answer = value;
      } else {
        answer = '';
      }
    } else {
      answer = value;
    }

    setFormData((prevData) => {
      const updatedQuestion = {
        field_description: event.target.name,
        answer: answer,
      };
      const updatedFormData = { ...prevData };
      updatedFormData[questionIndex] = updatedQuestion;
      return updatedFormData;
    });
  };

  const renderFormElement = (question, questionIndex) => {
    const { type, field_description, required, questions } = question;

    switch (type) {
      case 'text':
        return (
          <Form.Group key={questionIndex}>
            <Form.Label>{field_description}</Form.Label>
            <Form.Control
              type="text"
              name={field_description}
              onChange={(event) => handleQuestionInputChange(event, questionIndex)}
              required={required}
            />
          </Form.Group>
        );
      case 'radio':
        return (
          <Form.Group key={questionIndex}>
            <Form.Label>{field_description}</Form.Label>
            <div>
              {questions.map((option, optionIndex) => (
                <Form.Check
                  key={optionIndex}
                  type="radio"
                  label={option.description}
                  name={field_description}
                  value={option.description}
                  onChange={(event) => handleQuestionInputChange(event, questionIndex)}
                  required={required}
                />
              ))}
            </div>
          </Form.Group>
        );
      case 'checkbox':
        return (
          <Form.Group key={questionIndex}>
            <Form.Label>{field_description}</Form.Label>
            <div>
              {questions.map((option, optionIndex) => (
                <Form.Check
                  key={optionIndex}
                  type="checkbox"
                  label={option.description}
                  name={field_description}
                  value={option.description}
                  onChange={(event) => handleQuestionInputChange(event, questionIndex)}
                />
              ))}
            </div>
          </Form.Group>
        );
      case 'dropdown':
        return (
          <Form.Group key={questionIndex}>
            <Form.Label>{field_description}</Form.Label>
            <Form.Control
              as="select"
              name={field_description}
              onChange={(event) => handleQuestionInputChange(event, questionIndex)}
              required={required}
            >
              <option value="">Select an option</option>
              {questions.map((option, optionIndex) => (
                <option key={optionIndex} value={option.description}>
                  {option.description}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        );
      case 'phone':
        return (
          <Form.Group key={questionIndex}>
            <Form.Label>{field_description}</Form.Label>
            <Form.Control
              type="tel"
              name={field_description}
              onChange={(event) => handleQuestionInputChange(event, questionIndex)}
              required={required}
            />
          </Form.Group>
        );
      default:
        return null;
    }
  };

  // quests
  const [showAddQuests, setShowAddQuests] = useState(false);
  const [questEmail, setQuestEmail] = useState('');
  const [quests, setQuests] = useState([]);  

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  
  const handleAddQuests = () => {
    if (!questEmail) {
      toast.error('Please enter a valid email address.', {position: toast.POSITION.BOTTOM_CENTER})
      return;
    }
  
    if (!isValidEmail(questEmail)) {
      toast.error('Please enter a valid email address.', {position: toast.POSITION.BOTTOM_CENTER})
      return;
    }
  
    if (quests.includes(questEmail)) {
      toast.error('This email address is already added.', {position: toast.POSITION.BOTTOM_CENTER})
      return;
    }
  
    setQuests([...quests, questEmail]);
    setQuestEmail('');
  };
  
  const handleRemoveQuest = (email) => {
    const updatedQuests = quests.filter((quest) => quest !== email);
    setQuests(updatedQuests);
  };
  
  // dates
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [googleTimes, setGoogleTimes] = useState([]);
  
  const handleDateChange = (date) => {
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
  
    const formattedDate = inputDate.toISOString().split('T')[0];
    console.log(formattedDate);
  
    setSelectedDate(inputDate);
    setSelectedTime(null); // Reset selected time when date changes
  };

  const handleTimeChange = (selectedOption) => {
    console.log(selectedOption)
    const selectedTime = selectedOption ? selectedOption.value.value : null;
    setSelectedTime(selectedTime);
  };

  const getAvailableTimes = () => {
    let availableTimes = [];
  
    if (event.eventcalendar === 'google') {
      availableTimes = googleTimes.map((time) => ({
        value: time, // Store the entire time object
        label: `${time.start} - ${time.end}`,
      }));
    } else {
      const day = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
      const selectedDay = event?.scheduletimes?.find((schedule) => schedule.day === day);
  
      if (selectedDay) {
        availableTimes = selectedDay.schedule_times.map((time) => ({
          value: time, // Store the entire time object
          label: `${time.start} - ${time.end}`,
        }));
      }
    }
  
    return availableTimes;
  };
  
  const renderAvailableTimes = () => {
    const availableTimes = getAvailableTimes();
  
    console.log(availableTimes)

    return availableTimes.map((time, index) => ({
      value: time, // Use the entire time object as the value
      label: time.label
    }));
  };
  
  const fetchGoogleFreeTimes = async () => {
    const adjustedDate = new Date(selectedDate);
    adjustedDate.setDate(adjustedDate.getDate() + 1);
  
    try {
      const response = await fetch('http://localhost:5000/server/api/connect/calendar/freedays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: adjustedDate.toISOString().slice(0, 10),
          author: event?.author,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch Google free times.');
      }
  
      const data = await response.json();
      setGoogleTimes(data);
    } catch (error) {
      console.error('Error retrieving Google free times:', error);
    }
  };
  
  useEffect(() => {
    if (event && event.eventcalendar === 'google' && selectedDate) {
      fetchGoogleFreeTimes();
    }
  }, [event, selectedDate]);

  const getMaxDate = () => {
    const start = new Date(event.eventdate);
    const futureDate = new Date(
      start.getTime() + event.eventavailable * 24 * 60 * 60 * 1000
    );
    return futureDate;
  };

  const [meetingName, setMeetingName] = useState();
  const [meetingEmail, setMeetingEmail] = useState();
  const [meetingMessage, setMeetingMessage] = useState();

  const [showConfirmation, setShowConfirmation] = useState()
  const [confirmationEvent, setConfirmationEvent] = useState()

  const handleMeetingConfirm = async (e) => {
    e.preventDefault();
  
    if (!meetingName || !meetingEmail || !meetingMessage) {
      toast.error('General inputs are required (name, email..)', { position: toast.POSITION.BOTTOM_CENTER });
      return;
    }
  
    if (!selectedTime) {
      toast.error('You must select a time for the meeting!', { position: toast.POSITION.BOTTOM_CENTER });
      return;
    }
  
    const meetingObj = {
      name: meetingName,
      email: meetingEmail,
      message: meetingMessage,
      questions: formData,
      quests: quests,
      date: selectedDate,
      selected_time: selectedTime,
      link: link,
      eventauthor: event?.author,
    };
  
    try {
      setIsLoading(true);
  
      const response = await axios.post(
        `http://localhost:5000/server/api/meetingconfirm`,
        { meeting: meetingObj },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + user.token,
          },
        }
      );
  
      if (response.data.message === 'global_success') {
        setShowConfirmation(true);
        setConfirmationEvent(response.data.event);
      }
  
      setIsLoading(false);
    } catch (err) {
      console.log(err);
  
      setIsLoading(false);
      toast.error(err, { position: toast.POSITION.BOTTOM_CENTER });
    }
  };
  
  const currentDate = new Date();
  const eventDate = new Date(event?.eventdate);
  const minDate = eventDate > currentDate ? eventDate : currentDate;
  
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

  return (
    <>
      {isLoading && <LoadingSpinner asOverlay={true} />}

      {!isLoading && event && (
        <Container fluid>
          <Row className="flex-xl-nowrap">
            <Col sm={12} className="p-0">
              <div className="container meeting-body">
                {showConfirmation ? (
                  <>
                  <div className="meeting-confirmation-title">
                    Your meeting for {confirmationEvent?.name} is Confirmed
                  </div>
                  <div className="meeting-confirmation-details">
                  {confirmationEvent?.eventduration} min - {confirmationEvent?.location} 
                  <br /> 
                  {confirmationEvent && new Date(selectedDate).toLocaleDateString()}
                  </div>
                  </>
                ) : (
                  <>
                  <div className="meeting-title">
                    <div className="meeting-time-details">
                      {event.eventduration} min - {event.location}
                    </div>

                    <h1>Meeting for {event.name}</h1>

                    <div className="meeting-form">
                      <Form className="global-form" onSubmit={handleMeetingConfirm}>
                        <Row>
                          <Col sm={9}>
                            <Row className="addscroll">
                                <Col sm={6}>
                                <Form.Group>
                                  <DatePicker
                                    onChange={handleDateChange}
                                    minDate={minDate}
                                    maxDate={getMaxDate()}
                                    selected={selectedDate ? new Date(selectedDate) : null}
                                    showDisabledMonthNavigation
                                    placeholderText="Choose Date"
                                    className="form-control custom-datepicker"
                                  />
                                </Form.Group>
                                {selectedDate && (
                                  <Form.Group className="my-3 available-checkboxes">
                                    <Select
                                      options={renderAvailableTimes()}
                                      value={selectedTime ? { value: selectedTime.start + '-' + selectedTime.end, label: `${selectedTime.start} - ${selectedTime.end}` } : null}
                                      onChange={handleTimeChange}
                                      placeholder="Select Time"
                                      className="global-select"
                                      classNamePrefix="custom-select"                
                                      isClearable
                                      styles={customStyles}
                                    />
                                  </Form.Group>
                                )}
                              </Col>
                              <Col sm={6}>
                                <Form.Group className="mb-3" controlId="meeting.name">
                                  <Form.Control
                                    type="text"
                                    placeholder="Name"
                                    className="global-formcontrol"
                                    onChange={(e) => setMeetingName(e.target.value)}
                                    name="name"
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="meeting.email">
                                  <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    className="global-formcontrol"
                                    onChange={(e) => setMeetingEmail(e.target.value)}
                                    name="email"
                                    required
                                  />
                                </Form.Group>
                              </Col>
                              <Col sm={12}>
                                <Form.Group className="mb-3" controlId="meeting.message">
                                  <Form.Control
                                    as="textarea"
                                    placeholder="Message before the Meeting"
                                    onChange={(e) => setMeetingMessage(e.target.value)}
                                    rows={5}
                                    name="message"
                                  />
                                </Form.Group>
                              </Col>
                              <Col sm={12}>
                                <h2>Questions of the meeting</h2>
                                <div className="questions-preview">
                                  {event.questions && event.questions.length === 0 && (
                                    <>
                                    <p>No results!</p>
                                    </>
                                  )}

                                  {event.questions && event.questions.length > 0 && event.questions.map((question, index) =>
                                    renderFormElement(question, index)
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </Col>
                          <Col sm={3}>
                          <div className="quests">
                          <Button variant="light" size="sm" className="general-light-btn float-end p-2" onClick={() => setShowAddQuests(true)}>
                            <i className="fa-solid fa-plus"></i>
                          </Button>
                          <h3>Add Guests</h3>

                          {showAddQuests && (
                            <>
                              <Form.Group className="mb-3 position-relative" controlId="meeting.quest">
                                <Form.Control
                                  type="text"
                                  placeholder="Email address"
                                  className="global-formcontrol"
                                  name="quest"
                                  value={questEmail}
                                  onChange={(e) => setQuestEmail(e.target.value)}
                                />

                                <Button
                                  variant="light"
                                  size="sm"
                                  className="general-light-btn p-2 addquest-btn"
                                  onClick={() => handleAddQuests()}
                                >
                                  <i className="fa-solid fa-plus"></i>
                                </Button>
                              </Form.Group>
                            </>
                          )}

                          <div className="quests-body">
                            <h4>Emails</h4>

                            {quests.length === 0 ? (
                              <p>No quests added yet.</p>
                            ) : (
                              <>
                              <div className="quest-container">
                                {quests.map((email, index) => (
                                  <div className="quest-list" key={index}>
                                    {email}{' '}
                                    <Button variant='light' size='sm' className='general-light-btn float-end p-2' onClick={() => handleRemoveQuest(email)}>
                                    <i className="fa-solid fa-trash"></i>
                                    </Button>
                                  </div>
                                ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                          </Col>
                        </Row>
                        <Button type="submit" className="general-light-btn float-end">Schedule</Button>
                      </Form>
                    </div>
                  </div>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
};

export default Meeting;
