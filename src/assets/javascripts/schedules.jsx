'use strict';

import React from 'react';

import { OnCall } from '../../models/OnCall.mjs';

export class SchedulesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      schedules: []
    };
  }

  componentDidMount() {
    fetch(`/v1/schedules.json`)
      .then((response) => {
        if (!response.ok) {
            throw Error(response.statusText);
        }

        return response.json();
      })
      .then((schedules) => {
        this.setState({ isLoaded: true, schedules });
      })
      .catch((error) => {
        this.setState({ isLoaded: true, error });
      })
  }

  render() {
    const { error, isLoaded, schedules } = this.state;
    if (!isLoaded) {
      return <span>Loading...</span>;
    }
    if (error) {
      return <span>Loading error: {error.message}</span>;
    }

    const schedulesListItems = schedules.map((schedule) =>
      <SchedulesListItem key={schedule.scheduleId} schedule={schedule} />
    );

    return <ul>{schedulesListItems}</ul>;
  }
}

export class SchedulesListItem extends React.Component {
  render() {
    const schedule = this.props.schedule;
    return (
      <li>
        <a href={`/v1/schedules/${schedule.scheduleId}.html`}>
          {schedule.scheduleName}
        </a>
      </li>);
  }
}

class PagerBeautyHttpError extends Error {
  /**
   * PagerBeauty generic error constructor.
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class PagerBeautyHttpNotFoundError extends PagerBeautyHttpError {}


export class Schedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      onCall: {}
    };
  }

  componentDidMount() {
    // Todo: verify/sanitize scheduleId
    fetch(`/v1/schedules/${this.props.scheduleId}.json`)
      .then((response) => {
        if (!response.ok) {
            throw new PagerBeautyHttpNotFoundError(response.statusText);
        }

        return response.json();
      })
      .then((data) => {
        const onCall = new OnCall(data);
        this.setState({ isLoaded: true, onCall });
      })
      .catch((error) => {
        this.setState({ isLoaded: true, error });
      })
  }

  render() {
    const { error, isLoaded, onCall } = this.state;
    if (!isLoaded) {
      return <span>Loading...</span>;
    }
    if (error) {
      if (error instanceof PagerBeautyHttpNotFoundError) {
        return <ScheduleOnCallNoOne />;
      }
      return <span>Loading error: {error.message}</span>;
    }

    return <ScheduleOnCall onCall={onCall} />
  }
}

export class ScheduleOnCall extends React.Component {
  render() {
    const { onCall } = this.props;
    return <div className="schedule">
      <div className="schedule_row filled_row">ON CALL</div>
      <div className="schedule_row">
        <a href={onCall.scheduleURL} className="schedule_name">{onCall.scheduleName}</a>
      </div>
      <div className="schedule_row">
        <div className="user_avatar">
        <a href={onCall.userURL}><img src={onCall.userAvatarSized()}></img></a>
        </div>
        <div className="user_name"><a href={onCall.userURL}>{onCall.userName}</a></div>
      </div>
      <div className="schedule_row filled_row">
        <div className="date date_start">
          <span>From: </span>
          <OnCallDateTime date={onCall.dateStart} timezone={onCall.scheduleTimezone} />
        </div>
        <div className="date date_end">
          <span>To: </span>
          <OnCallDateTime date={onCall.dateEnd} timezone={onCall.scheduleTimezone} />
        </div>
      </div>
    </div>;
  }
}

export class OnCallDateTime extends React.Component {
  render() {
    const { date, timezone } = this.props;
    if (timezone) {
      date.tz(timezone);
    }
    return (
      <React.Fragment>
        <span className="date_weekday">{date.format('dddd')}, </span>
        <span className="date_date">{date.format('MMM DD')} </span>
        <span className="date_time">{date.format('LT')}</span>
      </React.Fragment>
    );
  }
}

export class ScheduleOnCallNoOne extends React.Component {
  render() {
    return <div className="schedule not_found">
      <div className="schedule_row filled_row">ON CALL</div>
        <div className="schedule_row">
          <div className="user_avatar"><img src="https://www.gravatar.com/avatar/0?s=2048&amp;d=mp" /></div>
          <div className="user_name error">No one is on call</div>
        </div>
      <div className="schedule_row filled_row"></div>
    </div>;
  }
}