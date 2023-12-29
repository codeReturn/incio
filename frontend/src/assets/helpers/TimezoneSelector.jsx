// TimezoneSelector.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { toast } from 'react-toastify';

import moment from 'moment'

const TimezoneSelector = ({ userId, onUpdate }) => {
  const [timezones, setTimezones] = useState([]);
  const localDataTime = localStorage.getItem('timezone')
  const [selectedTimezone, setSelectedTimezone] = useState(localDataTime || '');

  const getTimezones = async () => {
    try {
      const response = await axios.get('https://inciohost.com/server/api/users/alltimezones');
      const timezoneOptions = response.data.map((tz) => ({
        value: tz,
        label: tz,
      }));
      setTimezones(timezoneOptions);
    } catch (error) {
      console.error('Error fetching timezones:', error);
    }
  };

  useEffect(() => {
    // Fetch all timezones from the server
    getTimezones();
  }, []);

  const localData = localStorage.getItem('userData')
  const parseLocal = JSON.parse(localData)

  const fetchUserInfo = async () => {
    await axios.get(`https://inciohost.com/server/api/users/getuserinfo`, 
    {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + parseLocal.token
        }
    })
    .then((response) => {
        setSelectedTimezone(response.data.user.timezone);
    })
    .catch((error) => {
        console.error('Error fetching user timezone:', error);
    });
  }

  useEffect(() => {
    // Fetch the user's data when userId is defined
    if(userId) {
        fetchUserInfo()
    } else {
        if(localDataTime){
            localStorage.setItem('timezone', localDataTime)
            setSelectedTimezone(localDataTime);
        } else {
            const guessTimezone = moment.tz.guess();
            localStorage.setItem('timezone', guessTimezone);
            setSelectedTimezone(guessTimezone);  
        }
    }
  }, [userId]);

  const handleTimezoneChange = async (selectedOption) => {
    setSelectedTimezone(selectedOption.value);
    localStorage.setItem('timezone', selectedOption.value)

    // Update the user's preference if userId is defined
    if (userId) {
      try {
        const response = await axios.post('https://inciohost.com/server/api/users/updatetimezone', {
          userId,
          timezone: selectedOption.value,
        });
        if (response.data.message === 'global_success') {
          toast.success('Timezone updated', { position: toast.POSITION.BOTTOM_CENTER });
        }

        onUpdate()
      } catch (error) {
        console.log(error)
        console.error('Error updating timezone preference:', error);
      }
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
    <div>
      <Select
        id="timezone"
        options={timezones}
        value={timezones.find((option) => option.value === selectedTimezone)}
        onChange={handleTimezoneChange}
        className="global-select"
        classNamePrefix="custom-select"
        placeholder="Select timezone"
        styles={customStyles}
      />
    </div>
  );
};

export default TimezoneSelector;
