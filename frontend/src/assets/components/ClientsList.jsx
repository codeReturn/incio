import React from 'react';

import ClientItem from './ClientItem';

import { Table, Row, Col } from 'react-bootstrap';

const ClientsList = props => {

  if (props.items.length === 0) {
    return (
      <div className="center-noresults">
           No results
      </div>
    );
  }

  return (
    <div className="custom-list">
        {props.mobile === false ? (
          <>
          <Table responsive>
          <thead>
          <tr>
              <th>Name</th>
              <th>Company Name</th>
              <th>Email Address</th>
              <th>Phone</th>
              <th>Income</th>
              <th>Outcome</th>
              <th></th>
          </tr>
          </thead>
          <tbody>
          {props.items.map((client, index) => (
              <ClientItem
                  index={index + 1}
                  key={client._id}
                  id={client._id}
                  fullName={client.fullName}
                  email={client.email}
                  phone={client.phone}
                  address={client.address}
                  zip={client.zip}
                  country={client.country}
                  companyName={client.companyName}
                  companyEmail={client.companyEmail}
                  companyPhone={client.companyPhone}
                  companyAddress={client.companyAddress}
                  companyZip={client.companyZip}
                  companyCountry={client.companyCountry}
                  clientCard={client.clientCard}
                  clientCardExpires={client.clientCardExpires}
                  clientCardCCV={client.clientCardCCV}
                  image={client.image}
                  income={client.income}
                  outcome={client.outcome}
                  author={client.author}
                  active={client.active}
                  role={client.role}
                  onUpdate={props.onUpdateClient}
                  mobile={false}
              />
          ))}
          </tbody>
          </Table>
          </>
        ) : (
          <>
            <Row>
            <Col sm={12}>
            {props.items.map((client, index) => (
                <ClientItem
                  index={index + 1}
                  key={client._id}
                  id={client._id}
                  fullName={client.fullName}
                  email={client.email}
                  phone={client.phone}
                  address={client.address}
                  zip={client.zip}
                  country={client.country}
                  companyName={client.companyName}
                  companyEmail={client.companyEmail}
                  companyPhone={client.companyPhone}
                  companyAddress={client.companyAddress}
                  companyZip={client.companyZip}
                  companyCountry={client.companyCountry}
                  clientCard={client.clientCard}
                  clientCardExpires={client.clientCardExpires}
                  clientCardCCV={client.clientCardCCV}
                  image={client.image}
                  income={client.income}
                  outcome={client.outcome}
                  author={client.author}
                  active={client.active}
                  role={client.role}
                  onUpdate={props.onUpdateClient}
                  mobile={true}
                />
            ))}
            </Col>
          </Row>
          </>
        )}
    </div>
  );
};

export default ClientsList;
