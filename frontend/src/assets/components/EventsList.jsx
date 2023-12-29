import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { Row, Col } from 'react-bootstrap'

import EventItem from './EventItem';

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3.5,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3.5,
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

const EventSlider = forwardRef((props, ref) => {
  const sliderRef = useRef(null);

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
    <Slider ref={sliderRef} {...settings} className="event-slider">
      {props.items.map((event, index) => (
        <EventItem
          index={index + 1}
          key={event.id}
          id={event.id}
          name={event.name}
          description={event.description}
          eventcalendar={event.eventcalendar}
          eventdate={event.eventdate}
          eventavailable={event.eventavailable}
          eventduration={event.eventduration}
          scheduletimes={event.scheduletimes}
          questions={event.questions}
          location={event.location}
          locationaddress={event.locationaddress}
          uniquelink={event.uniquelink}
          onUpdate={props.onUpdateEvent}
        />
      ))}
    </Slider>
  );
});

const EventsList = forwardRef((props, ref) => {
  console.log(props.items)

  if (props.items.length === 0) {
    return (
      <div className="center-noresults">
        No results
      </div>
    );
  }

  return (
    <div className="custom-list">
      {props.slider ? (
        <EventSlider ref={ref} items={props.items} onUpdateEvent={props.onUpdateEvent} />
      ) : props.slider === false && props.mobile === true ? (
        <>
        <Row className="mobile-general-list">
          {props.items.map((event, index) => (
            <Col lg={12} key={`e` + index}>
              <EventItem
              index={index + 1}
              key={event.id}
              id={event.id}
              name={event.name}
              description={event.description}
              eventcalendar={event.eventcalendar}
              eventdate={event.eventdate}
              eventavailable={event.eventavailable}
              eventduration={event.eventduration}
              scheduletimes={event.scheduletimes}
              questions={event.questions}
              location={event.location}
              locationaddress={event.locationaddress}
              uniquelink={event.uniquelink}
              guests={event.guests}
              onUpdate={props.onUpdateEvent}
              mobile={true}
              shade={props.items.length === (index + 1) ? true : false}
              />
            </Col>
          ))}
        </Row>
        </>
      ) : (
        <Row className="event-slider">
          {props.items.map((event, index) => (
            <Col sm={3}>
            <EventItem
              index={index + 1}
              key={event.id}
              id={event.id}
              name={event.name}
              description={event.description}
              eventcalendar={event.eventcalendar}
              eventdate={event.eventdate}
              eventavailable={event.eventavailable}
              eventduration={event.eventduration}
              scheduletimes={event.scheduletimes}
              questions={event.questions}
              location={event.location}
              locationaddress={event.locationaddress}
              uniquelink={event.uniquelink}
              guests={event.guests}
              onUpdate={props.onUpdateEvent}
              mobile={false}
            />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
});

export default EventsList;
