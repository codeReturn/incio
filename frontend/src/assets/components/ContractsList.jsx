import React from 'react';

import ContractItem from './ContractItem';

import { Table, Row, Col } from 'react-bootstrap';

const ContractsList = props => {

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
            <Col sm={12}>
            {props.items.map((contract, index) => (
              <ContractItem
                  index={index + 1}
                  key={contract._id}
                  id={contract._id}
                  title={contract.title}
                  date={contract.date}
                  status={contract.status}
                  othersign={contract.otherSign}
                  signature={contract.signature}
                  signedSignature={contract.signedSignature}
                  onUpdate={props.onUpdateContract}
                  onDisplay={props.onDisplayContract}
                  signerEmail={contract.signerEmail}
                  contractContent={contract.contractContent}
                  mobile={true}
              />
            ))}
            </Col>
          </Row>
          
          </>
        ) : (
          <>
          <Table responsive>
          <thead>
          <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
          </tr>
          </thead>
          <tbody>
          {props.items.map((contract, index) => (
              <ContractItem
                  index={index + 1}
                  key={contract._id}
                  id={contract._id}
                  title={contract.title}
                  date={contract.date}
                  status={contract.status}
                  othersign={contract.otherSign}
                  signature={contract.signature}
                  signedSignature={contract.signedSignature}
                  onUpdate={props.onUpdateContract}
                  onDisplay={props.onDisplayContract}
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

export default ContractsList;
