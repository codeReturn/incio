import React, { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

import { Container, Form, Button } from 'react-bootstrap';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useHttpClient } from '../shared/http-hook';
import LoadingSpinner from '../UI/LoadingSpinner';

import googleIcon from '../images/socials/google.png'
import linkedinIcon from '../images/socials/linkedin.png'

import { AuthContext } from '../context/auth-context';

import eyeOffIcon from '../images/eye-off-fill.svg';
import eyeIcon from '../images/eye-fill.svg';

const Register = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const { isLoading, error, sendRequest } = useHttpClient();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const [searchParams, setSearchParams] = useSearchParams();
    const redirect = searchParams.get("redirect")

    const handleRegister = async (event) => {
        event.preventDefault();

        try {
            const responseData = await sendRequest(
              'http://localhost:5000/server/api/users/signup',
              'POST',
              JSON.stringify({
                email: email,
                password: password,
                redirect: redirect
              }),
              {
                'Content-Type': 'application/json'
              }
            );
            
            auth.login(responseData.userId, responseData.token);
            toast.success('Profile created!', {position: toast.POSITION.BOTTOM_CENTER})

            if (responseData.redirect) {
                navigate(responseData.redirect)
            } else {
                navigate('/')
            }

        } catch (err) {
            toast.error(error, {position: toast.POSITION.BOTTOM_CENTER})
        }   
    }

    const handleGoogleRegister = () => {
        window.location.href = 'http://localhost:5000/server/api/users/google';
    };
      
    const handleLinkedInRegister = () => {
        window.location.href = 'http://localhost:5000/server/api/users/linkedin';
    };

    const [viewPassword, setViewPassword] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);

    return (
        <>
        {isLoading && <LoadingSpinner asOverlay />}

        <Container fluid>
            <div className="user-panel">
                <h1>Sign Up</h1>

                <div className="user-panel-form">
                    <Form onSubmit={handleRegister}>
                        <Form.Group className="mb-3" controlId="registerForm.email">
                            <Form.Control type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        </Form.Group>

                        <Form.Group className={`bottom-10px position-relative form-with-icon ${inputFocused ? 'focused' : ''}`} controlId="loginForm.password">
                        <span className={`input-icon-custom ${inputFocused ? 'filtered' : ''}`} onClick={() => setViewPassword(!viewPassword)}>
                            {viewPassword ? <img src={eyeOffIcon} className="img-fluid view-p-ico" style={{ maxHeight: "24px" }} /> : <img src={eyeIcon} className="img-fluid view-p-ico" style={{ maxHeight: "24px" }} />}
                        </span>
                        <Form.Control
                            type={viewPassword ? 'text' : 'password'}
                            placeholder="Password"
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        </Form.Group>

                        <div className="user-panel-buttons">
                        <Button variant="light" type="submit" className="w-100" size="sm">Sign Up</Button>
                        </div>
                    </Form>
                    
                    <div className="or">or</div>

                    <div className="social-buttons">
                        <Button variant='light' className="w-100" onClick={handleGoogleRegister}> <img src={googleIcon} className="img-fluid social-ico-height" /> &nbsp; Sign Up with Google</Button>
                        {/* <Button variant='light' className="w-100"> <i className="fa-brands fa-apple"></i> &nbsp; Sign Up with Apple</Button> */}
                        <Button variant='light' className="w-100" onClick={handleLinkedInRegister}> <img src={linkedinIcon} className="img-fluid social-ico-height" /> &nbsp; Sign Up with LinkedIn</Button>
                    </div>

                    <div className="user-panel-otherlink">
                        <p>Already have an Account? <Link to="/login">Log In</Link></p>
                    </div>
                </div>
            </div>
        </Container>
        </>
    )
}

export default Register;