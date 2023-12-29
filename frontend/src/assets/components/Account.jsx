import React, { useState, useEffect } from 'react';

import { Container, Row, Col, Form, Button } from 'react-bootstrap';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios';
import Select from 'react-select';

import SidebarDrawer from '../UI/Drawer';

import LoadingSpinner from '../UI/LoadingSpinner';

import googleIcon from '../images/socials/google.png'
import linkedinIcon from '../images/socials/linkedin.png'
import stripeIcon from '../images/socials/stripe.png'
import zoomIcon from '../images/socials/zoom.png'
import avatarImage from '../images/avatar.png';

import ImageUpload from '../UI/ImageUpload';

const Account = () => {
    const userData = JSON.parse(localStorage.getItem('userData'))
    const [user, setUser] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const [countries, setCountries] = useState()

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

    const [card, setCard] = useState()
    const [cardExpires, setCardExpires] = useState()
    const [cardCCV, setCardCCV] = useState()

    const [selectedRole, setSelectedRole] = useState()
    const [selectedImage, setSelectedImage] = useState();

    const [newImage, setNewImage] = useState(false)

    const fetchUser = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get(`https://inciohost.com/server/api/users/getuserinfo`, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + userData.token
                }
            })
    
            setUser(response?.data?.user)

            const accountData = response?.data?.user;

            setFullName(accountData.name);
            setEmail(accountData.email);
            setPhone(accountData.phone);
            setAddress(accountData.address);
            setZip(accountData.zip);
            setSelectedCountry(accountData.country);
            
            setCompanyName(accountData.company);
            setCompanyEmail(accountData.companyEmail);
            setCompanyPhone(accountData.companyPhone);
            setCompanyAddress(accountData.companyAddress);
            setCompanyZip(accountData.companyZip);
            setSelectedCompanyCountry(accountData.companyCountry);
            
            setCard(accountData.card);
            setCardExpires(accountData.cardExpires);
            setCardCCV(accountData.cardCCV);
            
            setSelectedRole(accountData.role);
            setSelectedImage(accountData.image);
            
            setIsLoading(false)
        } catch (err) {
            console.log(err)
            setIsLoading(false)
        } 
    }

    useEffect(() => {
        fetchUser()
    }, []);

    const handleIcon = (platform) => {
        switch(platform) {
            case "stripe":
              return <img src={stripeIcon} className="img-fluid social-ico-height" />
            case "linkedin":
                return <img src={linkedinIcon} className="img-fluid social-ico-height" />
            case "google":
                return <img src={googleIcon} className="img-fluid social-ico-height" />
            case "zoom":
                return <img src={zoomIcon} className="img-fluid social-ico-height" />
            default:
              return null
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
        fetchUser()
    }, []);

    const updateAccount = async (event) => {
        event.preventDefault();
      
        const formData = new FormData();
        formData.append('name', fullName);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('zip', zip);
        formData.append('country', JSON.stringify(selectedCountry));
        formData.append('company', companyName);
        formData.append('companyEmail', companyEmail);
        formData.append('companyPhone', companyPhone);
        formData.append('companyAddress', companyAddress);
        formData.append('companyZip', companyZip);
        formData.append('companyCountry', JSON.stringify(selectedCompanyCountry));
        formData.append('card', card);
        formData.append('cardExpires', cardExpires);
        formData.append('cardCCV', cardCCV);
        formData.append('role', JSON.stringify(selectedRole));
        formData.append('newimage', Boolean(newImage));
    
        if (newImage && selectedImage) {
          formData.append('image', selectedImage);
        }
    
        try {
          setIsLoading(true);
      
          const response = await axios.post(
            "https://inciohost.com/server/api/updateaccount",
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: 'Bearer ' + userData.token,
              }
            }
          );
      
          if (response.data.message === "global_success") {
            fetchUser()
          }
      
          setIsLoading(false);
        } catch (error) {
          console.log(error);
          toast.error(error, { position: toast.POSITION.BOTTOM_CENTER });
          setIsLoading(false);
        }
    }      

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

    return (
    <React.Fragment>
      {isLoading && <LoadingSpinner asOverlay={true} />}

      <Container fluid>
        <Row className="flex-xl-nowrap">
          <Col xs={12} md={3} lg={2} className="p-0">
            <SidebarDrawer />
          </Col>
          <Col xs={12} md={9} lg={10} className="p-0">
             <Form className="global-form" onSubmit={updateAccount}>
             <Row>
                <Col sm={6}>
                <div className="section-title custom-padding-top">
                    <h1>Personal</h1>

                        <Row className="my-2">
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="accountForm.image">
                                    {newImage === false ? (
                                        <>
                                        <Row>
                                            <Col sm={6}>
                                                <div className={`image-upload center customh`}>
                                                    <div className="image-upload__preview position-relative">
                                                
                                                    {selectedImage ? (
                                                        <>
                                                        <img src={`https://inciohost.com/server/` + selectedImage} alt="Preview" className="mt-2" />
                                                        </>
                                                    ) : (
                                                        <>
                                                        <img src={avatarImage} alt="Preview" className="mt-2" />
                                                        </>
                                                    )}

                                                    </div>
                                                </div>
                                            </Col>
                                            <Col sm={6}>
                                                <p>Photo/Logo</p>

                                                <Button
                                                    variant="light"
                                                    className="general-light-btn mt-1"
                                                    onClick={() => setNewImage(true)}
                                                    >
                                                    Upload New
                                                </Button>
                                            </Col>
                                        </Row>
                                        </>
                                    ) : (
                                        <>
                                        <ImageUpload onInput={handleImageInput} id="image" />
                                        </>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="accountForm.fullname">
                                    <Form.Control
                                    type="text"
                                    placeholder="First Last Name"
                                    className="global-formcontrol"
                                    onChange={(e) => setFullName(e.target.value)}
                                    defaultValue={fullName}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="accountForm.email">
                                    <Form.Control
                                    type="email"
                                    disabled
                                    placeholder="myemail@mycompany.com"
                                    className="global-formcontrol"
                                    onChange={(e) => setEmail(e.target.value)}
                                    defaultValue={email}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="accountForm.phone">
                                    <Form.Control
                                    type="phone"
                                    placeholder="+123 45 6789123"
                                    className="global-formcontrol"
                                    onChange={(e) => setPhone(e.target.value)}
                                    defaultValue={phone}
                                    />
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="accountForm.role">
                                    <Form.Label className="custom-formlabel">Role</Form.Label>
                                    <Select 
                                    className="global-select"
                                    classNamePrefix="custom-select"
                                    placeholder="Select role"
                                    options={roleOptions} 
                                    onChange={(e) => setSelectedRole(e)}
                                    value={selectedRole}
                                    defaultValue={roleOptions.find(option => option.value === (user?.role?.value || ''))}
                                    styles={customStyles}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="accountForm.address">
                                    <Form.Control
                                    type="text"
                                    placeholder="My Address 5"
                                    className="global-formcontrol"
                                    onChange={(e) => setAddress(e.target.value)}
                                    defaultValue={address}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="accountForm.zip">
                                    <Form.Control
                                    type="text"
                                    placeholder="11000"
                                    className="global-formcontrol"
                                    onChange={(e) => setZip(e.target.value)}
                                    defaultValue={zip}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="accountForm.country">
                                    <Select 
                                    className="global-select"
                                    classNamePrefix="custom-select"
                                    placeholder="Select country"
                                    options={countries} 
                                    onChange={(e) => setSelectedCountry(e)}
                                    value={selectedCountry}
                                    defaultValue={countries?.find(option => option.value === (user?.country?.value || ''))}
                                    styles={customStyles}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                </div>
                </Col>
                <Col sm={6}>
                <div className="section-title custom-padding-top">
                    <h1>Subscription and Payment</h1>

                        <Row className="my-2">
                        <Col sm={6}>
                        <Form.Group className="mb-3" controlId="accountForm.card">
                            <Form.Control
                            type="text"
                            placeholder="Credit Card No"
                            className="global-formcontrol"
                            onChange={(e) => setCard(e.target.value)}
                            defaultValue={card}
                            />
                        </Form.Group>
                        <Row>
                            <Col sm={6}>
                            <Form.Group className="mb-3" controlId="accountForm.cardexpires">
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
                                                    setCardExpires(formattedInput);
                                                }
                                            } else {
                                                setCardExpires(formattedInput);
                                            }
                                        } else if (value === '') {
                                            setCardExpires(value);
                                        }
                                    }}
                                    defaultValue={cardExpires}
                                />
                            </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group className="mb-3" controlId="accountForm.cardccv">
                                    <Form.Control
                                    type="number"
                                    placeholder="CCV"
                                    className="global-formcontrol"
                                    onChange={(e) => setCardCCV(e.target.value)}
                                    maxLength={3}
                                    minLength={3}
                                    defaultValue={cardCCV}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        </Col>
                        <Col sm={6}>
                            
                        </Col>
                        </Row>
                    </div>
                </Col>
                <Col sm={6}>
                <div className="section-title custom-padding-top">
                    <h1>Company</h1>

                    <Row className="my-2">
                        <Col sm={6}>
                            <Form.Group className="mb-3" controlId="accountForm.companyname">
                                <Form.Control
                                type="text"
                                placeholder="Company Name"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyName(e.target.value)}
                                defaultValue={companyName}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="accountForm.companyemail">
                                <Form.Control
                                type="email"
                                placeholder="Company email"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyEmail(e.target.value)}
                                defaultValue={companyEmail}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="accountForm.companyphone">
                                <Form.Control
                                type="phone"
                                placeholder="Company Phone"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyPhone(e.target.value)}
                                defaultValue={companyPhone}
                                />
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3" controlId="accountForm.companyaddress">
                                <Form.Control
                                type="text"
                                placeholder="My Address 5"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyAddress(e.target.value)}
                                defaultValue={companyAddress}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="accountForm.companyzip">
                                <Form.Control
                                type="text"
                                placeholder="11000"
                                className="global-formcontrol"
                                onChange={(e) => setCompanyZip(e.target.value)}
                                defaultValue={companyZip}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="accountForm.companycountry">
                            <Select 
                                className="global-select"
                                classNamePrefix="custom-select"
                                placeholder="Select company country"
                                options={countries} 
                                onChange={(e) => setSelectedCompanyCountry(e)}
                                value={selectedCompanyCountry}
                                defaultValue={countries?.find(option => option.value === (user?.companyCountry?.value || ''))}
                                styles={customStyles}
                            />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
                </Col>
                <Col sm={6}>
                <div className="section-title custom-padding-top">
                    <h1>Connections</h1>

                    {user && user.socials.length < 1 && (
                        <>
                        <p>No results!</p>
                        </>
                    )}

                    {user && user.socials.length > 0 && (
                        <>
                        <Row className="my-2">
                            {user.socials && user.socials.map((social, index) => {
                                return (
                                    <React.Fragment key={`social` + index}>
                                        <Col sm={6}>
                                            <div className="account-social">
                                                {handleIcon(social.platform)} <span>{social.platform}</span>
                                            </div>
                                        </Col>
                                    </React.Fragment>
                                )
                            })}
                        </Row>
                        </>
                    )}
                </div>
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
          </Col>
        </Row>
      </Container>
    </React.Fragment>
    )
}

export default Account;