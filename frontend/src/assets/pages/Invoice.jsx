import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container, Table, Row, Col, Button } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import moment from 'moment';
import LoadingSpinner from '../UI/LoadingSpinner';

const PaymentForm = ({ invoiceId, userToken, handleSuccess, stripeInvoiceId, email }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const { paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email,
        },
      });

      const response = await axios.post(
        `http://localhost:5000/server/api/connect/payinvoice/${invoiceId}`,
        {
          paymentMethodId: paymentMethod.id,
          receipt_email: email,
          stripeInvoiceId: stripeInvoiceId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + userToken,
          },
        }
      );

      if (response.data.message === 'Payment successful') {
        handleSuccess();
      } else {
        toast.error('Payment failed. Please try again.', { position: toast.POSITION.BOTTOM_CENTER });
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      toast.error('Error processing payment. Please try again later.', { position: toast.POSITION.BOTTOM_CENTER });
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <CardElement className="custom-elements" />
        <Button size="lg" variant="dark" className="w-100 my-4" type="submit" disabled={!stripe || isLoading}>
          Pay Invoice
        </Button>
      </form>
    </>
  );
};

const Invoice = () => {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('userData'));
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState();

  const fetchInvoice = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/server/api/getinvoice/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.token,
        },
      });

      console.log(response)

      setToken(response.data.token)

      setInvoice(response.data.invoice);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error('Error fetching invoice. Please try again later.', {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleSuccess = async () => {
    setInvoice((prevInvoice) => ({ ...prevInvoice, status: 2 }));
    toast.success('Payment successful!', { position: toast.POSITION.BOTTOM_CENTER });
  };

  const formatDate = (dateString) => {
    const formattedDate = moment(dateString).format('MM.DD.YYYY');
    return formattedDate;
  };

  const totalAmount = invoice && invoice?.items.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2);

  const downloadInvoice = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/server/api/downloadinvoice/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.token,
        },
        responseType: 'blob',
      });

      const downloadUrl = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
    } catch (err) {
      console.log(err);
      toast.error(err, { position: toast.POSITION.BOTTOM_CENTER });
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      {isLoading && <LoadingSpinner asOverlay={true} />}

      {invoice && (
        <Container fluid>
          <div className="user-panel updatecss">
            <h1>Invoice Details</h1>

            <div className="user-panel-form">
              <Row>
                <Col md={6}>
                  <div className="custom-invoice-field">
                    <label>Invoice name</label> <br />
                    {invoice.invoicename}
                  </div>

                  <div className="custom-invoice-field">
                    <label>Invoice to</label> <br />
                    {invoice.email}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="custom-invoice-field">
                    <label>Stripe Invoice ID</label> <br />
                    {invoice.invoice_id}
                  </div>

                  <div className="custom-invoice-field">
                    <label>Date</label> <br />
                    {formatDate(invoice.date)}
                  </div>
                </Col>
              </Row>

              <hr />

              {invoice.items && (
                <>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items &&
                        invoice.items.map((item, index) => {
                          return (
                            <tr key={`iteminvoice` + index}>
                              <td>{item.name}</td>
                              <td>{item.qty}</td>
                              <td>{item.price.toFixed(2)} <b>{invoice.currency}</b></td>
                            </tr>
                          );
                        })}
                      <tr>
                        <td colSpan="2">Total:</td>
                        <td>{totalAmount} <b>{invoice.currency}</b></td>
                      </tr>
                    </tbody>
                  </Table>
                </>
              )}

              {invoice.status !== 2 && invoice.invoice_id ? (
                <>
                  <Row>
                    <Col sm={12}>
                      {token && (
                        <>
                        <Elements stripe={loadStripe(token)}>
                          <PaymentForm
                            invoiceId={id}
                            userToken={user.token}
                            handleSuccess={handleSuccess}
                            stripeInvoiceId={invoice?.invoice_id}
                            email={invoice?.email}
                          />
                        </Elements>
                        </>
                      )}
                    </Col>
                  </Row>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="dark"
                    className="w-100 my-4"
                    onClick={() => downloadInvoice()}
                    disabled={isLoading}
                  >
                    Download Invoice
                  </Button>
                </>
              )}
            </div>

            <div className="footer-invoice">Powered by <b>INCIO</b></div>
          </div>
        </Container>
      )}

    </React.Fragment>
  );
};

export default Invoice;
