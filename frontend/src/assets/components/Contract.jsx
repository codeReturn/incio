import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios';

import { Container, Form, Button, Modal, Table } from 'react-bootstrap';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoadingSpinner from '../UI/LoadingSpinner';

import SignatureCanvas from 'react-signature-canvas';

const Contract = () => {
    const id = useParams().id;
    const user = JSON.parse(localStorage.getItem('userData'))


    const [contract, setContract] = useState();
    const [otherSign, setOtherSign] = useState(false)
    const [verified, setVerified] = useState(false)
    const [isLoading, setIsLoading] = useState();

    const fetchContract = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get(
                `http://localhost:5000/server/api/getcontract/${id}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token,
                  },
                }
            );
            
            setContract(response.data.contract)
            setOtherSign(response.data.contract.otherSign)

            setIsLoading(false);
        } catch (err) {
            if(err.response.data.message === "Error while fetching contract!"){
                window.location.href = "/"
                return;
            }

            console.log(err)

            toast.error(err, {position: toast.POSITION.BOTTOM_CENTER})
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchContract()
    }, [id]);

    const [showModal, setShowModal] = useState(false);

    const [emailValue, setEmailValue] = useState()

    const verifyEmail = (email) => {
        if(contract && contract.otherSign === true && email === contract.signerEmail){
            setOtherSign(true)
            setVerified(true)
        } else {
            toast.error('You dont have access!', {position: toast.POSITION.BOTTOM_CENTER})
            setIsLoading(false)
        }
    }

    const signaturePadRef = useRef(null);

    const handleSignatureClick = (event) => {
        if (event.target.classList.contains('signer-signature-container') || event.target.parentElement.classList.contains('signer-signature-container') && otherSign === false) {
            setShowModal(true);
        }
    };
        

    const handleModalClose = () => {
      setShowModal(false);
    };
  
    const saveSignature = async () => {
        if(!signaturePadRef.current.toDataURL()) {
            toast.error('Signature cant be empty!', {position: toast.POSITION.BOTTOM_CENTER})
            setIsLoading(false)
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/server/api/signcontract",
                {
                  signature: signaturePadRef.current.toDataURL(),
                  id: id,
                  signer: emailValue
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token,
                  }
                }
            );

            if(response.data.message === "global_success"){
                handleModalClose()
                fetchContract()
            }
        } catch (err) {
            console.log(err)
            toast.error(err, {position: toast.POSITION.BOTTOM_CENTER})
            setIsLoading(false)
        }
    }

    const downloadPDF = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/server/api/downloadcontract/${id}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + user.token,
              },
              responseType: 'blob', 
            }
          );
      
          const downloadUrl = URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', `contract_${id}.pdf`); 
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
      
    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current && contract) {
            const signatureContainer = divRef.current.querySelector('.signer-signature-container');
            if (signatureContainer) {
                signatureContainer.addEventListener('click', handleSignatureClick);
            }
        }
    
        return () => {
            if (divRef.current && contract) {
                const signatureContainer = divRef.current.querySelector('.signer-signature-container');
                if (signatureContainer) {
                    signatureContainer.removeEventListener('click', handleSignatureClick);
                }
            }
        };
    }, [contract]);

    return (
        <>
        {isLoading && <LoadingSpinner asOverlay={true} />}

        <Container>
        {otherSign && !verified ? (
            <>
            <div className="user-panel">
                <div className="user-panel-form">
                        <Form.Group className="mb-3" controlId="loginForm.email">
                            <Form.Control type="email" placeholder="Email" onChange={(e) => setEmailValue(e.target.value)} />
                        </Form.Group>

                        <div className="user-panel-buttons">
                            <Button variant="light" type="submit" className="float-end" size="sm" onClick={() => verifyEmail(emailValue)}>Verify</Button>
                        </div>
                </div>
            </div>
            </>
        ) : (
            <>
            {contract && (
                <>
                <Modal show={showModal} onHide={handleModalClose}>
                        <Modal.Header closeButton>
                        <Modal.Title>Signature</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <p>Write your signature here:</p>
                        <SignatureCanvas
                            ref={signaturePadRef}
                            canvasProps={{
                            style: { width: '100%', height: '300px', backgroundColor: '#f2f2f2' },
                            }}
                        />
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>
                            Cancel
                        </Button>
                        <Button variant="dark" onClick={saveSignature}>
                            Save Signature
                        </Button>
                        </Modal.Footer>
                </Modal>

                <Button variant="light" className="general-light-btn m-1 pdf-download-btn" onClick={downloadPDF}>
                            Download PDF
                </Button>

                <div className="contract-body" onClick={handleSignatureClick} ref={divRef}>
                    <div dangerouslySetInnerHTML={{ __html: contract.contractContent }} />
                </div>
                </>
            )}
            </>
        )}
        </Container>
        </>
    )
}

export default Contract;