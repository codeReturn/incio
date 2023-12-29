import React from 'react';
import { Link } from 'react-router-dom';

import MeetingItem from './MeetingItem';

import { Row, Col, Table } from 'react-bootstrap';

import avatarImage from '../images/avatar.png'

const MeetingsList = props => {

  if (props.items.length === 0) {
    return (
      <div className="center-noresults">
           No results
      </div>
    );
  }

  return (
    <div className="custom-list">
        {props.mobile ? (
          <>
          <Row className="mobile-general-list">
            {props.items.map((meeting, index) => (
              <MeetingItem
                index={index + 1}
                key={meeting.id}
                id={meeting.id}
                link={meeting.link}
                selected_time={meeting.selected_time}
                email={meeting.email}
                quests={meeting.quests}
                name={meeting.name}
                phone={meeting.phone}
                date={meeting.date}
                questions={meeting.questions}
                onUpdate={props.onUpdateMeeting}
                event={meeting.event}
                mobile={true}
                shade={props.items.length === (index + 1) ? true : false}
              />
            ))}
          </Row>
          </>
        ) : (
          <>
          <Table responsive>
          <tbody>
          {props.items.map((meeting, index) => (
            <MeetingItem
              index={index + 1}
              key={meeting.id}
              id={meeting.id}
              link={meeting.link}
              selected_time={meeting.selected_time}
              email={meeting.email}
              quests={meeting.quests}
              name={meeting.name}
              phone={meeting.phone}
              date={meeting.date}
              questions={meeting.questions}
              onUpdate={props.onUpdateMeeting}
              mobile={false}
            />
          ))}
          </tbody>
          </Table>
          </>
        )}
    </div>
  );
};

export default MeetingsList;
