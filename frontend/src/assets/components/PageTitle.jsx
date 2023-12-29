import React from 'react';
import { useLocation } from 'react-router-dom';

const PageTitle = () => {
  const location = useLocation();

  const getTitleFromURL = () => {
    const { pathname } = location;
  
    if (pathname === '/') {
      return 'Home';
    } else if (pathname === '/generalmeetings') {
      return 'Meetings and Events';
    } else if (pathname.startsWith('/events')) {
      return 'Events';
    } else if (pathname.startsWith('/meetings')) {
      return 'Meetings';
    } else if (pathname.startsWith('/meeting')) {
      return 'Schedule Meeting';
    } else if (pathname.startsWith('/contracts')) {
      return 'Contracts';
    } else if (pathname.startsWith('/clients')) {
      return 'Clients';
    } else if (pathname.startsWith('/contract')) {
      return 'Contract';
    } else if (pathname.startsWith('/money')) {
      return 'Money';
    } else if (pathname.startsWith('/account')) {
      return 'Account';
    } else if (pathname.startsWith('/invoice')) {
      return 'Invoice';
    } else if (pathname.startsWith('/terms')) {
      return 'Terms and Conditions';
    } else if (pathname.startsWith('/privacy')) {
      return 'Privacy Policy';
    } else {
      return 'Unknown';
    }
  };

  const title = getTitleFromURL();

  return title;
};

export default PageTitle;