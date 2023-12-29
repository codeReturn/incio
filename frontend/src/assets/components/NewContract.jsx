import React, { useState, useRef, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../UI/LoadingSpinner';

import plusGreenIcon from '../images/plus-green.png'

import { AuthContext } from '../context/auth-context';

const DraggableInput = ({ id, label, value, onDragStart, onChange }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', `${label}: ${value}`);
    onDragStart(e, id, label, value);
  };

  const handleLabelChange = (e) => {
    onChange(id, 'label', e.target.value);
  };

  const handleValueChange = (e) => {
    onChange(id, 'value', e.target.value);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{ padding: '10px 5px', margin: '0px', cursor: 'move' }}
    >
      <Form.Group controlId={id}>
        <Row>
          <Col>
            <Form.Control type="text" placeholder="Label" value={label} onChange={handleLabelChange} />
          </Col>
          <Col>
            <Form.Control type="text" placeholder="Value" value={value} onChange={handleValueChange} />
          </Col>
        </Row>
      </Form.Group>
    </div>
  );
};

const handleInputClick = () => {
  const inputElement = inputRef.current;
  if (inputElement) {
    inputElement.value = '';
  }
};

const DefaultInput = ({ id, label, onChange }) => {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    onChange(id, e.target.value);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', `${label}: ${id}`);
  };

  const handleInputFocus = () => {
    handleInputClick();
  };

  const handleInputClick = () => {
    if (inputRef && inputRef.current) {
      inputRef.current.select();
    }
  };

  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('click', handleInputClick);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('click', handleInputClick);
      }
    };
  }, []);

  return (
    <Col sm={6}>
      <div
        draggable
        onDragStart={handleDragStart}
        style={{ padding: '10px 5px', margin: '0px', cursor: 'move' }}
      >
        <Form.Group controlId={id}>
          <Form.Label className="display-on-mobile-device">{label}</Form.Label>
          <Form.Control
            ref={inputRef}
            placeholder={label}
            type="text"
            readOnly
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="drop-default-input"

          />
        </Form.Group>
      </div>
    </Col>
  );
};

