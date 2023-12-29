import React, { useState, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

import { Container, Form, Button } from 'react-bootstrap';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useHttpClient } from '../shared/http-hook';
import LoadingSpinner from '../UI/LoadingSpinner';

import { AuthContext } from '../context/auth-context';

import googleIcon from '../images/socials/google.png'
import linkedinIcon from '../images/socials/linkedin.png'

import eyeOffIcon from '../images/eye-off-fill.svg';
import eyeIcon from '../images/eye-fill.svg';

const Login = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const { isLoading, error, sendRequest } = useHttpClient();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [rememberMe, setRememberMe] = useState();

    const [searchParams, setSearchParams] = useSearchParams();
    const redirect = searchParams.get("redirect")

    const handleLogin = async (event) => {
        event.preventDefault()

        try {
            const responseData = await sendRequest(
              'https://inciohost.com/server/api/users/login',
              'POST',
              JSON.stringify({
                email: email,
                password: password,
                rememberme: rememberMe,
                redirect: redirect
              }),
              {
                'Content-Type': 'application/json'
              }
            );

            auth.login(responseData.userId, responseData.token, responseData.rememberme);
            toast.success('Succesfull!', {position: toast.POSITION.BOTTOM_CENTER})

            if (responseData.redirect) {
                navigate(responseData.redirect)
            } else {
                navigate('/')
            }
            
          } catch (err) {
            toast.error(error, {position: toast.POSITION.BOTTOM_CENTER})
          }   
    }

    const handleGoogleLogin = () => {
        window.location.href = 'https://inciohost.com/server/api/users/google';
    };
      
    const handleLinkedInLogin = () => {
        window.location.href = 'https://inciohost.com/server/api/users/linkedin';
    };

    const [viewPassword, setViewPassword] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
  

    return (
        <>
        {isLoading && <LoadingSpinner asOverlay />}

        <Container fluid>
            <div className="user-panel">
                <h1>Log In</h1>

                <div className="user-panel-form">
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="bottom-10px" controlId="loginForm.email">
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



                        <Form.Group className="bottom-10px font-14px" controlId="formBasicCheckbox">
                            <Form.Check type="checkbox" id="default-checkbox" label="Remember me" onChange={(e) => setRememberMe(e.target.value)} />
                        </Form.Group>

                        <div className="user-panel-buttons">
                        <Button variant="light" type="submit" className="w-100" size="sm">Log In</Button>
                        </div>
                    </Form>
                    
                    <div className="or">or</div>

                    <div className="social-buttons">
                        <Button variant='light' className="w-100" onClick={handleGoogleLogin}> <img src={googleIcon} className="img-fluid social-ico-height" /> &nbsp; Log In with Google</Button>
                        {/* <Button variant='light' className="w-100"> <i className="fa-brands fa-apple"></i> &nbsp; Log In with Apple</Button> */}
                        <Button variant='light' className="w-100" onClick={handleLinkedInLogin}> <img src={linkedinIcon} className="img-fluid social-ico-height" /> &nbsp; Log In with LinkedIn</Button>
                    </div>

                    <div className="user-panel-otherlink">
                        <p>Don’t have an Account? <Link to="/register">Sign Up for FREE.</Link></p>
                    </div>
                </div>
            </div>
        </Container>
        </>
    )
}

export default Login;