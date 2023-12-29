import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Row, Col, Modal, Button, Form } from 'react-bootstrap';

import LoadingSpinner from '../UI/LoadingSpinner';
import axios from 'axios';
import Select from 'react-select';

import ImageUpload from '../UI/ImageUpload';

import { AuthContext } from '../context/auth-context';

const ClientItem = props => {
    const auth = useContext(AuthContext)
    const user = JSON.parse(localStorage.getItem('userData'))
    const [isLoading, setIsLoading] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)

    const deleteClient = async (id) => {
        try {
            setIsLoading(true)
            const response = await axios.delete( `https://inciohost.com/server/api/clientdelete/${id}`, {
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

    const [countries, setCountries] = useState()

    const countriesdefaultOption = countries && countries.find(option => option.value === props.country.value);
    const companycountriesdefaultOption = countries && countries.find(option => option.value === props.companyCountry.value);

    const roleOptions = [
        { value: 'customer', label: 'Customer' }
    ];

    const roledefaultOption = roleOptions.find(option => option.value === props.role.value);

    const [fullName, setFullName] = useState()
    const [email, setEmail] = useState()
    const [phone, setPhone] = useState()
    const [address, setAddress] = useState()
    const [zip, setZip] = useState()
    const [selectedCountry, setSelectedCountry] = useState(null);

    const [companyName, setCompanyName] = useState()
    const [companyEmail, setCompanyEmail] = useState()
    const [companyPhone, setCompanyPhone] = useState()
    const [companyAddress, setCompanyAddress] = useState()
    const [companyZip, setCompanyZip] = useState()
    const [selectedCompanyCountry, setSelectedCompanyCountry] = useState(null);

    const [clientCard, setClientCard] = useState()
    const [clientCardExpires, setClientCardExpires] = useState()
    const [clientCardCCV, setClientCardCCV] = useState()

    const [selectedRole, setSelectedRole] = useState()
    const [selectedImage, setSelectedImage] = useState();

    const [activeStatus, setActiveStatus] = useState()

    const [newImage, setNewImage] = useState(false)

    const updateClient = async (event) => {
        event.preventDefault();
      
        const formData = new FormData();
        formData.append('id', props.id);
        formData.append('fullName', fullName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('zip', zip);
        formData.append('country', JSON.stringify(selectedCountry));
        formData.append('companyName', companyName);
        formData.append('companyEmail', companyEmail);
        formData.append('companyPhone', companyPhone);
        formData.append('companyAddress', companyAddress);
        formData.append('companyZip', companyZip);
        formData.append('companyCountry', JSON.stringify(selectedCompanyCountry));
        formData.append('clientCard', clientCard);
        formData.append('clientCardExpires', clientCardExpires);
        formData.append('clientCardCCV', clientCardCCV);
        formData.append('role', JSON.stringify(selectedRole));
        formData.append('active', activeStatus);
        formData.append('newimage', Boolean(newImage));
      
        if (newImage && selectedImage) {
          formData.append('image', selectedImage);
        }
      
        if (email.length === 0) {
          toast.error('Email is required', { position: toast.POSITION.BOTTOM_CENTER });
          return;
        }
      
        if (selectedCountry === null) {
          toast.error('Country is required', { position: toast.POSITION.BOTTOM_CENTER });
          return;
        }
      
        // Credit card number (Using Luhn algorithm)
        const luhnCheck = (num) => {
          let arr = (num + '')
            .split('')
            .reverse()
            .map((x) => parseInt(x));
          let lastDigit = arr.splice(0, 1)[0];
          let sum = arr.reduce((acc, val, i) => i % 2 !== 0 ? acc + val : acc + ((2 * val) % 9) || 9, 0);
          sum += lastDigit;
          return sum % 10 === 0;
        };
      
        if (!luhnCheck(clientCard)) {
          toast.error('Invalid card number', { position: toast.POSITION.BOTTOM_CENTER });
          return;
        }
      
        // Expiry date (MM/YY)
        const expiryDateRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
        if (!expiryDateRegex.test(clientCardExpires)) {
          toast.error('Invalid card expiry date. Please use MM/YY format', { position: toast.POSITION.BOTTOM_CENTER });
          return;
        }
      
        // CCV (3 or 4 digit number)
        const ccvRegex = /^[0-9]{3,4}$/;
        if (!ccvRegex.test(clientCardCCV)) {
          toast.error('Invalid CCV. Please enter a 3 or 4 digit number', { position: toast.POSITION.BOTTOM_CENTER });
          return;
        }
      
        try {
          setIsLoading(true);
      
          const response = await axios.post(
            "https://inciohost.com/server/api/updateclient",
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + user.token,
              }
            }
          );
      
          if (response.data.message === "global_success") {
            setOpenEdit(false);
            props.onUpdate();
          }
      
          setIsLoading(false);
        } catch (error) {
          console.log(error);
          toast.error(error, { position: toast.POSITION.BOTTOM_CENTER });
          setIsLoading(false);
        }
    }      
        
    const fetchClient = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get(
                `https://inciohost.com/server/api/getclient/${props.id}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token,
                  },
                }
            );
            
            const clientData = response.data.client;

            setFullName(clientData.fullName);
            setEmail(clientData.email);
            setPhone(clientData.phone);
            setAddress(clientData.address);
            setZip(clientData.zip);
            setSelectedCountry(clientData.country);
        
            setCompanyName(clientData.companyName);
            setCompanyEmail(clientData.companyEmail);
            setCompanyPhone(clientData.companyPhone);
            setCompanyAddress(clientData.companyAddress);
            setCompanyZip(clientData.companyZip);
            setSelectedCompanyCountry(clientData.companyCountry);
        
            setClientCard(clientData.clientCard);
            setClientCardExpires(clientData.clientCardExpires);
            setClientCardCCV(clientData.clientCardCCV);
        
            setSelectedRole(clientData.role);
            setSelectedImage(clientData.image);
        
            setActiveStatus(clientData.active);
        
            setIsLoading(false);
        } catch (err) {
            toast.error(err, {position: toast.POSITION.BOTTOM_CENTER})
            setIsLoading(false)
        }
    }

    const fetchCountries = async () => {
        try {
            const response = await axios.get('https://restcountries.com/v3.1/all');
            const countryData = response.data.map(country => ({
                value: country.cca2,
                label: country.name.common 
            }));
            setCountries(countryData);
        } catch (err) {
            console.error(err);
            toast.error(err, {position: toast.POSITION.BOTTOM_CENTER})
        }
    }
    
    useEffect(() => {
        fetchCountries()    
        fetchClient()
    }, [props.id]);

    const handleImageInput = (id, file, isValid) => {
        if (isValid) {
            setSelectedImage(file);
        } else {
            setSelectedImage(null);
        }
    };
  
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

    const [revealDetails, setRevealDetails] = useState(false)

    function formatCreditCard(cardNumber) {
        return cardNumber.replace(/(.{4})/g, "$1\u00A0").trim();
    }
      
    return (
    <>
    {isLoading && <LoadingSpinner asOverlay={true} />}

    {auth.windowWidth < 650 && (
      <>
      <Modal size="lg" show={showInfo} onHide={handleCloseInfo} className="display-on-mobile-device custom-mobile-modal modal-top-global">
          <Modal.Header closeButton>
            <Modal.Title className='text-center'>Client</Modal.Title>
          </Modal.Header>
          <Modal.Body className="position-relative">
                  <div className="modal-client-info">
                  <Row>
                    <Col xs={3}>
                            <div className="image-upload__preview position-relative">              
                                <img src={`https://inciohost.com/server/` + selectedImage} alt="Preview" className="mt-2" />
                            </div>
                    </Col>
                    <Col xs={9}>
                            <div className="modal-client-info-row-info">
                                <span>{props.fullName}</span>
                                <p>Role ({props.role.label})</p>
                            </div>
                    </Col>
                  </Row>

                  <div className="client-block-main-modal">
                        <label>Email</label> <div className="space10px"></div>

                        <a href={`mailto:${props.email}`}>
                        <span className="client-block-main-modal-link">
                            <b>Email</b> 

                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M8.33333 5V6.66667H4.16667V15.8333H13.3333V11.6667H15V16.6667C15 17.1269 14.6269 17.5 14.1667 17.5H3.33333C2.8731 17.5 2.5 17.1269 2.5 16.6667V5.83333C2.5 5.3731 2.8731 5 3.33333 5H8.33333ZM17.5 2.5V9.16667H15.8333L15.8333 5.34417L9.33925 11.8392L8.16074 10.6607L14.6541 4.16667H10.8333V2.5H17.5Z" fill="url(#paint0_linear_181_6327)"/>
                            <defs>
                            <linearGradient id="paint0_linear_181_6327" x1="10" y1="2.5" x2="10" y2="17.5" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#BF5AF2"/>
                            <stop offset="1" stopColor="#9444BC"/>
                            </linearGradient>
                            </defs>
                            </svg>
                        </span>
                        </a>
                        <p style={{ color: "#BF5AF2" }}>{props.email}</p>
                  </div>

                  <div className="client-block-main-modal">
                        <label>Phone number</label> <div className="space10px"></div>

                        <a href="#" onClick={() => navigator.clipboard.writeText(props.phone)}>
                        <span className="client-block-main-modal-link">
                            <b>Copy</b> 

                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M5.83317 4.99984V2.49984C5.83317 2.0396 6.20627 1.6665 6.6665 1.6665H16.6665C17.1267 1.6665 17.4998 2.0396 17.4998 2.49984V14.1665C17.4998 14.6268 17.1267 14.9998 16.6665 14.9998H14.1665V17.4991C14.1665 17.9598 13.7916 18.3332 13.3275 18.3332H3.33888C2.87549 18.3332 2.5 17.9627 2.5 17.4991L2.50217 5.8339C2.50225 5.37326 2.8772 4.99984 3.34118 4.99984H5.83317ZM4.16868 6.6665L4.16682 16.6665H12.4998V6.6665H4.16868ZM7.49983 4.99984H14.1665V13.3332H15.8332V3.33317H7.49983V4.99984Z" fill="url(#paint0_linear_181_6331)"/>
                            <defs>
                            <linearGradient id="paint0_linear_181_6331" x1="9.99992" y1="1.6665" x2="9.99992" y2="18.3332" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#BF5AF2"/>
                            <stop offset="1" stopColor="#9444BC"/>
                            </linearGradient>
                            </defs>
                            </svg>
                        </span>
                        </a>
                        <p style={{ color: "#BF5AF2" }}>{props.phone}</p>
                  </div>

                  <div className="client-block-main-modal">
                        <label>Address</label> <div className="space10px"></div>

                        <p>{props.address}</p>
                  </div>

                  <hr />

                  <div className="client-block-main-modal">
                        <label>Company</label> <div className="space10px"></div>

                        <p>{props.companyName}</p>
                  </div>


                  <div className="client-block-main-modal">
                        <label>Address</label> <div className="space10px"></div>

                        <p>{props.companyAddress}</p>
                  </div>

                  <hr />

                  <div className="client-block-main-modal-money">
                    <label>Income</label> <span className="money-modal-count" style={{ color: '#61C178'}}> + {props.income} <small>USD</small></span>
                  </div>
                  <div className="client-block-main-modal-money">
                    <label>Outcome</label> <span className="money-modal-count" style={{ color: '#E57C77'}}> - {props.income} <small>USD</small></span>
                  </div>

                  <hr />

                  <div className="client-block-main-modal">
                        <label>Credit card</label> <div className="space10px"></div>
                        
                        {revealDetails === false ? (
                            <>
                            <Link to='#' onClick={() => setRevealDetails(true)}>
                            <span className="client-block-main-modal-link">
                                <b>Reveal</b> 

                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9.99993 2.5C14.4933 2.5 18.2317 5.73313 19.0154 10C18.2317 14.2668 14.4933 17.5 9.99993 17.5C5.50644 17.5 1.76813 14.2668 0.984375 10C1.76813 5.73313 5.50644 2.5 9.99993 2.5ZM9.99993 15.8333C13.5296 15.8333 16.5499 13.3767 17.3144 10C16.5499 6.62336 13.5296 4.16667 9.99993 4.16667C6.47018 4.16667 3.44986 6.62336 2.68533 10C3.44986 13.3767 6.47018 15.8333 9.99993 15.8333ZM9.99993 13.75C7.92883 13.75 6.24989 12.0711 6.24989 10C6.24989 7.92893 7.92883 6.25 9.99993 6.25C12.0709 6.25 13.7499 7.92893 13.7499 10C13.7499 12.0711 12.0709 13.75 9.99993 13.75ZM9.99993 12.0833C11.1505 12.0833 12.0833 11.1506 12.0833 10C12.0833 8.84942 11.1505 7.91667 9.99993 7.91667C8.84934 7.91667 7.91656 8.84942 7.91656 10C7.91656 11.1506 8.84934 12.0833 9.99993 12.0833Z" fill="url(#paint0_linear_181_6335)"/>
                                <defs>
                                <linearGradient id="paint0_linear_181_6335" x1="9.9999" y1="2.5" x2="9.9999" y2="17.5" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#BF5AF2"/>
                                <stop offset="1" stopColor="#9444BC"/>
                                </linearGradient>
                                </defs>
                                </svg>
                            </span>
                            </Link>
                            </>
                        ) : (
                            <>
                            <Link to='#' onClick={() => setRevealDetails(!revealDetails)}>
                            <span className="client-block-main-modal-link">
                                <b>Hide</b> 

                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M14.9019 16.0805C13.4842 16.9794 11.8028 17.5 9.99993 17.5C5.50644 17.5 1.76813 14.2668 0.984375 10C1.34827 8.01886 2.34911 6.26059 3.76673 4.94532L1.16106 2.33965L2.33957 1.16113L18.8388 17.6603L17.6603 18.8388L14.9019 16.0805ZM4.94601 6.12459C3.83862 7.1333 3.03117 8.47251 2.68533 10C3.44986 13.3766 6.47018 15.8333 9.99993 15.8333C11.3328 15.8333 12.593 15.483 13.6866 14.8652L11.9963 13.1749C11.4183 13.5392 10.7337 13.75 9.99993 13.75C7.92883 13.75 6.24989 12.071 6.24989 10C6.24989 9.26617 6.46065 8.58159 6.82493 8.00352L4.94601 6.12459ZM10.7613 11.9398L8.06006 9.23867C7.96742 9.47451 7.91656 9.73126 7.91656 10C7.91656 11.1506 8.84934 12.0833 9.99993 12.0833C10.2686 12.0833 10.5254 12.0324 10.7613 11.9398ZM17.3387 13.8269L16.1463 12.6346C16.6929 11.8555 17.0958 10.9653 17.3144 10C16.5499 6.62332 13.5296 4.16664 9.99993 4.16664C9.29501 4.16664 8.61043 4.26462 7.96008 4.44832L6.64506 3.1333C7.68407 2.7245 8.81576 2.49997 9.99993 2.49997C14.4933 2.49997 18.2317 5.73311 19.0154 10C18.7553 11.4163 18.1695 12.7188 17.3387 13.8269ZM9.76876 6.25698C9.84518 6.25233 9.92226 6.24997 9.99993 6.24997C12.0709 6.24997 13.7499 7.92891 13.7499 10C13.7499 10.0776 13.7475 10.1547 13.7429 10.2311L9.76876 6.25698Z" fill="url(#paint0_linear_181_6545)"/>
                                <defs>
                                <linearGradient id="paint0_linear_181_6545" x1="9.9999" y1="1.16113" x2="9.9999" y2="18.8388" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#BF5AF2"/>
                                <stop offset="1" stopColor="#9444BC"/>
                                </linearGradient>
                                </defs>
                                </svg>
                            </span>
                            </Link>
                            </>
                        )}

                    <p style={{ color: "#BF5AF2" }}>
                        {revealDetails === false
                        ? formatCreditCard(props.clientCard.slice(0, -3).replace(/./g, '*') + props.clientCard.slice(-3))
                        : formatCreditCard(props.clientCard)}
                    </p>
                  </div>

                  <div className="client-block-main-modal">
                        <label>Security number</label> <div className="space10px"></div>

                        <p>{revealDetails === false ? '***' : props.clientCardCCV}</p>
                  </div>


                  <div className="client-block-main-modal">
                        <label>Expiry date</label> <div className="space10px"></div>

                        <p>{revealDetails === false ? '**/**' : props.clientCardExpires}</p>
                  </div>

                  </div>
          </Modal.Body>
      </Modal>
      </>
    )}

    <React.Fragment key={`meeting${props.index}`}>
    {props.mobile === false ? (
        <>
        <tr className={`${openEdit === true ? 'custom-table-css-active' : 'custom-table-css'}`} onClick={() => setOpenEdit(!openEdit)}>
            <td>{props.fullName}</td>
            <td>{props.companyName}</td>
            <td>{props.email}</td>
            <td>{props.phone}</td>
            <td>$ {props.income}</td>
            <td>$ {props.outcome}</td>
            <td>
                {/* <Button variant='light' size='sm' className='m-1 table-btns' onClick={() => setOpenEdit(!openEdit)}><i className="fa-solid fa-gear"></i></Button> */}
                <Button variant='light' size='sm' className='table-btns' onClick={() => deleteClient(props.id)}><i className="fa-solid fa-trash"></i></Button> 
            </td>
        </tr>
        {openEdit && 
        <tr>
            <td colSpan="12">
            <div className="mx-1">

            <Form className="global-form" onSubmit={updateClient}>
                <Row className="form-row g-0">
                        <Col sm={3} className="px-2">
                            <Form.Group className="mb-3" controlId="clientForm.fullname">
                                <Form.Control
                                type="text"
                                placeholder="First Last Name"
                                className="global-formcontrol"
                                onChange={(e) => setFullName(e.target.value)}
                                defaultValue={fullName}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.email">
                                <Form.Control
                                type="email"
                                placeholder="myemail@mycompany.com"
                                className="global-formcontrol"
                                onChange={(e) => setEmail(e.target.value)}
                                defaultValue={email}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.phone">
                                <Form.Control
                                type="phone"
                                placeholder="+123 45 6789123"
                                className="global-formcontrol"
                                onChange={(e) => setPhone(e.target.value)}
                                defaultValue={phone}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.address">
                                <Form.Control
                                type="text"
                                placeholder="My Address 5"
                                className="global-formcontrol"
                                onChange={(e) => setAddress(e.target.value)}
                                defaultValue={address}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.zip">
                                <Form.Control
                                type="text"
                                placeholder="11000"
                                className="global-formcontrol"
                                onChange={(e) => setZip(e.target.value)}
                                defaultValue={zip}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.country">
                                <Select 
                                className="global-select"
                                classNamePrefix="custom-select"
                                placeholder="Select country"
                                options={countries} 
                                onChange={(e) => setSelectedCountry(e)}
                                defaultValue={countriesdefaultOption}
                                styles={customStyles}
                                />
                            </Form.Group>
                        </Col>
                        <Col sm={3}>
                            <Form.Group className="mb-3" controlId="clientForm.companyname">
                                <Form.Control
                                type="text"
                                placeholder="Company Name"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyName(e.target.value)}
                                defaultValue={companyName}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.companyemail">
                                <Form.Control
                                type="email"
                                placeholder="Company email"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyEmail(e.target.value)}
                                defaultValue={companyEmail}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.companyphone">
                                <Form.Control
                                type="phone"
                                placeholder="Company Phone"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyPhone(e.target.value)}
                                defaultValue={companyPhone}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.companyaddress">
                                <Form.Control
                                type="text"
                                placeholder="My Address 5"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyAddress(e.target.value)}
                                defaultValue={companyAddress}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.companyzip">
                                <Form.Control
                                type="text"
                                placeholder="11000"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyZip(e.target.value)}
                                defaultValue={companyZip}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="clientForm.companycountry">
                                <Select 
                                className="global-select"
                                classNamePrefix="custom-select"
                                placeholder="Select company country"
                                options={countries} 
                                onChange={(e) => setSelectedCompanyCountry(e)}
                                defaultValue={companycountriesdefaultOption}
                                styles={customStyles}
                                />
                            </Form.Group>
                        </Col>    
                        <Col sm={3}>
                            <div className="mx-2">
                            <Form.Group className="mb-3" controlId="clientForm.clientcard">
                                <Form.Control
                                type="text"
                                placeholder="Credit Card No"
                                className="global-formcontrol"
                                onChange={(e) => setClientCard(e.target.value)}
                                defaultValue={clientCard}
                                />
                            </Form.Group>

                            <Row>
                            <Col sm={6}>
                            <Form.Group className="mb-3" controlId="clientForm.clientcardexpires">
                                <Form.Control
                                    type="text"
                                    maxLength="5"
                                    placeholder="MM/YY"
                                    className="global-formcontrol"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const currentYear = new Date().getFullYear().toString().substr(-2);
                                        const currentMonth = new Date().getMonth() + 1;

                                        const reg = /^([0-1]?[0-9])\/?([0-9]{0,2})$/;
                                        const matches = value.match(reg);

                                        if (matches) {
                                            let formattedInput = matches[1];
                                            if (matches[2]) {
                                                formattedInput += '/' + matches[2];
                                            }

                                            if (formattedInput.length == 5) {
                                                const inputMonth = matches[1];
                                                const inputYear = matches[2];
                                
                                                // Ensure date is in the future
                                                if (inputYear > currentYear || (inputYear == currentYear && inputMonth >= currentMonth)) {
                                                    setClientCardExpires(formattedInput);
                                                }
                                            } else {
                                                setClientCardExpires(formattedInput);
                                            }
                                        } else if (value === '') {
                                            setClientCardExpires(value);
                                        }
                                    }}
                                    defaultValue={clientCardExpires}
                                    required
                                />
                            </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="clientForm.clientcardccv">
                                    <Form.Control
                                    type="number"
                                    placeholder="CCV"
                                    className="global-formcontrol"
                                    onChange={(e) => setClientCardCCV(e.target.value)}
                                    maxLength={3}
                                    minLength={3}
                                    defaultValue={clientCardCCV}
                                    required
                                    />
                                </Form.Group>
                            </Col>
                            </Row>
                            </div>
                        </Col>
                        <Col sm={3}>
                            <Form.Group className="mb-3" controlId="clientForm.clientrole">
                                <Form.Label className="custom-formlabel">Role</Form.Label>
                                <Select 
                                className="global-select"
                                classNamePrefix="custom-select"
                                placeholder="Select client role"
                                options={roleOptions} 
                                onChange={(e) => setSelectedRole(e)}
                                defaultValue={roledefaultOption}
                                styles={customStyles}
                                />
                            </Form.Group>

                            <Row>
                                <Col sm={6}>
                                    <Form.Group className="mb-3" controlId="clientForm.image">
                                        {newImage === false ? (
                                            <>
                                                <div className={`image-upload ${props.center && 'center'}`}>
                                                    <div className="image-upload__preview position-relative">
                                                
                                                    <img src={`https://inciohost.com/server/` + selectedImage} alt="Preview" className="mt-2" />

                                                    </div>
                                                </div>

                                                    <Button
                                                        variant="light"
                                                        className="general-light-btn mt-3"
                                                        onClick={() => setNewImage(true)}
                                                        >
                                                        Upload New
                                                    </Button>
                                            </>
                                        ) : (
                                            <>
                                            <ImageUpload onInput={handleImageInput} id="image" />
                                            </>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col sm={6}>
                                    <Form.Group className="my-3" controlId="clientForm.active">
                                    <Form.Label>Client Active</Form.Label>

                                    <Form.Check
                                        type="switch"
                                        id="active"
                                        onChange={(e) => setActiveStatus(e.target.checked)}
                                        checked={activeStatus}
                                    />
                                    </Form.Group>
                                </Col>
                            </Row>

                        </Col>  
                    </Row>

                    <Button
                    variant="light"
                    className="general-light-btn"
                    type="submit"
                    >
                    Update Client
                </Button>
                </Form>


            </div>
            </td>
        </tr>
        }
        </>
    ) : (
        <>
        <div className="mobile-client-block">
            <Row>
                <Col xs={3}>
                        <div className="image-upload__preview position-relative">              
                             <img src={`https://inciohost.com/server/` + selectedImage} alt="Preview" className="mt-2" />
                        </div>
                </Col>
                <Col xs={5}>
                        <div className="mobile-client-block-info">
                            <span>{props.fullName}</span>
                            <div className='mobile-client-block-info-customtext'>{props.email}</div>
                            <p>{props.phone}
                            
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none" style={{ cursor: "pointer"}} onClick={() =>     navigator.clipboard.writeText(props.phone)}>
                            <path d="M4.66653 4.50016V2.50016C4.66653 2.13198 4.96501 1.8335 5.3332 1.8335H13.3332C13.7014 1.8335 13.9999 2.13198 13.9999 2.50016V11.8335C13.9999 12.2017 13.7014 12.5002 13.3332 12.5002H11.3332V14.4996C11.3332 14.8681 11.0333 15.1668 10.662 15.1668H2.67111C2.30039 15.1668 2 14.8704 2 14.4996L2.00173 5.16741C2.0018 4.7989 2.30176 4.50016 2.67295 4.50016H4.66653ZM3.33495 5.8335L3.33346 13.8335H9.99987V5.8335H3.33495ZM5.99987 4.50016H11.3332V11.1668H12.6665V3.16683H5.99987V4.50016Z" fill="url(#paint0_linear_181_5823)"/>
                            <defs>
                            <linearGradient id="paint0_linear_181_5823" x1="7.99993" y1="1.8335" x2="7.99993" y2="15.1668" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#BF5AF2"/>
                            <stop offset="1" stopColor="#9444BC"/>
                            </linearGradient>
                            </defs>
                            </svg>
                            </p>
                        </div>
                </Col>
                <Col xs={4} className='position-relative'>
                <div className="mobile-clients-list-block-footer-more">
                    <Link onClick={() => handleShowInfo()}>
                    Details

                    <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.743 4.85833L7.46039 0.275C7.30621 0.100833 7.09208 0 6.85225 0C6.38116 0 5.99572 0.4125 5.99572 0.916667C5.99572 1.17333 6.08994 1.4025 6.24411 1.5675L9.0621 4.58333H0.856531C0.385439 4.58333 0 4.99583 0 5.5C0 6.00417 0.385439 6.41667 0.856531 6.41667H9.07066L6.25268 9.4325C6.0985 9.5975 6.00428 9.82667 6.00428 10.0833C6.00428 10.5875 6.38972 11 6.86081 11C7.10064 11 7.31478 10.8992 7.46895 10.7342L11.7516 6.15083C11.9058 5.98583 12 5.75667 12 5.5C12 5.24333 11.8972 5.02333 11.743 4.85833Z" fill="#A94FD7"/>
                    </svg>

                    </Link>
                </div>
                </Col>
            </Row>
        </div>
        </>
    )}
    </React.Fragment>
    </>
  );
};

export default ClientItem;
