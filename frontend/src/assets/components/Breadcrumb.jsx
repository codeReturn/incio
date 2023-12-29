import React from 'react';
import { Link } from 'react-router-dom';

import { ButtonGroup, Button, Row, Col } from 'react-bootstrap'

const Breadcrumb = () => {
    const url = window.location.pathname;

    return (
        <>
        <div className="meetings-buttons hide-on-mobile-device">
        <ButtonGroup aria-label="filter-buttons" className="custom-btn-groups">
            <Link to="/generalmeetings">
            <Button
                variant="light"
                className={`${
                url === "/generalmeetings"
                    ? "custom-meetings-btn-active"
                    : "custom-meetings-btn"
                } custom-meetings-btn-rounded-start`}
            >
                All
            </Button>
            </Link>

            <Link to="/events">
            <Button
                variant="light"
                className={`${
                url === "/events"
                    ? "custom-meetings-btn-active"
                    : "custom-meetings-btn"
                }`}
            >
                Events
            </Button>
            </Link>

            <Link to="/meetings">
            <Button
                variant="light"
                className={`${
                url === "/meetings"
                    ? "custom-meetings-btn-active"
                    : "custom-meetings-btn"
                } custom-meetings-btn-rounded-end`}
            >
                Meetings
            </Button>
            </Link>
        </ButtonGroup>
        </div>

        <div className="meetings-buttons display-on-mobile-device" style={{ paddingLeft: "1rem" }}>
            <Row>
                <Col className="custom-class-col">
                    <Link to="/generalmeetings">
                        <Button
                            variant="light"
                            className={`${
                                url === "/generalmeetings"
                                    ? "custom-meetings-btn-active"
                                    : "custom-meetings-btn"
                            } custom-meetings-btn-rounded-start custom-meetings-btn-full-width`}
                        >
                            All
                        </Button>
                    </Link>
                </Col>

                <Col className="custom-class-col">
                    <Link to="/events">
                        <Button
                            variant="light"
                            className={`${
                                url === "/events"
                                    ? "custom-meetings-btn-active"
                                    : "custom-meetings-btn"
                            } custom-meetings-btn-full-width`}
                        >
                            Events
                        </Button>
                    </Link>
                </Col>

                <Col className="custom-class-col">
                    <Link to="/meetings">
                        <Button
                            variant="light"
                            className={`${
                                url === "/meetings"
                                    ? "custom-meetings-btn-active"
                                    : "custom-meetings-btn"
                            } custom-meetings-btn-rounded-end custom-meetings-btn-full-width`}
                        >
                            Meetings
                        </Button>
                    </Link>
                </Col>
            </Row>
        </div>
        </>
    )
}

export default Breadcrumb;