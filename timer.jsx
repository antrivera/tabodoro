/* global chrome */

import React from 'react';
import Tasks from './tasks';

class Timer extends React.Component {
  constructor() {
    super();

    this.state = {
      workInterval: true,
      completedRounds: 0,
      totalRounds: 0,
      targetRounds: 4,
      intervalLength: 10,
      elapsedTime: 0,
      timerActive: false,
      activeTask: 'Focus'
    };

    this.timer;
    this.startTimer = this.startTimer.bind(this);
    this.pauseTimer = this.pauseTimer.bind(this);
    this.setState = this.setState.bind(this);
  }

  componentDidMount() {
    this.getTotalRounds();
    this.getActiveTask();
    this.syncStateListener();
  }

  getTotalRounds() {
    chrome.storage.sync.get('totalRounds', ({totalRounds}) => {
      if (totalRounds) {
        this.setState({totalRounds});
      }
    });
  }

  getActiveTask() {
    chrome.storage.sync.get('activeTask', ({activeTask}) => {
      if (activeTask) {
        this.setState({activeTask});
      }
    });
  }

  syncStateListener() {
    chrome.storage.onChanged.addListener(({totalRounds, completedRounds, activeTask}, namespace) => {
      console.log(totalRounds);
      console.log(completedRounds);
      console.log(activeTask);
      if (totalRounds) {
        this.setState({totalRounds: totalRounds.newValue});
      }

      if (activeTask) {
        this.setState({activeTask: activeTask.newValue});
      }
    });
  }

  timerDisplay(seconds) {
    let minutes = Math.floor(seconds / 60);

    if (seconds > 10) {
      seconds = Math.floor(seconds % 60);
    }

    let secondsStr = seconds < 10 ? ("0" + seconds.toString()) : seconds.toString();

    let display = `${minutes.toString()}:${secondsStr}`;

    if (minutes < 10) {
      display = "0" + display;
    }

    return display;
  }

  startTimer() {
    let initialOffset = 1257;
    this.setState({timerActive: true});

    this.timer = setInterval(() => {
      this.setState({elapsedTime: this.state.elapsedTime + 1});
      let circle = document.getElementsByClassName('circle-animation');
      let c = circle[0].style;
      let updatedTime = this.state.elapsedTime + 1;

      if (this.state.elapsedTime % this.state.intervalLength === 0) {
        if (this.state.workInterval) {
          this.setState({
            workInterval: false,
            intervalLength: 5,
            completedRounds: this.state.completedRounds + 1,
            elapsedTime: 0
          });

          chrome.storage.sync.set({completedRounds: this.state.completedRounds, totalRounds: this.state.totalRounds + 1});

          document.body.style.background = '#5CBC9E';
          c.strokeDashoffset = initialOffset;
        } else {
          this.setState({
            workInterval: true,
            intervalLength: 10,
            elapsedTime: 0
          });
          document.body.style.background = '#EC5E54';
          c.strokeDashoffset = initialOffset;

          if (this.state.completedRounds === this.state.targetRounds) {
            clearInterval(this.timer);
            this.setState({timerActive: false});
          }
        }

        return;
      }

      c.strokeDashoffset = initialOffset-((updatedTime)*((initialOffset)/this.state.intervalLength));
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.timer);
    this.setState({timerActive: false});
  }

  render() {
    return (
      <div>
        <h2>Tabodoro</h2>
        <div className="icons">
          <div className="settings icon"></div>
          <Tasks />
          <div className="progress icon"></div>
        </div>
        <div className="timer-container">
          <div className="item">
            <h1>{this.state.activeTask}</h1>
            <svg width="500" height="500" viewBox="0 0 500 500">
              <g>
                <text id="timer-text" x="51%" y="-18%" textAnchor="middle" dominantBaseline="central" dy=".3em">
                  { this.timerDisplay(Math.abs(this.state.intervalLength - this.state.elapsedTime)) }
                </text>
                <circle id="circle" className="circle-animation" r="200" cy="250" cx="250" strokeWidth="3" stroke="white" fill="transparent">
                </circle>
              </g>
            </svg>
            { this.state.timerActive ? <div className="pause-btn" onClick={this.pauseTimer}></div> :
                <div className="play-btn" onClick={this.startTimer}></div>
            }
            <div>Round {this.state.completedRounds}/{this.state.targetRounds}</div>
            <div>Total {this.state.totalRounds}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Timer;