const NewContract = (props) => {
  const auth = useContext(AuthContext)
  const user = JSON.parse(localStorage.getItem('userData'));
  const [isLoading, setIsLoading] = useState(false);
  const [openStatus, setOpenStatus] = useState(props.open);

  const [showCreate, setShowCreate] = useState(false);

  const handleClose = () => {
    setShowCreate(false);
    props.onClose();
  }
  const handleShow = () => setShowCreate(true);

  const [defaultInputs, setDefaultInputs] = useState([
    { id: 'date', label: 'Date', value: 'Date' },
    { id: 'company', label: 'Company Address', value: 'Company Address' },
    { id: 'country', label: 'Country', value: 'Country' },
    { id: 'zip', label: 'ZIP', value: 'ZIP' },
    { id: 'city', label: 'City', value: 'City' },
  ]);

  const handleDefaultInputChange = (id, value) => {
    setDefaultInputs((prevInputs) =>
      prevInputs.map((input) => {
        if (input.id === id) {
          return { ...input, value };
        }
        return input;
      })
    );
  };

  useEffect(() => {
    setOpenStatus(props.open);
  }, [props.open]);

  const [formData, setFormData] = useState({
    signature: '',
    contractContent: '',
    inputs: [],
  });

  const [otherSign, setOtherSign] = useState(false);
  const [signerEmail, setSignerEmail] = useState('');
  const [contractTitle, setContractTitle] = useState('');

  const [signatureDropped, setSignatureDropped] = useState(false)

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const signaturePadRef = useRef(null);

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSave = () => {
    const signatureDataUrl = signaturePadRef.current.toDataURL();
    setFormData({ ...formData, signature: signatureDataUrl });
  
    // Insert the signature image into the clicked div
    const editor = window.tinymce.get('custom-editor');
    const selectedNode = editor.selection.getNode();
  
    if (selectedNode.className === 'signature-container') {
      const img = document.createElement('img');
      img.src = signatureDataUrl;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.setAttribute('contenteditable', 'false'); // Make the image non-editable
  
      // Clear the existing content in the div
      selectedNode.innerHTML = '';
  
      // Append the image to the div
      selectedNode.appendChild(img);
  
      // Insert a line break after the signature container
      editor.selection.setRng(editor.dom.createRng());
      editor.execCommand('InsertBr');
  
      // Set the focus after the line break
      const newParagraph = editor.selection.getNode();
      editor.selection.setCursorLocation(newParagraph, 0);
    }
  
    setShowModal(false);
  };
  
  
  const handleInputChange = (id, field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      inputs: prevFormData.inputs.map((input) => {
        if (input.id === id) {
          return { ...input, [field]: value };
        }
        return input;
      }),
    }));
  };

  const handleSignatureClick = () => {
    setShowModal(true);
  };

  const handleEditorChange = (content, editor) => {
    setFormData({ ...formData, contractContent: content });
  };

  const handleAddInput = () => {
    const newInput = { id: Date.now(), label: '', value: '' };
    setFormData((prevFormData) => ({
      ...prevFormData,
      inputs: [...prevFormData.inputs, newInput],
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if(!contractTitle){
      toast.error('Contract title is required', {position: toast.POSITION.BOTTOM_CENTER})
      return;

    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        'https://inciohost.com/server/api/createcontract',
        {
          formData: formData,
          title: contractTitle,
          otherSign: otherSign,
          signerEmail: signerEmail,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + user.token,
          },
        }
      );

      if (response.data.message === 'global_success') {
        props.onUpdate();
        handleClose()
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error)
      setIsLoading(false);
      toast.error(error?.response?.data?.message, {position: toast.POSITION.BOTTOM_CENTER})
    }
  };

  const handleUploadModalClose = () => {
    setShowUploadModal(false);
    props.onCloseUpload()
  };

  const handleUploadModalSave = (e) => {
    const file = e.target.files[0];
  
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('file', file);
  
      axios.post('https://inciohost.com/server/api/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + user.token,
        },
      })
      .then((response) => {
        let convertedHTML = response.data.html;
        tinymce.activeEditor.setContent(convertedHTML);      
  
        const editorBody = tinymce.activeEditor.getBody();
        tinymce.activeEditor.dom.setStyle(editorBody, 'padding', '20px');
        tinymce.activeEditor.dom.setStyle(editorBody, 'background-color', '#f8f8f8');
        tinymce.activeEditor.dom.setStyle(editorBody, 'border', '1px solid #ccc');
  
        setShowUploadModal(false);
      })
      .catch((error) => {
        console.error('Error converting PDF:', error);
      });
    } else {
      // Handle invalid file type
      alert('Invalid file type. Please select a PDF file.');
    }
  };  
    
  const handleDragStart = (e, id, label, value) => {
    e.dataTransfer.setData('text/plain', `${label}: ${value}`);
  };

  function findInputContainer(node) {
    while (node) {
      if (node.classList && node.classList.contains('input-container')) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  const handleDrop = (e) => {
    e.preventDefault();
  
    const plainData = e.dataTransfer.getData('text/plain');
    const label = plainData.split(':')[0].trim();
    const inputId = plainData.split(':')[1].trim();
  
    const editor = window.tinymce.get('custom-editor');
    const isDefaultInput = defaultInputs.some((input) => input.id === inputId);
    
  
    if (isDefaultInput) {
      const highlightedClass = 'highlight-default-input';
      let placeholder;
  
      if (label === 'Date') {
        const currentDate = new Date().toLocaleString();
        placeholder = `${label}: ${currentDate}`;
      } else {
        placeholder = `${label}`;
      }
  
      const content = `<div class="input-container"><span class="${highlightedClass}" contenteditable="true">${placeholder}</span></div><div class="input-placeholder"></div>`;
  
      editor.execCommand('mceInsertContent', false, content);
  
      const insertedElement = editor.getBody().lastChild;
      const editableElement = insertedElement.firstChild;
  
      editableElement.addEventListener('click', (event) => {
        if (event.target.classList.contains(highlightedClass)) {
          event.target.innerText = '';
        }
      });
  
      const inputContainer = findInputContainer(editableElement);
      const placeholderElement = inputContainer.nextElementSibling;
  
      const insertIntoParagraph = (paragraph) => {
        const selection = editor.selection.getRng();
        const selectedText = editor.selection.getContent();
  
        // Check if the selection is inside a text node within the paragraph
        if (selection.startContainer.nodeType === 3 && selection.endContainer.nodeType === 3) {
          const startOffset = selection.startOffset;
          const endOffset = selection.endOffset;
  
          const textContent = paragraph.textContent;
          const beforeText = textContent.substring(0, startOffset);
          const afterText = textContent.substring(endOffset);
  
          const newContent = `${beforeText}${selectedText}${afterText}`;
          paragraph.textContent = newContent;
  
          // Place the cursor after the inserted content
          editor.selection.setCursorLocation(paragraph, beforeText.length + selectedText.length);
        } else {
          // Append the selected content to the paragraph
          paragraph.innerHTML += selectedText;
          editor.selection.setCursorLocation(paragraph, paragraph.textContent.length);
        }
      };
  
      const paragraphs = Array.from(editor.getBody().querySelectorAll('p'));
  
      // Find the paragraph containing the drop position
      const dropPosition = editor.selection.getRng().startContainer;
      const dropParagraph = paragraphs.find((paragraph) => paragraph.contains(dropPosition));
  
      if (dropParagraph) {
        insertIntoParagraph(dropParagraph);
      } else {
        // Insert a new paragraph after the placeholder element
        const newParagraph = document.createElement('p');
        newParagraph.textContent = '';
        placeholderElement.parentNode.insertBefore(newParagraph, placeholderElement);
        editor.selection.setCursorLocation(newParagraph);
      }
  
      // Set the default input as highlighted
      setDefaultInputs((prevInputs) =>
        prevInputs.map((input) => {
          if (input.id === inputId) {
            return { ...input, highlighted: true };
          }
          return { ...input, highlighted: false };
        })
      );
    } else if (label === 'Signature') {
      const uniqueDivId = `signature-div-${Date.now()}`;

      const content = `<div style="max-width:200px" id="${uniqueDivId}" class="signature-container">${label}</div>`;
      editor.execCommand('mceInsertContent', false, content);
    
      setTimeout(() => {
        const signatureDiv = editor.getBody().querySelector(`#${uniqueDivId}`);
        if (signatureDiv) {
          signatureDiv.addEventListener('click', () => {
            handleSignatureClick();
          });
        }
      }, 0);
    
      return;
    } else if (label === 'Signer Signature') {
      const uniqueDivId = `signer-signature-div-${Date.now()}`;
  
      const content = `<div style="max-width:200px" id="${uniqueDivId}" class="signer-signature-container" contenteditable="false">${label}</div>`;
      editor.execCommand('mceInsertContent', false, content);
      
      setSignatureDropped(true);
      
      return;      
    } else {
      const content = `<div>${label}: ${inputId}</div>`;
      editor.execCommand('mceInsertContent', false, content);
    }
  };
  
    
  const setup = (editor) => {
    editor.on('drop', handleDrop);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if(props.upload === true) setShowUploadModal(true)
  }, [props.upload]);


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

      {!formData.signature && (
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
              <Button variant="dark" onClick={handleModalSave}>
                Save Signature
              </Button>
            </Modal.Footer>
        </Modal>
      )}

      <Modal show={showUploadModal} onHide={handleUploadModalClose} className="display-on-mobile-device custom-mobile-modal" centered>
            <Modal.Header closeButton>
              <Modal.Title>Upload PDF</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="file-upload">
                <Form.Label>Select a PDF file:</Form.Label>
                <Form.Control type="file" accept="application/pdf" onChange={handleUploadModalSave} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleUploadModalClose}>
                Cancel
              </Button>
              <Button variant="dark" onClick={handleUploadModalSave}>
                Save PDF
              </Button>
            </Modal.Footer>
      </Modal>

      {auth.windowWidth < 650 ? (
        <>
        <Modal show={showCreate} onHide={handleClose} className="display-on-mobile-device custom-mobile-modal modal-top-global">
          <Modal.Header closeButton>
            <Modal.Title>New contract</Modal.Title>
          </Modal.Header>
          <Modal.Body>

              <Form className="global-form" onSubmit={(e) => handleFormSubmit(e)}>
                  <Form.Group className="m-1" controlId="contractmodal.name">
                      <Form.Label>Contract name</Form.Label>
                      <Form.Control type="text" placeholder="Contract name" onChange={(e) => setContractTitle(e.target.value)} />
                    </Form.Group>

                    {defaultInputs.map((input) => (
                    <DefaultInput
                      key={input.id}
                      id={input.id}
                      label={input.label}
                      onChange={handleDefaultInputChange}
                      className="mobile-padding-default-inputs"
                    />
                    ))}
                    
                    <hr />

                    <Form.Group className="m-1" controlId="contractmodal.checkbox">
                      <Form.Check
                        type="checkbox"
                        id="default-checkbox"
                        label="Require other sign"
                        onChange={(e) => setOtherSign(e.target.checked)}
                      />


                      {otherSign && (
                        <>
                          <Row>
                            <Col sm={signatureDropped ? 12 : 8}>
                              <Form.Control
                                type="text"
                                placeholder="Signer email"
                                className="global-formcontrol my-2"
                                onChange={(e) => setSignerEmail(e.target.value)}
                              />
                            </Col>
                            <Col sm={signatureDropped ? 0 : 4}>
                              {!signatureDropped && (
                                <>
                                <Button 
                                  draggable 
                                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', `Signer Signature: `); }} 
                                  variant="light" 
                                  className="add-sign-btn m-1 position-relative" 
                                  id="signer-signature-block"
                                >
                                  <img src={plusGreenIcon} className="img-fluid plus-ico-sign" /> Add Signer Signature
                                </Button>
                                </>
                              )}
                            </Col>
                          </Row>

                        </>
                      )}
                    </Form.Group>

                    <hr />

                    {!formData.signature && (
                      <Button 
                        draggable 
                        onDragStart={(e) => { e.dataTransfer.setData('text/plain', `Signature: `); }} 
                        variant="light" 
                        className="add-sign-btn m-1 position-relative" 
                        id="signature-block" 
                      >
                        <img src={plusGreenIcon} className="img-fluid plus-ico-sign" /> Add Signature
                      </Button>
                    )}

                    <hr />
                    
                    <div onDrop={handleDrop} onDragOver={handleDragOver}>
                    <Editor
                      id="custom-editor"
                      apiKey="t6q63d1371kvanxo24trq2vsehtsygtd9qkuyx6jksncumec"
                      value={formData.contractContent}
                      onEditorChange={handleEditorChange}
                      init={{
                        setup: setup,
                        height: 700,
                        menubar: false,
                        plugins: 'advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount noneditable',
                        toolbar: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | link image | charmap | print preview | anchor | searchreplace | visualblocks code fullscreen | insertdatetime media table | paste code help | wordcount',
                        extended_valid_elements: '',
                        valid_elements: '*[*]',
                        noneditable_editable_class: 'mceEditable',
                        selector: '#custom-editor',
                        forced_root_block: 'div',                  
                        content_style: `
                        .highlight-input,
                        .highlight-default-input {
                          background-color: #f2f2f2;
                          display: inline-block;
                          padding: 2px;
                          border: 1px solid gray;
                        }
                      
                        .highlight-input::after,
                        .highlight-default-input::after {
                          content: attr(data-placeholder);
                          color: #a0a0a0;
                        }
                      
                        .signature-container {
                          background-color: #f2f2f2; 
                          border: 1px solid gray;
                          cursor: pointer;
                          padding:5px;
                        }
                      
                        .signer-signature-container {
                          background-color: #f5f5f5; 
                          border: 1px solid gray;
                          cursor: pointer;
                          padding:5px;
                        }

                        div {
                          margin: 0;
                        }
                      `,
                      
                      }}
                    />
                    </div>

                    <hr />

                    <Button variant="light" className="upload-pdf-button w-100" onClick={() => setShowUploadModal(true)}>
                      Upload 
                      
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 14.25H15V9H16.5V15C16.5 15.4142 16.1642 15.75 15.75 15.75H2.25C1.83579 15.75 1.5 15.4142 1.5 15V9H3V14.25ZM9.75 6.75V12H8.25V6.75H4.5L9 2.25L13.5 6.75H9.75Z" fill="#0A0A0A"/>
                      </svg>
                    </Button>
                    
                    <hr />

                    <div className='modal-submit-btn'>
                        <Button variant='dark' size='lg' className='w-100' type='submit'>
                        Create contract
                        </Button>
                    </div>

                    </Form>
          </Modal.Body>
        </Modal>

        </>
      ) : openStatus === true && auth.windowWidth > 650 && (
        <>
        <Button variant="light" className="general-light-btn m-1" onClick={() => setShowUploadModal(true)}>
            Upload
          </Button>

          <Button variant="light" className="general-light-btn m-1" onClick={handleAddInput}>
            Add Input
          </Button>

          <Form onSubmit={handleFormSubmit} className="global-form hide-on-mobile-device">
            <Row>
              <Col sm={5} onDragOver={handleDragOver}>
                <Form.Group className="m-1" controlId="formBasicCheckbox">
                  <Form.Check
                    type="checkbox"
                    id="default-checkbox"
                    label="Require other sign"
                    onChange={(e) => setOtherSign(e.target.checked)}
                  />


                  {otherSign && (
                    <>
                      <Row>
                        <Col sm={signatureDropped ? 12 : 8}>
                          <Form.Control
                            type="text"
                            placeholder="Signer email"
                            className="global-formcontrol my-2"
                            onChange={(e) => setSignerEmail(e.target.value)}
                          />
                        </Col>
                        <Col sm={signatureDropped ? 0 : 4}>
                          {!signatureDropped && (
                            <>
                            <Button 
                              draggable 
                              onDragStart={(e) => { e.dataTransfer.setData('text/plain', `Signer Signature: `); }} 
                              variant="light" 
                              className="add-sign-btn m-1 position-relative" 
                              id="signer-signature-block"
                            >
                              <img src={plusGreenIcon} className="img-fluid plus-ico-sign" /> Add Signer Signature
                            </Button>
                            </>
                          )}
                        </Col>
                      </Row>

                    </>
                  )}
                </Form.Group>


                <Row>
                  <Col sm={6}>
                    <Form.Group className="mx-1 my-2" controlId="contract.fullname">
                      <Form.Control
                        type="text"
                        placeholder="Contract title"
                        className="global-formcontrol"
                        onChange={(e) => setContractTitle(e.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  {defaultInputs.map((input) => (
                    <DefaultInput
                      key={input.id}
                      id={input.id}
                      label={input.label}
                      onChange={handleDefaultInputChange}
                    />
                  ))}
                </Row>

                {!formData.signature && (
                  <Button 
                    draggable 
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', `Signature: `); }} 
                    variant="light" 
                    className="add-sign-btn m-1 position-relative" 
                    id="signature-block" 
                  >
                    <img src={plusGreenIcon} className="img-fluid plus-ico-sign" /> Add Signature
                  </Button>
                )}

                {formData.inputs.map((input) => (
                  <DraggableInput
                    key={input.id}
                    id={input.id}
                    label={input.label}
                    value={input.value}
                    onDragStart={(e) => handleDragStart(e, input.id, input.label, input.value)}
                    onChange={handleInputChange}
                  />
                ))}
              </Col>
              <Col sm={7} onDrop={handleDrop} onDragOver={handleDragOver}>
                <Editor
                  id="custom-editor"
                  apiKey="t6q63d1371kvanxo24trq2vsehtsygtd9qkuyx6jksncumec"
                  value={formData.contractContent}
                  onEditorChange={handleEditorChange}
                  init={{
                    setup: setup,
                    height: 700,
                    menubar: false,
                    plugins: 'advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount noneditable',
                    toolbar: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | link image | charmap | print preview | anchor | searchreplace | visualblocks code fullscreen | insertdatetime media table | paste code help | wordcount',
                    extended_valid_elements: '',
                    valid_elements: '*[*]',
                    noneditable_editable_class: 'mceEditable',
                    selector: '#custom-editor',
                    forced_root_block: 'div',                  
                    content_style: `
                    .highlight-input,
                    .highlight-default-input {
                      background-color: #f2f2f2;
                      display: inline-block;
                      padding: 2px;
                      border: 1px solid gray;
                    }
                  
                    .highlight-input::after,
                    .highlight-default-input::after {
                      content: attr(data-placeholder);
                      color: #a0a0a0;
                    }
                  
                    .signature-container {
                      background-color: #f2f2f2; 
                      border: 1px solid gray;
                      cursor: pointer;
                      padding:5px;
                    }
                  
                    .signer-signature-container {
                      background-color: #f5f5f5; 
                      border: 1px solid gray;
                      cursor: pointer;
                      padding:5px;
                    }

                    div {
                      margin: 0;
                    }
                  `,
                  
                  }}
                />
              </Col>
            </Row>

            <Button variant="light" className="general-light-btn mt-4" type="submit">
              Create Contract
            </Button>
          </Form>
        </>
      )}

    </React.Fragment>
  );
};

export default NewContract;
