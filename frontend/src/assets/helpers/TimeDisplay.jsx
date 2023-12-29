import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';

const TimeDisplay = ({ date, start, end }) => {
  const [userTime, setUserTime] = useState(null);
  const storedTimezone = localStorage.getItem('timezone');

  useEffect(() => {
    // Convert the given date and time to the user's timezone
    const userTimezone = storedTimezone || moment.tz.guess();
    setUserTime(convertToUserTimezone(date, start, end, userTimezone));
  }, [date, start, end, storedTimezone]);

  // Function to convert time to the user's timezone
  const convertToUserTimezone = (date, startTime, endTime, timezone) => {
    const dateFormat = 'MM.DD.YYYY';
    const timeFormat = 'hh:mm A';

    const parsedDate = moment.tz(date, 'YYYY-MM-DD', 'UTC');
    if (!parsedDate.isValid()) return 'Invalid date';

    if (startTime && endTime) {
      const formattedStartTime = moment.tz(startTime, 'hh:mm A', 'UTC').tz(timezone).format(timeFormat);
      const formattedEndTime = moment.tz(endTime, 'hh:mm A', 'UTC').tz(timezone).format(timeFormat);
      return `${parsedDate.tz(timezone).format(dateFormat)} - ${formattedStartTime} - ${formattedEndTime}`;
    }

    return parsedDate.tz(timezone).format(dateFormat);
  };

  return (
    <>
      {userTime ? <span>{userTime}</span> : <span>Loading...</span>}
    </>
  );
};

export default TimeDisplay;
