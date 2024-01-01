import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, Form, Button, Modal } from 'react-bootstrap';
import Select from 'react-select';

import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../UI/LoadingSpinner';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { AuthContext } from '../context/auth-context';

const NewInvoice = (props) => {
  const auth = useContext(AuthContext)

  const user = JSON.parse(localStorage.getItem('userData'))
  const [openStatus, setOpenStatus] = useState(props.open);
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setOpenStatus(props.open);
  }, [props.open]);

  const [invoiceName, setInvoiceName] = useState()
  const [invoiceDate, setInvoiceDate] = useState()
  const [email, setEmail] = useState()
  const [companyName, setCompanyName] = useState()
  const [address, setAddress] = useState()
  const [zipcode, setZipcode] = useState()

  const [invoiceDescription, setInvoiceDescription] = useState()
  const [invoiceStatement, setInvoiceStatement] = useState()
  const [name, setName] = useState()
  const [payment, setPayment] = useState()

  const [items, setItems] = useState([{ name: '', qty: 0, price: 0 }]);

  const [countries, setCountries] = useState()
  const [selectedCountry, setSelectedCountry] = useState()

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
  
  const callStripe = async () => {
    await connectToService('stripe', user.userId, user.token);
  };  

  const [invoiceService, setInvoiceService] = useState() 
  
  const serviceOptions = [
    { value: 'stripe', label: 'Stripe' }
  ];

  const handleService = (e) => {
    if (e === true) {
      setInvoiceService('stripe')
      callStripe();
    } 
  };

  const createInvoice = async (event) => {
    event.preventDefault()
  
    if(!invoiceName || !invoiceDate || !email || items.length === 0 || !companyName || !address || !selectedCountry || !zipcode) {
      toast.error('Required inputs cant be empty!', {position: toast.POSITION.BOTTOM_CENTER})
      return;
    }
  
    try {
        setIsLoading(true)
        
        const response = await axios.post(
          `http://localhost:5000/server/api/connect/stripe/createinvoice`,
          { 
            invoicename: invoiceName,
            invoicedescription: invoiceDescription,
            invoicestatement: invoiceStatement,
            name: name,
            date: invoiceDate, 
            email: email, 
            companyName: companyName,
            address: address, 
            country: selectedCountry, 
            zip: zipcode,
            items: items,
            payment: payment,
            service: invoiceService
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + user.token,
            },
          }
        );
  
        if(response.data.message === 'global_success') {
          props.onUpdate()
          setItems([{ name: '', qty: 0, price: 0 }])
        }
  
        setIsLoading(false)
    } catch (err) {
        setIsLoading(false)
        toast.error(err, {position: toast.POSITION.BOTTOM_CENTER})
    }

  }

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const addNewItem = () => {
    const newItem = { name: '', qty: 0, price: 0 };
    setItems([...items, newItem]);
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
            <Modal.Title>New invoice</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form className="global-form" onSubmit={createInvoice}>
                <Form.Group className="mb-3" controlId="modalinvoiceForm.invoiceName">
                  <Form.Label>Invoice name</Form.Label>
                  <Form.Control type="text" placeholder="Invoice name" onChange={(e) => setInvoiceName(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="modalinvoiceForm.description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Description"
                    onChange={(e) => setInvoiceDescription(e.target.value)}
                    rows={4}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="modalinvoiceForm.email">
                    <Form.Label>Account email</Form.Label>
                    <Form.Control
                    type="text"
                    placeholder="Account Email"
                    className="global-formcontrol"
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="modalinvoiceForm.statement">
                    <Form.Label>Statement decriptor</Form.Label>
                    <Form.Control
                    type="text"
                    placeholder="Statement decriptor"
                    className="global-formcontrol"
                    onChange={(e) => setInvoiceStatement(e.target.value)}
                    />
                </Form.Group>

                <hr />

                <Form.Group className="mb-3" controlId="modalinvoiceForm.name">
                    <Form.Label>Client name</Form.Label>
                    <Form.Control
                    type="text"
                    placeholder="Name"
                    className="global-formcontrol"
                    onChange={(e) => setName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="modalinvoiceForm.companyname">
                    <Form.Label>Company name</Form.Label>
                    <Form.Control
                    type="text"
                    placeholder="Company Name"
                    className="global-formcontrol"
                    onChange={(e) => setCompanyName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="modalinvoiceForm.address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                    type="text"
                    placeholder="Address"
                    className="global-formcontrol"
                    onChange={(e) => setAddress(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="modalinvoiceForm.country">
                    <Form.Label>Country</Form.Label>
                    <Select 
                    className="global-select"
                    classNamePrefix="custom-select-modal"
                    placeholder="Select country"
                    options={countries} 
                    onChange={(e) => setSelectedCountry(e)}
                    styles={customStyles}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="modalinvoiceForm.zip">
                    <Form.Label>Zip code</Form.Label>
                    <Form.Control
                    type="text"
                    placeholder="Zip code"
                    className="global-formcontrol"
                    onChange={(e) => setZipcode(e.target.value)}
                    />
                </Form.Group>

                <hr />

                {items.map((item, index) => (
                  <Row key={`item-invoice` + index}>
                    <Col xs={12}>
                      <Form.Group className="mb-3" controlId={`modalinvoiceForm.itemName${index}`}>
                        <Form.Label>Item name</Form.Label>

                        <Form.Control
                          type="text"
                          placeholder="Item Name"
                          className="global-formcontrol"
                          value={item.name}
                          onChange={(e) => {
                            const updatedItems = [...items];
                            updatedItems[index].name = e.target.value;
                            setItems(updatedItems);
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={9} className="pr-8">
                      <Form.Group className="mb-3" controlId={`modalinvoiceForm.itemPrice${index}`}>
                        <Form.Label>Amount</Form.Label>

                        <Form.Control
                          type="number"
                          placeholder="Price"
                          className="global-formcontrol"
                          value={item.price}
                          onChange={(e) => {
                            const updatedItems = [...items];
                            updatedItems[index].price = parseFloat(e.target.value);
                            setItems(updatedItems);
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={3} className="pl-8">
                      <Form.Group className="mb-3" controlId={`modalinvoiceForm.itemQty${index}`}>
                        <Form.Label>Qty</Form.Label>

                        <Form.Control
                          type="number"
                          placeholder="Qty"
                          className="global-formcontrol"
                          value={item.qty}
                          onChange={(e) => {
                            const updatedItems = [...items];
                            updatedItems[index].qty = parseInt(e.target.value);
                            setItems(updatedItems);
                          }}
                        />
                      </Form.Group>
                    </Col>

                  </Row>
                ))}

                <a
                variant="light"
                className="add-new-item-mobile"
                onClick={addNewItem}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M6.41699 6.4165V4.08317H7.58366V6.4165H9.91699V7.58317H7.58366V9.9165H6.41699V7.58317H4.08366V6.4165H6.41699ZM7.00033 12.8332C3.77866 12.8332 1.16699 10.2215 1.16699 6.99984C1.16699 3.77817 3.77866 1.1665 7.00033 1.1665C10.222 1.1665 12.8337 3.77817 12.8337 6.99984C12.8337 10.2215 10.222 12.8332 7.00033 12.8332ZM7.00033 11.6665C9.57767 11.6665 11.667 9.57718 11.667 6.99984C11.667 4.42251 9.57767 2.33317 7.00033 2.33317C4.423 2.33317 2.33366 4.42251 2.33366 6.99984C2.33366 9.57718 4.423 11.6665 7.00033 11.6665Z" fill="url(#paint0_linear_181_3270)"/>
                  <defs>
                  <linearGradient id="paint0_linear_181_3270" x1="7.00033" y1="1.1665" x2="7.00033" y2="12.8332" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#BF5AF2"/>
                  <stop offset="1" stopColor="#9444BC"/>
                  </linearGradient>
                  </defs>
                  </svg>

                  Add new item
                </a>

                <hr />

                <Row>
                      <Col xs={12} className="mb-2">
                        <div className="like-input" style={{ padding: '15px' }}>Custom due date</div>
                      </Col>
                      <Col xs={12}>
                        <Form.Group className="mb-3" controlId="modalinvoiceForm.date">            
                          <DatePicker
                          onChange={(date) => {
                            setInvoiceDate(date); 
                          }}
                          selected={invoiceDate}
                            showDisabledMonthNavigation
                          placeholderText="Invoice Date"
                          className="form-control custom-datepicker"
                          />
                        </Form.Group>
                      </Col>
                </Row>

                <div key={`inline-radio`} className="my-3">
                          <Form.Check
                            label="Request payment"
                            name="payment"
                            type={'radio'}
                            id={`inline-radio-payment`}
                            onChange={(e) => setPayment('request')}
                          />
                          <Form.Check
                            label="Autocharge customer"
                            name="payment"
                            type={'radio'}
                            id={`inline-radio-payment-auto`}
                            onChange={(e) => setPayment('auto')}
                          />             
                </div>

                <Form.Group className="my-3" controlId="modalinvoiceForm.service">
                    <Form.Label>Connect Stripe</Form.Label>

                    <Form.Check
                        type="switch"
                        id="connect_stripe"
                        onChange={(e) => handleService(e.target.checked)}
                    />
                </Form.Group>
                    
                <div className='modal-submit-btn'>
                    <Button variant='dark' size='lg' className='w-100' type='submit'>
                    Create Invoice
                    </Button>
                </div>

              </Form>
          </Modal.Body>
        </Modal>

        </>
      )}

    {openStatus === true && (
      <>
            <div className="section-title custom-padding-top">
                    <h1>Create Invoice</h1>

                    <div className="space20px"></div>

                    <Form className="global-form" onSubmit={createInvoice}>
                        <Row className="form-row g-0">
                            <Col sm={3}>
                                <Form.Group className="mb-3" controlId="invoiceForm.name">
                                    <Form.Control
                                    type="text"
                                    placeholder="Invoice Name"
                                    className="global-formcontrol"
                                    onChange={(e) => setInvoiceName(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="invoiceForm.email">
                                    <Form.Control
                                    type="text"
                                    placeholder="Account Email"
                                    className="global-formcontrol"
                                    onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="invoiceForm.description">
                                  <Form.Control
                                    as="textarea"
                                    placeholder="Description"
                                    onChange={(e) => setInvoiceDescription(e.target.value)}
                                    rows={4}
                                  />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="invoiceForm.statement">
                                    <Form.Control
                                    type="text"
                                    placeholder="Statement decriptor"
                                    className="global-formcontrol"
                                    onChange={(e) => setInvoiceStatement(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col sm={3} className="col-pd">
                                <Form.Group className="mb-3" controlId="invoiceForm.name">
                                    <Form.Control
                                    type="text"
                                    placeholder="Name"
                                    className="global-formcontrol"
                                    onChange={(e) => setName(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="invoiceForm.companyname">
                                    <Form.Control
                                    type="text"
                                    placeholder="Company Name"
                                    className="global-formcontrol"
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="invoiceForm.address">
                                    <Form.Control
                                    type="text"
                                    placeholder="Address"
                                    className="global-formcontrol"
                                    onChange={(e) => setAddress(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="invoiceForm.country">
                                    <Select 
                                    className="global-select"
                                    classNamePrefix="custom-select"
                                    placeholder="Select country"
                                    options={countries} 
                                    onChange={(e) => setSelectedCountry(e)}
                                    styles={customStyles}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="invoiceForm.zip">
                                    <Form.Control
                                    type="text"
                                    placeholder="Zip City"
                                    className="global-formcontrol"
                                    onChange={(e) => setZipcode(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                              <React.Fragment>
                                {items.map((item, index) => (
                                  <Row key={`item-invoice` + index}>
                                    <Col sm={7}>
                                      <Form.Group className="mb-3" controlId={`invoiceForm.itemName${index}`}>
                                        <Form.Control
                                          type="text"
                                          placeholder="Item Name"
                                          className="global-formcontrol"
                                          value={item.name}
                                          onChange={(e) => {
                                            const updatedItems = [...items];
                                            updatedItems[index].name = e.target.value;
                                            setItems(updatedItems);
                                          }}
                                        />
                                      </Form.Group>
                                    </Col>
                                    <Col sm={2}>
                                      <Form.Group className="mb-3" controlId={`invoiceForm.itemQty${index}`}>
                                        <Form.Control
                                          type="number"
                                          placeholder="Qty"
                                          className="global-formcontrol"
                                          value={item.qty}
                                          onChange={(e) => {
                                            const updatedItems = [...items];
                                            updatedItems[index].qty = parseInt(e.target.value);
                                            setItems(updatedItems);
                                          }}
                                        />
                                      </Form.Group>
                                    </Col>
                                    <Col sm={3}>
                                      <Form.Group className="mb-3" controlId={`invoiceForm.itemPrice${index}`}>
                                        <Form.Control
                                          type="number"
                                          placeholder="Price"
                                          className="global-formcontrol"
                                          value={item.price}
                                          onChange={(e) => {
                                            const updatedItems = [...items];
                                            updatedItems[index].price = parseFloat(e.target.value);
                                            setItems(updatedItems);
                                          }}
                                        />
                                      </Form.Group>
                                    </Col>
                                  </Row>
                                ))}

                               <Button
                                variant="light"
                                className="general-light-btn"
                                onClick={addNewItem}
                               >
                                Add new item
                               </Button>

                               <div key={`inline-radio`} className="my-3">
                                          <Form.Check
                                            inline
                                            label="Request payment"
                                            name="payment"
                                            type={'radio'}
                                            id={`inline-radio-payment`}
                                            onChange={(e) => setPayment('request')}
                                          />
                                         <Form.Check
                                            inline
                                            label="Autocharge customer"
                                            name="payment"
                                            type={'radio'}
                                            id={`inline-radio-payment-auto`}
                                            onChange={(e) => setPayment('auto')}
                                          />             
                               </div>
                               </React.Fragment>

                               <Row>
                                      <Col sm={7}>
                                        <div className="like-input">Custom due date</div>
                                      </Col>
                                      <Col sm={5}>
                                        <Form.Group className="mb-3" controlId="invoiceForm.date">            
                                          <DatePicker
                                          onChange={(date) => {
                                            setInvoiceDate(date); 
                                          }}
                                          selected={invoiceDate}
                                           showDisabledMonthNavigation
                                          placeholderText="Invoice Date"
                                          className="form-control custom-datepicker"
                                          />
                                        </Form.Group>
                                      </Col>
                               </Row>

                                <Form.Group className="my-3" controlId="invoiceForm.service">
                                <Form.Label>Connect Stripe</Form.Label>

                                <Form.Check
                                    type="switch"
                                    id="connect_stripe"
                                    onChange={(e) => handleService(e.target.checked)}
                                />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button
                          variant="light"
                          className="general-light-btn"
                          type="submit"
                          >
                            Send Invoice
                        </Button>
                    </Form>

            </div>
    </>
    )}
    </>
  )
}

export default NewInvoice;