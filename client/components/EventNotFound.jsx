import React from 'react';
import PropTypes from 'prop-types';


const EventNotFound = (props) => {
  const {
    statusMessage,
    mainMessage,
    actions,
  } = props;
  return (
    <div className="no-events">
      <div className="no-events__container">
        <h1 className="no-events__status-message">
          {statusMessage}
        </h1>
        <h3 className="no-events__main-message">
          {mainMessage}
        </h3>
        <div className="no-events__actions">
          {actions}
        </div>
      </div>
    </div>
  );
};


EventNotFound.propTypes = {
  mainMessage: PropTypes.string,
  statusMessage: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.object),
};

EventNotFound.defaultProps = {
  mainMessage: '',
  statusMessage: '',
  actions: [],
};


export default EventNotFound;
