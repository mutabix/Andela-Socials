import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Calendar from '../../components/common/Calendar';
import EventFilter from '../../components/filter/EventFilter';
import EventCard from '../../components/cards/EventCard';
import formatDate from '../../utils/formatDate';
import { getEventsList, createEvent, updateEvent } from '../../actions/graphql/eventGQLActions';
import { getCategoryList } from '../../actions/graphql/categoryGQLActions';
import EventNotFound from '../../components/EventNotFound';

import mapListToComponent from '../../utils/mapListToComponent';

import { ModalContextCreator } from '../../components/Modals/ModalContext';
import uploadImage from '../../actions/graphql/uploadGQLActions';


const ADD_EVENT_INSTRUCTION = 'ADD EVENT';
const BROWSE_ALL_INSTRUCTION = 'BROWSE ALL';

/**
 * @description  contains events dashboard page
 *
 * @class EventsPage
 * @extends {React.Component}
 */
class EventsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eventList: [],
      categoryList: [],
      selectedVenue: '',
      selectedCategory: '',
      eventStartDate: formatDate(Date.now(), 'YYYY-MM-DD'),
      lastEventItemCursor: '',
    };
    this.getFilteredEvents = this.getFilteredEvents.bind(this);
  }

  /**
   * React Lifecycle hook
   *
   * @memberof EventsPage
   * @returns {null}
   */
  componentDidMount() {
    const { eventStartDate } = this.state;
    this.getEvents({ startDate: eventStartDate });
    this.getCategories({
      first: 20, last: 20,
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      events, socialClubs,
    } = nextProps;

    const eventLength = events.length;
    const lastEventItemCursor = eventLength ? events[eventLength - 1].cursor : '';
    this.setState({
      eventList: events,
      categoryList: socialClubs.socialClubs,
      lastEventItemCursor,
    });
  }

  getFilteredEvents(filterDate, filterLocation, filterCategory) {
    const {
      eventStartDate,
      selectedVenue,
      selectedCategory,
    } = this.state;
    const startDate = filterDate || eventStartDate;
    const location = filterLocation || selectedVenue;
    const category = filterCategory || selectedCategory;
    this.setState({
      eventStartDate: startDate,
      selectedVenue: location,
      selectedCategory: category,
    });
    this.getEvents({
      startDate,
      venue: location,
      category,
    });
  }

  /**
   * @description Gets list of events
   *
   * @memberof EventsPage
   *
   * @param {string} startDate
   * @param {string} venue
   * @param {string} category
   */
  getEvents = ({
    startDate,
    venue,
    category,
    after,
  }) => {
    const { getEventsList } = this.props;
    getEventsList({
      startDate, venue, category, after,
    });
  }

  /**
   * @description Gets list of categories
   *
   * @memberof EventsPage
   */
  getCategories = ({
    first,
    last,
  }) => {
    const { getCategoryList: getList } = this.props;
    getList({
      first,
      last,
    });
  }

  /**
   * @description It loads more list of events
   *
   * @memberof EventsPage
   */
  loadMoreEvents = () => {
    const {
      eventStartDate,
      selectedVenue,
      selectedCategory,
      lastEventItemCursor,
    } = this.state;
    this.getEvents({
      startDate: eventStartDate,
      venue: selectedVenue,
      category: selectedCategory,
      after: lastEventItemCursor,
    });
  }


  /**
   * @description It renders list of event card
   *
   * @memberof EventsPage
   */
  renderEventGallery = (catList) => {
    const { eventList } = this.state;
    if (eventList.length) {
      const listOfEventCard = mapListToComponent(eventList, EventCard);
      return (<div className="event__gallery">
        {listOfEventCard}
        {this.renderCreateEventButton({ categories: catList })}
      </div>);
    }

    let actions = [
      key => this.renderCreateEventButton({
        categories: catList, message: ADD_EVENT_INSTRUCTION, key,
      }),
      key => this.renderOldEventsButton(key)];

    actions = actions.map((action, index) => action(index));
    return <EventNotFound
      statusMessage=""
      mainMessage="No events for the selected date and filter"
      actions={actions}/>;
  }


  /**
   * @description It renders browse past events button
   *
   * @memberof EventsPage
   */
  renderOldEventsButton = (key) => {
    const action = () => (this.getEvents({ startDate: '' }));
    return (<button
      key={key || ''}
      type="button"
      className="btn-blue event__load-more-button small-button"
      onClick={action}>
        {BROWSE_ALL_INSTRUCTION}
      </button>);
  }

  /**
   * @description It renders the create event button
   *
   * @memberof EventsPage
   */
  renderCreateEventButton = ({
    categories, message, key,
  }) => (
    <ModalContextCreator.Consumer
      key={key || ''}>
      {
        ({
          activeModal,
          openModal,
        }) => {
          const {
            createEvent: createAction,
            uploadImage: uploadImageAction,
            updateEvent: updateAction,
          } = this.props;
          if (activeModal) return null;
          return (
            <button
              type="button"
              onClick={() => openModal('CREATE_EVENT', {
                modalHeadline: 'create event',
                formMode: 'create',
                formId: 'event-form',
                categories,
                createAction,
                updateAction,
                uploadImageAction,
              })}
              className={message ? 'btn-blue event__load-more-button small-button' : 'create-event-btn'}
            >
              {message || <span className="create-event-btn__icon">+</span>}
            </button>
          );
        }
      }
    </ModalContextCreator.Consumer>
  );

  /**
   * @description It renders the create event footer
   *
   * @memberof EventsPage
   */
  renderEventFooter = eventList => (
    eventList.length && (<div className="event__footer">
      <button
        onClick={this.loadMoreEvents}
        type="button"
        className="btn-blue event__load-more-button">
        Load more
      </button>
    </div>)
  )

  render() {
    const {
      categoryList,
      eventList,
    } = this.state;
    const catList = Array.isArray(categoryList) ? categoryList.map(item => ({
      id: item.node.id,
      title: item.node.name,
      selected: false,
      key: 'category',
    })) : [];
    return (
      <div className="event__container">
        <div className="event__sidebar">
          <EventFilter categoryList={catList} filterSelected={this.getFilteredEvents} />
          <Calendar dateSelected={this.getFilteredEvents} />
        </div>
        {this.renderEventGallery(catList)}
        {this.renderEventFooter(eventList)}
      </div>
    );
  }
}

EventsPage.propTypes = {
  createEvent: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired,
  updateEvent: PropTypes.func.isRequired,
  getCategoryList: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  events: state.events,
  socialClubs: state.socialClubs,
});

export default connect(mapStateToProps, {
  getEventsList,
  getCategoryList,
  createEvent,
  uploadImage,
  updateEvent,
})(EventsPage);
