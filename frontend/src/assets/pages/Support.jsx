import React from 'react';
import { Container, Row, Col, Form, Button, Accordion } from 'react-bootstrap';

const SupportPage = () => {
  return (
    <>
    <div className="page">
      <Row>
        <Col>
          <h2>Support</h2>
          <p>
            Welcome to our support section! Here, you can find all the information you need to get help and assistance.
            If you have any questions or need further assistance, please don't hesitate to contact us at:
          </p>
          <p>Email: <a href="mailto:support@incio.io">support@incio.io</a></p>
        </Col>
      </Row>

      <hr />

      <Row>
        <Col md={6}>
          <h4>Contact Us</h4>
          <Form className="global-form">
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Control type="text" placeholder="Enter your name" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control type="email" placeholder="Enter your email" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicMessage">
              <Form.Control as="textarea" rows={4} placeholder="Enter your message" />
            </Form.Group>
            <Button variant="light" className="global-light-btn" type="submit">
              Send
            </Button>
          </Form>
        </Col>
        <Col md={6}>
          <h4>FAQs</h4>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>How to integrate your zoom?</Accordion.Header>
              <Accordion.Body>
              Go on settings, click on zoom - there you will be redirected to a page where you can give Incio some permissions to manage your zoom account, click Allow and you are all setup.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>How to disconnect your zoom account?</Accordion.Header>
              <Accordion.Body>
              If your zoom is connect with your profile go on settings, click on zoom - there you will have disconnect zoom option click on it - your zoom will be disconnected.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>How to integrate your Stripe?</Accordion.Header>
              <Accordion.Body>
              On Invoices or Settings Click on Connect Stripe - There you will be redirected to a Stripe Page and click on Allow Permissions for your stripe account to be connected with Incio.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>How to disconnect your Stripe?</Accordion.Header>
              <Accordion.Body>
              In Settings Click on Stripe - A popup will appear asking you if you would like to disconnect your stripe - click Yes, your stripe account will be disconnected.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
              <Accordion.Header>Payments and Billing for the App?</Accordion.Header>
              <Accordion.Body>
              For now the Incio app is in beta version so you can use it for precisely $0/month.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="5">
              <Accordion.Header>How to delete your Incio Account?</Accordion.Header>
              <Accordion.Body>
              Click on settings - There will be an option - Delete your account - Simply click on it and follow the process - your account will be deleted.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
      </div>
    </>
  );
};

export default SupportPage;
