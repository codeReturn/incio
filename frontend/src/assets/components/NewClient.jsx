import React, { useState, useEffect, useContext } from 'react';

import Select from 'react-select';

import axios from 'axios';

import { AuthContext } from '../context/auth-context';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../UI/LoadingSpinner';

import { Row, Col, Button, Form, Modal } from 'react-bootstrap';

import ImageUpload from '../UI/ImageUpload';

const NewClient = (props) => {
    const auth = useContext(AuthContext);
    const [openStatus, setOpenStatus] = useState(props.open);
    const [isLoading, setIsLoading] = useState(false)

    const [countries, setCountries] = useState()

    useEffect(() => {
        setOpenStatus(props.open);
        console.log(props.open)
    }, [props.open]);

    const closeCreating = () => {
        setOpenStatus(false)
        props.onUpdate();
    };

    const roleOptions = [
        { value: 'customer', label: 'Customer' }
    ];

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

    const createClient = async (event) => {
        event.preventDefault();
    
        const formData = new FormData();
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
        formData.append('image', selectedImage); 
        formData.append('active', activeStatus); 
    
        if (!email) {
            toast.error('Email is required', {position: toast.POSITION.BOTTOM_CENTER})
            return;
        }
    
        if (selectedCountry === null) {
            toast.error('Country is required', {position: toast.POSITION.BOTTOM_CENTER})
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
            toast.error('Invalid card number', {position: toast.POSITION.BOTTOM_CENTER})
            return;
        }
    
        // Expiry date (MM/YY)
        const expiryDateRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
        if (!expiryDateRegex.test(clientCardExpires)) {
            toast.error('Invalid card expiry date. Please use MM/YY format', {position: toast.POSITION.BOTTOM_CENTER})
            return;
        }
    
        // CCV (3 or 4 digit number)
        const ccvRegex = /^[0-9]{3,4}$/;
        if (!ccvRegex.test(clientCardCCV)) {
            toast.error('Invalid CCV. Please enter a 3 or 4 digit number', {position: toast.POSITION.BOTTOM_CENTER})
            return;
        }
    
        try {
            setIsLoading(true)
    
            const response = await axios.post(
                "http://localhost:5000/server/api/createclient",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: 'Bearer ' + auth.token,
                    }
                }
            );
    
            if(response.data.message === "global_success"){
                props.onUpdate();
            }
    
            setIsLoading(false)
        } catch (error) {
            toast.error(error, {position: toast.POSITION.BOTTOM_CENTER})
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
    }, []);

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

    const [showCreate, setShowCreate] = useState(false);

    const handleClose = () => {
      setShowCreate(false);
      props.onClose();
    }
    const handleShow = () => setShowCreate(true);

    useEffect(() => {
        if(props.modal === true){
          handleShow()
        } else {
          handleClose()
        }
      }, [props.modal]);

    return (
        <React.Fragment>        
        {isLoading && <LoadingSpinner asOverlay={true} />}

        {auth.windowWidth < 650 && (
            <>
            <Modal show={showCreate} onHide={handleClose} className="display-on-mobile-device custom-mobile-modal modal-top-global">
            <Modal.Header closeButton>
                <Modal.Title>New client</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <Form className="global-form" onSubmit={(e) => createClient(e)}>
                        <Row>
                            <Col sm={12} className='text-center'>
                                <Form.Group className="mb-3" controlId="clientFormModal.image">
                                    <ImageUpload onInput={handleImageInput} id="image" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="my-2" controlId="clientFormModal.name">
                            <Form.Label>Client name</Form.Label>
                            <Form.Control type="text" placeholder="Client name" onChange={(e) => setFullName(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="my-2" controlId="clientFormModal.email">
                            <Form.Label>Account email</Form.Label>
                            <Form.Control
                            type="email"
                            placeholder="Account email"
                            className="global-formcontrol"
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="my-2" controlId="clientFormModal.phone">
                            <Form.Label>Phone number</Form.Label>
                            <Form.Control
                            type="phone"
                            placeholder="Phone number"
                            className="global-formcontrol"
                            onChange={(e) => setPhone(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="my-2" controlId="clientFormModal.address">
                            <Form.Label>Address</Form.Label>

                            <Form.Control
                            type="text"
                            placeholder="Address"
                            className="global-formcontrol"
                            onChange={(e) => setAddress(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="my-2" controlId="clientFormModal.zip">
                            <Form.Label>Zip code</Form.Label>

                            <Form.Control
                            type="text"
                            placeholder="Zip code"
                            className="global-formcontrol"
                            onChange={(e) => setZip(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="my-2" controlId="clientFormModal.country">
                            <Form.Label>Country</Form.Label>

                            <Select 
                            className="global-select"
                            classNamePrefix="custom-select-modal"
                            placeholder="Country"
                            options={countries} 
                            onChange={(e) => setSelectedCountry(e)}
                            styles={customStyles}
                            />
                        </Form.Group>

                        <hr />

                        <Form.Group className="mb-3" controlId="clientFormModal.companyname">
                            <Form.Label>Company name</Form.Label>

                            <Form.Control
                            type="text"
                            placeholder="Company Name"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientFormModal.companyemail">
                            <Form.Label>Company email</Form.Label>

                            <Form.Control
                            type="email"
                            placeholder="Company email"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientFormModal.companyphone">
                            <Form.Label>Company phone</Form.Label>

                            <Form.Control
                            type="phone"
                            placeholder="Company Phone"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientFormModal.companyaddress">
                            <Form.Label>Company address</Form.Label>

                            <Form.Control
                            type="text"
                            placeholder="Company address"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientFormModal.companyzip">
                            <Form.Label>Company zip code</Form.Label>

                            <Form.Control
                            type="text"
                            placeholder="Company zip code"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyZip(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientFormModal.companycountry">
                            <Form.Label>Company country</Form.Label>

                            <Select 
                            className="global-select"
                            classNamePrefix="custom-select-modal"
                            placeholder="Company country"
                            options={countries} 
                            onChange={(e) => setSelectedCompanyCountry(e)}
                            styles={customStyles}
                            />
                        </Form.Group>

                        <hr />

                        <Form.Group className="mb-3" controlId="clientForm.clientcard">
                            <Form.Label>Credit card</Form.Label>

                            <Form.Control
                            type="text"
                            placeholder="Credit Card No"
                            className="global-formcontrol"
                            onChange={(e) => setClientCard(e.target.value)}
                            />
                        </Form.Group>

                        <Row>
                        <Col xs={6} className="pr-8">
                        <Form.Group className="mb-3" controlId="clientForm.clientcardexpires">
                            <Form.Label>Expires</Form.Label>

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
                                required
                            />
                        </Form.Group>
                        </Col>
                        <Col xs={6} className="pl-8">
                            <Form.Group className="mb-3" controlId="clientForm.clientcardccv">
                                <Form.Label>CCV</Form.Label>

                                <Form.Control
                                type="number"
                                placeholder="CCV"
                                className="global-formcontrol"
                                onChange={(e) => setClientCardCCV(e.target.value)}
                                maxLength={3}
                                minLength={3}
                                required
                                />
                            </Form.Group>
                        </Col>
                        </Row>     

                        <hr />

                        <Form.Group className="mb-3" controlId="clientForm.clientrole">
                            <Form.Label>Role</Form.Label>
                            <Select 
                            className="global-select"
                            classNamePrefix="custom-select-modal"
                            placeholder="Select client role"
                            options={roleOptions} 
                            onChange={(e) => setSelectedRole(e)}
                            styles={customStyles}
                            />
                        </Form.Group>    

                        <hr />

                    <div className='modal-submit-btn'>
                        <Button variant='dark' size='lg' className='w-100' type='submit'>
                        Create Client
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none" style={{ marginLeft: "8px" }}>
                        <path d="M11 10.689V12.2561C10.5308 12.0902 10.026 12 9.5 12C7.01472 12 5 14.0147 5 16.5H3.5C3.5 13.1863 6.18629 10.5 9.5 10.5C10.018 10.5 10.5206 10.5656 11 10.689ZM9.5 9.75C7.01375 9.75 5 7.73625 5 5.25C5 2.76375 7.01375 0.75 9.5 0.75C11.9862 0.75 14 2.76375 14 5.25C14 7.73625 11.9862 9.75 9.5 9.75ZM9.5 8.25C11.1575 8.25 12.5 6.9075 12.5 5.25C12.5 3.5925 11.1575 2.25 9.5 2.25C7.8425 2.25 6.5 3.5925 6.5 5.25C6.5 6.9075 7.8425 8.25 9.5 8.25ZM14 12.75V10.5H15.5V12.75H17.75V14.25H15.5V16.5H14V14.25H11.75V12.75H14Z" fill="white"/>
                        </svg>
                        </Button>
                    </div>      
                </Form>

            </Modal.Body>
            </Modal>
            </>
        )}

        {openStatus === true && auth.windowWidth > 650 && (
        <>
          <div className="section-title">
            <Button
              variant="light"
              className="general-light-btn float-end mt-2"
              onClick={() => closeCreating()}
            >
              Close
            </Button>

            <h1>New Client</h1>

            <Form className="global-form" onSubmit={createClient}>
              <Row className="form-row g-0">
                    <Col sm={3}>
                        <Form.Group className="mb-3" controlId="clientForm.fullname">
                            <Form.Control
                            type="text"
                            placeholder="First Last Name"
                            className="global-formcontrol"
                            onChange={(e) => setFullName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.email">
                            <Form.Control
                            type="email"
                            placeholder="myemail@mycompany.com"
                            className="global-formcontrol"
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.phone">
                            <Form.Control
                            type="phone"
                            placeholder="+123 45 6789123"
                            className="global-formcontrol"
                            onChange={(e) => setPhone(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.address">
                            <Form.Control
                            type="text"
                            placeholder="My Address 5"
                            className="global-formcontrol"
                            onChange={(e) => setAddress(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.zip">
                            <Form.Control
                            type="text"
                            placeholder="11000"
                            className="global-formcontrol"
                            onChange={(e) => setZip(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.country">
                            <Select 
                            className="global-select"
                            classNamePrefix="custom-select"
                            placeholder="Select country"
                            options={countries} 
                            onChange={(e) => setSelectedCountry(e)}
                            styles={customStyles}
                            />
                        </Form.Group>
                    </Col>
                    <Col sm={3} className="col-pd">
                        <Form.Group className="mb-3" controlId="clientForm.companyname">
                            <Form.Control
                            type="text"
                            placeholder="Company Name"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.companyemail">
                            <Form.Control
                            type="email"
                            placeholder="Company email"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.companyphone">
                            <Form.Control
                            type="phone"
                            placeholder="Company Phone"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.companyaddress">
                            <Form.Control
                            type="text"
                            placeholder="My Address 5"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.companyzip">
                            <Form.Control
                            type="text"
                            placeholder="11000"
                            className="global-formcontrol"
                            onChange={(e) => setCompanyZip(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="clientForm.companycountry">
                            <Select 
                            className="global-select"
                            classNamePrefix="custom-select"
                            placeholder="Select company country"
                            options={countries} 
                            onChange={(e) => setSelectedCompanyCountry(e)}
                            styles={customStyles}
                            />
                        </Form.Group>
                    </Col>    
                    <Col sm={3} className="col-pd">
                        <Form.Group className="mb-3" controlId="clientForm.clientcard">
                            <Form.Control
                            type="text"
                            placeholder="Credit Card No"
                            className="global-formcontrol"
                            onChange={(e) => setClientCard(e.target.value)}
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
                                required
                                />
                            </Form.Group>
                        </Col>
                        </Row>
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
                            styles={customStyles}
                            />
                        </Form.Group>

                        <Row>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="clientForm.image">
                                    <ImageUpload onInput={handleImageInput} id="image" />
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="my-3" controlId="clientForm.active">
                                <Form.Label>Client Active</Form.Label>

                                <Form.Check
                                    type="switch"
                                    id="active"
                                    onChange={(e) => setActiveStatus(e.target.checked)}
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
                  Create Client
              </Button>
            </Form>
          </div>
        </>
        )}
        </React.Fragment>
    )
}

export default NewClient;