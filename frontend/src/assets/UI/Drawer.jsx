import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Collapse } from 'react-bootstrap';
import { Drawer } from 'react-bootstrap-drawer';

import 'react-bootstrap-drawer/lib/style.css';

import meetingsIcon from '../images/mettings_icon.png'
import moneyIcon from '../images/money_icon.png'
import contractsIcon from '../images/contracts_icon.png'
import clientsIcon from '../images/clients_icon.png'

const SidebarDrawer = (props) => {
	const [open, setOpen] = useState(false);
	const handleToggle = () => setOpen(!open);

	const location = useLocation();
	const { pathname } = location;
  
	const isActive = (path) => {
	  return pathname === path ? 'active' : '';
	};

	return (
        <>
		<Drawer { ...props } className="custom-drawer">
			<Drawer.Toggle onClick={ handleToggle } />

			<Collapse in={ open }>
				<Drawer.Overflow>
					<Drawer.ToC>

                    <div className="drawer-nav">
						<ul>
						<Link to="/generalmeetings" className={isActive('/generalmeetings')}> <li> <img src={meetingsIcon} className="img-fluid" /> Meetings </li> </Link>
						<Link to="/money" className={isActive('/money')}> <li> <img src={moneyIcon} className="img-fluid" /> Money </li> </Link>
						<Link to="/contracts" className={isActive('/contracts')}> <li> <img src={contractsIcon} className="img-fluid" /> Contracts </li> </Link>
						<Link to="/clients" className={isActive('/clients')}> <li> <img src={clientsIcon} className="img-fluid" /> Clients </li> </Link>
						</ul>
					</div>

					</Drawer.ToC>
				</Drawer.Overflow>
			</Collapse>
		</Drawer>
        </>
	);
};

export default SidebarDrawer;