import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import axios from 'axios';

import moment from 'moment';
import LoadingSpinner from '../UI/LoadingSpinner';

const EventSlider = forwardRef((props, ref) => {
  const user = JSON.parse(localStorage.getItem('userData'));
  const [events, setEvents] = useState([]);
  const sliderRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEvents()
      .then((data) => setEvents(data))
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);

    const response = await axios.get(
      `http://localhost:5000/server/api/getuserevents`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + user.token,
        },
      }
    );

    const reversed = response.data.events.reverse();
    const slice = reversed.slice(0, 10)

    setIsLoading(false);

    return slice;
  };

  const renderEvents = () => {
    const eventCount = events.length;
  
    const copyLinkToClipboard = (link) => {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          console.log('Link copied to clipboard:', link);
        })
        .catch((error) => {
          console.error('Failed to copy link to clipboard:', error);
        });
    };
  
    return events.map((event, index) => (
      <Card key={`event${index}`} className="event-card">
        <Card.Body>
          <Card.Title>{event.name}</Card.Title>
          <div className="event-details">
            <p className="event-time">
              <label>Time:</label> {moment(event.eventdate).format('ddd MMM D, YYYY')}
            </p>
            <p className="event-place">
              <label>Place:</label> {event.location}
            </p>
          </div>
          <div className="event-footer">
            <p
              className="event-copy-link"
              onClick={() => copyLinkToClipboard(`https://incio.cryptojobsphere.com/meeting/${event.uniquelink}`)}
            >
              <i className="fa-solid fa-link"></i> Copy Link
            </p>
          </div>
        </Card.Body>
      </Card>
    ));
  };  

  const settings = {
    dots: false,
    infinite: events?.length > 4 ? true : false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const next = () => {
    sliderRef.current.slickNext();
  };

  const previous = () => {
    sliderRef.current.slickPrev();
  };

  useImperativeHandle(ref, () => ({
    next,
    previous,
  }));

  return (
    <Container fluid>
      <Row>
        <Col className="p-0">
          {isLoading ? (
            <center>
              <LoadingSpinner asOverlay={false} />
            </center>
          ) : (
            <>
              {!isLoading && events && events.length === 0 && (
                <>
                <p>No results!</p>
                </>
              )}

              {!isLoading && events && events.length > 0 && (
                <Slider ref={sliderRef} {...settings} className="event-slider">
                  {renderEvents()}
                </Slider>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
});

export default EventSlider;
