import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ContentLoader from "react-content-loader"

const MyLoader = (props) => (
  <ContentLoader 
    speed={2}
    width={'100%'}
    height={400}
    viewBox="0 0 100 300"
    backgroundColor="#fff"
    foregroundColor="#e8e8e8"
    {...props}
  >
    <rect x="0" y="0" rx="3" ry="3" width="100" height="300" />
  </ContentLoader>
)

const DashboardStats = () => {
    const user = JSON.parse(localStorage.getItem('userData'));
    const [userStatsLoading, setUserStatsLoading] = useState(true)
    const [userStats, setUserState] = useState()

    const fetchUserDashboardStats = async () => {
        try {
            setUserStatsLoading(true)

            const response = await axios.get(`https://inciohost.com/server/api/getuserstatsdashboard`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token
                }
            })

            console.log(response)
            setUserState(response.data)
            setUserStatsLoading(false)
        } catch (err) {
            toast.error(err, { position: toast.POSITION.BOTTOM_CENTER });
            console.error('Error fetching stats:', err);
            setUserStatsLoading(false)
        }
    }

    useEffect(() => {
        fetchUserDashboardStats()
    }, []);

    const [isMobile, setIsMobile] = useState(false);

    const handleResize = () => {
        const width = window.innerWidth;
        setIsMobile(width <= 768);
    };

    window.addEventListener('resize', handleResize);

    return (
        <>
        <Row className="dashboard-stats-row-mt">
        {userStatsLoading && !userStats ? (
            <>
                <Col sm={3}><MyLoader /></Col>
                <Col sm={3}><MyLoader /></Col>
                <Col sm={3}><MyLoader /></Col>
                <Col sm={3}><MyLoader /></Col>
            </>
        ) : (
            <>
                <Col xs={12} sm={6} lg={6} xl={3}>
                    <div className="dashboardstats-block">
                    <div className="dashboardstats-block-info">{userStats.eventsTodayCount ? userStats.eventsTodayCount : 0} <span>Events Today</span></div>
                    <div className="dashboardstats-block-info">{userStats.meetingsTodayCount ? userStats.meetingsTodayCount : 0} <span>Meetings Today</span></div>
                    </div>
                </Col>
                <Col xs={12} sm={6} lg={6} xl={3}>
                    <div className="dashboardstats-block">
                    <div className="dashboardstats-block-info">{userStats.paidInvoices ? userStats.paidInvoices : 0} <span>paid invoices</span></div>
                    <div className="dashboardstats-block-info">{userStats.meetingsTodayCount ? userStats.totalInvoices : 0} <span>total invoices</span></div>
                    </div>
                </Col>
                <Col xs={12} sm={6} lg={6} xl={3}>
                    <div className="dashboardstats-block">
                    <div className="dashboardstats-block-info">{userStats.pendingSignatures ? userStats.pendingSignatures : 0} <span>Pending Signitures</span></div>
                    <div className="dashboardstats-block-info">{userStats.totalContracts ? userStats.totalContracts : 0} <span>Total Contracts</span></div>
                    </div>
                </Col>
                <Col xs={12} sm={6} lg={6} xl={3}>
                    <div className="dashboardstats-block">
                    <div className="dashboardstats-block-info">{userStats.totalClients ? userStats.totalClients : 0} <span>Total Clients</span></div>
                    <div className="dashboardstats-block-info">{userStats.activeClients ? userStats.activeClients : 0} <span>Active Clients</span></div>
                    </div>
                </Col>
            </>
        )}
        </Row>
        </>
    )
}

export default DashboardStats;