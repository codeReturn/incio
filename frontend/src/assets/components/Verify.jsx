import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { Container, Form, Button } from 'react-bootstrap';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoadingSpinner from '../UI/LoadingSpinner';

import axios from 'axios';

import Select from 'react-select'

const Verify = () => {
    const user = JSON.parse(localStorage.getItem('userData'))
    
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [phone, setPhone] = useState()

    const handleOtp = async (event) => {
        event.preventDefault()

        try {
            setIsLoading(true)

            const response = await axios.post(
                `https://inciohost.com/server/api/users/sendotp`,
                JSON.stringify({
                    phone: phone
                }),
                {
                    headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token
                    }
                })

                if(response.data.success === true){
                    toast.success('OTP code sended!', {position: toast.POSITION.BOTTOM_CENTER})
                    setStep(step + 1)
                }

                setIsLoading(false)
        } catch (err) {
            setIsLoading(false)
            toast.error(err?.response?.data?.message, {position: toast.POSITION.BOTTOM_CENTER})
        }
    }

    const [code, setCode] = useState();
    const verifyOtp = async (event) => {
        event.preventDefault()

        try {
            setIsLoading(true)

            const response = await axios.post(
                `https://inciohost.com/server/api/users/verifyotp`,
                JSON.stringify({
                    code: code
                }),
                {
                    headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token
                    }
                })

                if(response.data.status === true){
                    toast.success('Profile verified!', {position: toast.POSITION.BOTTOM_CENTER})
                    setStep(step + 1)
                }
                
                setIsLoading(false)
        } catch (err) {
            setIsLoading(false)
            toast.error(err?.response?.data?.message, {position: toast.POSITION.BOTTOM_CENTER})
        }
    }

    const [name, setName] = useState();
    const [company, setCompany] = useState();
    const [members, setMembers] = useState();

    const [searchParams, setSearchParams] = useSearchParams();
    const opensocials = searchParams.get("opensocials")

    const submitAbout = async (event) => {
        event.preventDefault()

        try {
            setIsLoading(true)

            const response = await axios.post(
                `https://inciohost.com/server/api/users/updateabout`,
                JSON.stringify({
                    name: name,
                    company: company,
                    members: members
                }),
                {
                    headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token
                    }
                })

                if(response.data.message === 'global_success'){
                    if(opensocials === "on"){
                        window.location.href = '/account?opensocials=on'
                    } else {
                        window.location.href = '/'
                    }
                }
                
        } catch (err) {
            setIsLoading(false)
            toast.error(err?.response?.data?.message, {position: toast.POSITION.BOTTOM_CENTER})
        }
    }

    const membersOptions = [
        { value: '1-9', label: '1-9' },
        { value: '10-99', label: '1-99' },
        { value: '100-999', label: '100-999' },
        { value: '+1000', label: '+1000' },
    ]

    const handleMembers = (e) => {
        setMembers(e.value)
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

    return (
        <>
        {isLoading && <LoadingSpinner asOverlay />}

        <Container fluid>
            <div className="user-panel">
                {!isLoading && step === 0 && (
                    <>
                    <h1>OTP</h1>

                    <div className="user-panel-form">
                        <Form onSubmit={handleOtp}>
                            <Form.Group className="mb-3" controlId="verify.number">
                                <Form.Control type="text" placeholder="Phone number" onChange={(e) => setPhone(e.target.value)} />
                            </Form.Group>

                            <div className="user-panel-buttons">
                            <Button variant="light" type="submit" className="float-end" size="sm">Send SMS</Button>
                            </div>
                        </Form>
                    </div>
                    </>
                )}
                
                {!isLoading && step === 1 && (
                    <>
                    <h1>VERIFY OTP</h1>

                    <div className="user-panel-form">
                        <Form onSubmit={verifyOtp}>
                            <Form.Group className="mb-3" controlId="verify.code">
                                <Form.Control type="text" maxLength="6" placeholder="OTP code" onChange={(e) => setCode(e.target.value)} />
                            </Form.Group>

                            <div className="user-panel-buttons">
                            <Button variant="light" type="submit" className="float-end" size="sm">Verify OTP</Button>
                            </div>
                        </Form>
                    </div>
                    </>
                )}

                {!isLoading && step === 2 && (
                    <>
                    <h1>About You</h1>

                    <div className="user-panel-form">
                        <Form onSubmit={submitAbout}>
                            <Form.Group className="mb-3" controlId="verify.name">
                                <Form.Control type="text" placeholder="Your name" onChange={(e) => setName(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="verify.company">
                                <Form.Control type="text" placeholder="Company name" onChange={(e) => setCompany(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="eventForm.calender">
                                    <Select
                                        options={membersOptions}
                                        onChange={(e) => handleMembers(e)}
                                        className="global-select"
                                        classNamePrefix="custom-select"
                                        placeholder="How many members?"
                                        styles={customStyles}
                                    />
                            </Form.Group>

                            <div className="user-panel-buttons">
                                <Button variant="light" type="submit" className="float-end" size="sm">Done</Button>
                            </div>
                        </Form>
                    </div>
                    </>
                )}
            </div>
        </Container>
        </>
    )
}

export default Verify;