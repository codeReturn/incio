import React, { useState, useEffect } from 'react';
import { Routes, Navigate, Route, Link, useLocation } from 'react-router-dom';

import Navigation from "./assets/UI/Navigation"

import Home from './assets/pages/Home';
import Login from './assets/pages/Login';
import Register from './assets/pages/Register';
import SocialLogin from './assets/pages/SocialLogin';
import Dashboard from './assets/pages/Dashboard';
import Meeting from './assets/pages/Meeting';
import Events from './assets/pages/Events';
import Meetings from './assets/pages/Meetings';
import Contracts from './assets/pages/Contracts';
import Clients from './assets/pages/Clients';
import Money from './assets/pages/Money';
import Contract from './assets/pages/Contract';
import Invoice from './assets/pages/Invoice';
import Account from './assets/pages/Account';
import Terms from './assets/pages/Terms';
import Privacy from './assets/pages/Privacy';
import Documentation from './assets/pages/Documentation';
import Support from './assets/pages/Support';

import { useAuth } from './assets/shared/auth-hook';
import { AuthContext } from './assets/context/auth-context';

import axios from 'axios';

import Verify from './assets/components/Verify';
import GeneralMeetings from './assets/pages/GeneralMeetings';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import moment from 'moment-timezone';

const App = () => {
  const { token, login, logout, userId, windowWidth } = useAuth();

  let routes
  
  if(token) {
    routes = (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/generalmeetings" element={<GeneralMeetings />} />
        <Route path="/meeting/:link" element={<Meeting />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/contract/:id" element={<Contract />} />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/money" element={<Money />} />
        <Route path="/account" element={<Account />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/support" element={<Support />} />
        <Route
            path="*"
            element={<Navigate to="/" replace />}
        />
      </Routes>
    )
  } else {
    routes = (
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/loginsocial" element={<SocialLogin />} />
      <Route path="/meeting/:link" element={<Meeting />} />
      <Route path="/contract/:id" element={<Contract />} />
      <Route path="/invoice/:id" element={<Invoice />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/support" element={<Support />} />
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
      </Routes>
    )
  }

  const [user, setUser] = useState()
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [hasStripe, setHasStripe] = useState(false)

  const fetchUser = async () => {
      try {
          const response = await axios.get(`http://localhost:5000/server/api/users/getuserinfo`, 
          {
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + token
              }
          })
          

          const storedTimezone = localStorage.getItem('timezone');
          if (response.data.user.timezone) {
            setSelectedTimezone(response.data.user.timezone);
            moment.tz.setDefault(response.data.user.timezone);
          } else {
            setSelectedTimezone(storedTimezone);
            moment.tz.setDefault(storedTimezone);
          }
  
          setUser(response?.data?.user)
          const find = response?.data?.user?.socials.find((social) => social.platform === 'stripe')
          if(find) setHasStripe(true)
      } catch (err) {
          console.log(err)
      } 
  }

  useEffect(() => {
    token && fetchUser()
  }, [token]);

  const location = useLocation();
  const [path, setPath] = useState()

  useEffect(() => {
    setPath(location.pathname);
  }, [location]);

  return (
    <>
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
        windowWidth: windowWidth
      }}
    >
      <ToastContainer />

      {!token && path === '/' ? ( 
          <>
            <Navigation />

            <div className="home-bg">
              {routes}
            </div> 
          </>
        ) : (
          <>              
              {token && !hasStripe && (
                <>
                <div className="custom-dashboard-notf">
                    <Link to={`/account?opensocials=on`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M6.99967 13.6663C3.31777 13.6663 0.333008 10.6815 0.333008 6.99967C0.333008 3.31777 3.31777 0.333008 6.99967 0.333008C10.6815 0.333008 13.6663 3.31777 13.6663 6.99967C13.6663 10.6815 10.6815 13.6663 6.99967 13.6663ZM6.33301 8.99967V10.333H7.66634V8.99967H6.33301ZM6.33301 3.66634V7.66634H7.66634V3.66634H6.33301Z" fill="#F8F8F8"/>
                    </svg>

                    <span>In order to see real data start using this app and connect stripe.</span>

                    <b>
                        Connect Stripe

                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.18789 4.55615L6.06289 1.43115C5.95039 1.3124 5.79414 1.24365 5.61914 1.24365C5.27539 1.24365 4.99414 1.5249 4.99414 1.86865C4.99414 2.04365 5.06289 2.1999 5.17539 2.3124L7.23164 4.36865H1.24414C0.900391 4.36865 0.619141 4.6499 0.619141 4.99365C0.619141 5.3374 0.900391 5.61865 1.24414 5.61865H7.23789L5.18164 7.6749C5.06914 7.7874 5.00039 7.94365 5.00039 8.11865C5.00039 8.4624 5.28164 8.74365 5.62539 8.74365C5.80039 8.74365 5.95664 8.6749 6.06914 8.5624L9.19414 5.4374C9.30664 5.3249 9.37539 5.16865 9.37539 4.99365C9.37539 4.81865 9.30039 4.66865 9.18789 4.55615Z" fill="#F8F8F8"/>
                        </svg>

                    </b>
                    </Link>
                </div>
              </>
            )}

            <Navigation />
            
            <main className="main-content">
              {user && user.verified === false ? ( 
                <Verify />  
              ) : (
                <> 
                  <div className="main-routes">{routes}</div> 

                  {token && (
                    <>
                    <div className="mobile-nav">
                      <ul>
                        <Link to={`/`}>
                          <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
                              {path === '/' ? ( 
                                <>
                                <rect width="44" height="44" rx="4" fill="#F6EDFB"/>                              
                                <path d="M32.1818 31.7785C32.1818 32.4531 31.612 33 30.9091 33H13.0909C12.388 33 11.8182 32.4531 11.8182 31.7785V20.7853H8L21.1438 9.31765C21.6293 8.89412 22.3707 8.89412 22.8562 9.31765L36 20.7853H32.1818V31.7785Z" fill="#BF5AF2"/>
                                </>
                              ) : (
                                <>
                                <path d="M32.1818 31.7785C32.1818 32.4531 31.612 33 30.9091 33H13.0909C12.388 33 11.8182 32.4531 11.8182 31.7785V20.7853H8L21.1438 9.31765C21.6293 8.89412 22.3707 8.89412 22.8562 9.31765L36 20.7853H32.1818V31.7785Z" fill="black"/>                              
                                </>
                              )}
                            </svg>
                          </li>
                        </Link>
                        <Link to={`/generalmeetings`}>
                          <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <g clipPath="url(#clip0_117_406)">
                            <path d="M21.04 2.42482H19.29V1.53699C19.29 0.677804 18.58 0 17.68 0C16.78 0 16.07 0.677804 16.07 1.53699V2.42482H7.91V1.53699C7.91 0.677804 7.2 0 6.3 0C5.4 0 4.69 0.677804 4.69 1.53699V2.42482H2.94C1.32 2.42482 0 3.68496 0 5.2315V6.67303H24V5.2315C23.97 3.66587 22.68 2.42482 21.04 2.42482Z" fill={`${path === "/generalmeetings" ? '#BF5AF2' : 'black'}`} />
                            <path d="M0 21.1933C0 22.7303 1.32 24 2.94 24H21.06C22.67 24 24 22.7399 24 21.1933V8.43915H0V21.1933ZM15.74 13.2124C15.74 12.9356 15.98 12.7351 16.24 12.7351H18.65C18.94 12.7351 19.15 12.9642 19.15 13.2124V14.7303C19.15 15.0072 18.91 15.2076 18.65 15.2076H16.24C15.95 15.2076 15.74 14.9785 15.74 14.7303V13.2124ZM15.74 17.7088C15.74 17.432 15.98 17.2315 16.24 17.2315H18.65C18.94 17.2315 19.15 17.4606 19.15 17.7088V19.2267C19.15 19.5036 18.91 19.7041 18.65 19.7041H16.24C15.95 19.7041 15.74 19.4749 15.74 19.2267V17.7088ZM10.26 13.2124C10.26 12.9356 10.5 12.7351 10.76 12.7351H13.17C13.46 12.7351 13.67 12.9642 13.67 13.2124V14.7303C13.67 15.0072 13.43 15.2076 13.17 15.2076H10.76C10.47 15.2076 10.26 14.9785 10.26 14.7303V13.2124ZM10.26 17.7088C10.26 17.432 10.5 17.2315 10.76 17.2315H13.17C13.46 17.2315 13.67 17.4606 13.67 17.7088V19.2267C13.67 19.5036 13.43 19.7041 13.17 19.7041H10.76C10.47 19.7041 10.26 19.4749 10.26 19.2267V17.7088ZM4.81 13.2124C4.81 12.9356 5.05 12.7351 5.31 12.7351H7.72C8.01 12.7351 8.22 12.9642 8.22 13.2124V14.7303C8.22 15.0072 7.98 15.2076 7.72 15.2076H5.31C5.02 15.2076 4.81 14.9785 4.81 14.7303V13.2124ZM4.81 17.7088C4.81 17.432 5.05 17.2315 5.31 17.2315H7.72C8.01 17.2315 8.22 17.4606 8.22 17.7088V19.2267C8.22 19.5036 7.98 19.7041 7.72 19.7041H5.31C5.02 19.7041 4.81 19.4749 4.81 19.2267V17.7088Z" fill={`${path === "/generalmeetings" ? '#BF5AF2' : 'black'}`}/>
                            </g>
                            <defs>
                            <clipPath id="clip0_117_406">
                            <rect width="24" height="24" fill="white"/>
                            </clipPath>
                            </defs>
                            </svg>
                          </li>
                        </Link>
                        <Link to={`/money`}>
                          <li>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <g clipPath="url(#clip0_117_410)">
                          <path d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM12.95 18.44V20.59H10.89V18.59C9.48 18.53 8.11 18.15 7.31 17.68L7.94 15.22C8.82 15.7 10.07 16.15 11.44 16.15C12.64 16.15 13.46 15.69 13.46 14.84C13.46 13.99 12.79 13.53 11.23 13.01C8.98 12.25 7.44 11.2 7.44 9.16C7.44 7.31 8.75 5.85 11 5.41V3.41H13.06V5.26C14.47 5.32 15.42 5.62 16.11 5.96L15.5 8.34C14.95 8.11 13.98 7.62 12.47 7.62C11.1 7.62 10.66 8.21 10.66 8.8C10.66 9.5 11.4 9.94 13.19 10.61C15.7 11.49 16.71 12.65 16.71 14.55C16.71 16.45 15.38 18.02 12.96 18.45L12.95 18.44Z" fill={`${path === "/money" ? '#BF5AF2' : 'black'}`} />
                          </g>
                          <defs>
                          <clipPath id="clip0_117_410">
                          <rect width="24" height="24" fill="white"/>
                          </clipPath>
                          </defs>
                          </svg>
                          </li>
                        </Link>
                        <Link to={`/contracts`}>
                          <li>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <g clipPath="url(#clip0_117_413)">
                          <path fillRule="evenodd" clipRule="evenodd" d="M1.45 0H19.35C20.15 0 20.8 0.60512 20.8 1.34988V16.5989H16.22C15.99 16.5989 15.81 16.7758 15.81 16.9806V20.6765H1.45C0.65 20.6765 0 20.0714 0 19.3266V1.34988C0 0.61443 0.66 0 1.45 0ZM21.63 3.3142V17.3344L16.54 21.4492H3.2V22.6315C3.2 23.3763 3.86 23.9814 4.66 23.9814H19.01V20.2855C19.01 20.0714 19.2 19.9038 19.42 19.9038H24V4.67339C24 3.92863 23.35 3.32351 22.55 3.32351H21.64L21.63 3.3142ZM23.52 20.6858L19.84 23.6649V20.6858H23.52ZM4.63 15.3421H16.17C16.4 15.3421 16.59 15.1652 16.59 14.9604C16.59 14.7556 16.4 14.5787 16.17 14.5787H4.63C4.4 14.5787 4.21 14.7556 4.21 14.9604C4.21 15.1652 4.4 15.3421 4.63 15.3421ZM4.63 11.8697H16.17C16.4 11.8697 16.59 11.6928 16.59 11.488C16.59 11.2832 16.4 11.1063 16.17 11.1063H4.63C4.4 11.1063 4.21 11.2832 4.21 11.488C4.21 11.6928 4.4 11.8697 4.63 11.8697ZM4.63 8.39721H16.17C16.4 8.39721 16.59 8.22032 16.59 8.01551C16.59 7.8107 16.4 7.63382 16.17 7.63382H4.63C4.4 7.63382 4.21 7.8107 4.21 8.01551C4.21 8.22032 4.4 8.39721 4.63 8.39721ZM4.63 4.92475H16.17C16.4 4.92475 16.59 4.74787 16.59 4.54306C16.59 4.33825 16.4 4.16136 16.17 4.16136H4.63C4.4 4.16136 4.21 4.33825 4.21 4.54306C4.21 4.74787 4.4 4.92475 4.63 4.92475ZM20.32 17.353H16.64V20.332L20.32 17.353Z" fill={`${path === "/contracts" ? '#BF5AF2' : 'black'}`} />
                          </g>
                          <defs>
                          <clipPath id="clip0_117_413">
                          <rect width="24" height="24" fill="white"/>
                          </clipPath>
                          </defs>
                          </svg>
                          </li>
                        </Link>
                        <Link to={`/clients`}>
                          <li>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <g clipPath="url(#clip0_117_416)">
                          <path d="M11.9902 11.5318C15.3482 11.5318 18.0809 8.94268 18.0809 5.76115C18.0809 2.57962 15.3482 0 11.9902 0C8.63219 0 5.89941 2.57962 5.89941 5.76115C5.89941 8.94268 8.63219 11.5318 11.9902 11.5318Z" fill={`${path === "/clients" ? '#BF5AF2' : 'black'}`} />
                          <path d="M12.6555 13.7097H11.3445C5.25378 13.7097 0.252101 18.2861 0 23.9995H24C23.7378 18.2861 18.7462 13.7097 12.6555 13.7097Z" fill={`${path === "/clients" ? '#BF5AF2' : 'black'}`} />
                          </g>
                          <defs>
                          <clipPath id="clip0_117_416">
                          <rect width="24" height="24" fill="white"/>
                          </clipPath>
                          </defs>
                          </svg>
                          </li>
                        </Link>
                      </ul>
                    </div> 
                    </>
                  )}
                </>
              )}
            </main>
          </>
        )}


    </AuthContext.Provider>
    </>
  )
}

export default App
