import React from 'react';

import InvoiceItem from './InvoiceItem';

import { Table, Row, Col } from 'react-bootstrap';

const InvoicesList = props => {

  if (props.items.length === 0) {
    return (
      <div className="center-noresults">
           No results
      </div>
    );
  }

  return (
    <div className="custom-list">
        {props.mobile === true ? (
          <>
          <Row>
          {props.items.map((invoice, index) => (
              <React.Fragment key={`i` + index}>
                <Col sm={12}>
                  <div className="bg-mobile-block position-relative">
                    <Row>
                    <InvoiceItem
                      index={index + 1}
                      key={invoice._id}
                      id={invoice._id}
                      name={invoice.name}
                      description={invoice.invoicedescription}
                      date={invoice.date}
                      items={invoice.items}
                      email={invoice.email}
                      companyName={invoice.companyName}
                      address={invoice.address}
                      country={invoice.country}
                      zip={invoice.zip}
                      author={invoice.author}
                      invoice_id={invoice.invoice_id}
                      status={invoice.status}
                      timestamp={invoice.timestamp}
                      currency={invoice.currency}
                      onUpdate={props.onUpdateInvoice}
                      mobile={true}
                    />
                    </Row>
                  </div>
                </Col>
              </React.Fragment>
          ))}
          </Row>
          </>
        ) : (
          <>
          <Table responsive>
          <thead>
          <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
          </tr>
          </thead>
          <tbody>
          {props.items.map((invoice, index) => (
              <InvoiceItem
                  index={index + 1}
                  key={invoice._id}
                  id={invoice._id}
                  name={invoice.name}
                  date={invoice.date}
                  items={invoice.items}
                  email={invoice.email}
                  companyName={invoice.companyName}
                  address={invoice.address}
                  country={invoice.country}
                  zip={invoice.zip}
                  author={invoice.author}
                  invoice_id={invoice.invoice_id}
                  status={invoice.status}
                  timestamp={invoice.timestamp}
                  currency={invoice.currency}
                  onUpdate={props.onUpdateInvoice}
                  mobile={false}
              />
          ))}
          </tbody>
          </Table>
          </>
        )}
    </div>
  );
};

export default InvoicesList;
