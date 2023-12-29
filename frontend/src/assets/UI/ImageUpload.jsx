import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap'

const ImageUpload = props => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);
  const [fileError, setFileError] = useState(false);
  const filePickerRef = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }
    if(file.size > 500000){
      setFile();
      setPreviewUrl();
      setIsValid(false);
      setFileError(true);
      return;
    }   
    setFileError(false);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = event => {
    let pickedFile;
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    props.onInput(props.id, pickedFile, fileIsValid);
  };

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  // New function to handle image removal
  const removeImageHandler = () => {
    setPreviewUrl(null);
    setFile(null);
    setIsValid(false);
    // Clear the file input
    filePickerRef.current.value = '';
    // Inform the parent that the image has been removed
    props.onInput(props.id, null, false);
  };

  return (
    <>
    <div className="images-upload-form">
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: 'none' }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && 'center'}`}>
        <div className="image-upload__preview position-relative">
          {previewUrl && (
            <>
              <img src={previewUrl} alt="Preview" />
              <button className="custom-remove-image" size="xs" onClick={removeImageHandler}>
                <i className="fa-solid fa-trash"></i>
              </button>
            </>
          )}
        </div>

        {!previewUrl && (
          <Button size="light" type="button" onClick={pickImageHandler}>
            <i className="fa-solid fa-image"></i>
          </Button>
        )}
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>

    <div className="my-2 info-file-text">
    {fileError == true ? <span style={{ color: 'red' }}>Maximum file size: <b>5 MB</b></span> : <span>Maximum file size: <b>5 MB</b></span> }
    </div>
    </>
  );
};

export default ImageUpload;
