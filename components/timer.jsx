/* global chrome */
import React from 'react';
import Tasks from './tasks';
import Settings from './settings';
import BlockList from './blocklist';

class Timer extends React.Component {
  constructor() {
    super();

    this.state = {
      workInterval: true,
      completedRounds: 0,
      totalRounds: 0,
      targetRounds: 4,
      intervalLength: 25,
      breakIntervalLen: 5,
      longBreakLen: 15,
      longBreakAfter: 4,
      elapsedTime: 0,
      timerActive: false,
      activeTask: 'Focus'
    };

    this.timer;
    this.startTimer = this.startTimer.bind(this);
    this.pauseTimer = this.pauseTimer.bind(this);
    this.setState = this.setState.bind(this);
  }

  componentWillMount() {
    this.fetchRounds();
    this.fetchActiveTask();
    this.fetchIntervalLength();
    this.fetchCurrentDate();
    this.fetchTimerState();
    this.syncStateListener();
    this.timerDisplayListener();
  }

  fetchTimerState() {
    chrome.storage.sync.get({workInterval: this.state.workInterval, timerActive: this.state.timerActive},
    ({workInterval, timerActive}) => {
      document.body.style.background = workInterval ? '#EC5E54' : '#5CBC9E';
      this.setState({workInterval, timerActive});
    });

    chrome.storage.local.get({elapsedTime: this.state.elapsedTime, strokeDashOffset: 1257},
    ({elapsedTime, strokeDashOffset}) => {
      document.getElementsByClassName('circle-animation')[0].style['stroke-dashoffset'] = strokeDashOffset;
      this.setState({elapsedTime});
    });
  }

  fetchCurrentDate() {
    let now = new Date();
    chrome.storage.sync.get('timeStamp',
    ({timeStamp}) => {
      if (!timeStamp) {
        chrome.storage.sync.set({timeStamp: {day: now.getDate(), month: now.getMonth() , year: now.getFullYear() } })
        return;
      }

      let today = new Date();
      if (today.getDate() !== timeStamp.day || today.getMonth() !== timeStamp.month || today.getFullYear() !== timeStamp.year) {
        chrome.storage.sync.set({timeStamp: {day: today.getDate(), month: today.getMonth() , year: today.getFullYear() } })
        this.resetCompletedPomodoros();
      }
    });
  }

  resetCompletedPomodoros() {
    chrome.storage.sync.set({totalRounds: 0, completedRounds: 0});
  }

  fetchIntervalLength() {
    chrome.storage.sync.get({
      pomodoroLen: this.state.intervalLength,
      breakLen: this.state.breakIntervalLen,
      longBreakLen: this.state.longBreakLen,
      longBreakAfter: this.state.longBreakAfter},
      ({pomodoroLen, breakLen, longBreakLen, longBreakAfter}) => {
        this.setState({intervalLength: pomodoroLen*60, breakIntervalLen: breakLen*60, longBreakLen: longBreakLen*60, longBreakAfter});
      }
    );
  }

  fetchRounds() {
    chrome.storage.sync.get({totalRounds: this.state.totalRounds, completedRounds: this.state.completedRounds, targetRounds: this.state.targetRounds}, ({totalRounds, completedRounds, targetRounds}) => {
        this.setState({totalRounds, completedRounds, targetRounds});
    });
  }

  fetchActiveTask() {
    chrome.storage.sync.get('activeTask', ({activeTask}) => {
      if (activeTask) {
        this.setState({activeTask});
      }
    });
  }

  timerDisplayListener() {
    chrome.storage.onChanged.addListener(({elapsedTime, strokeDashOffset, timerActive, workInterval, completedRounds}, namespace) => {
      if (elapsedTime) {
        this.setState({elapsedTime: elapsedTime.newValue});
      }

      if (timerActive) {
        this.setState({timerActive: timerActive.newValue});
      }

      if (strokeDashOffset) {
        document.getElementsByClassName('circle-animation')[0].style['stroke-dashoffset'] = strokeDashOffset.newValue;
      }

      if (workInterval) {
        this.setState({workInterval: workInterval.newValue});
        document.body.style.background = workInterval.newValue ? '#EC5E54' : '#5CBC9E';
      }

      if (completedRounds) {
        this.setState({completedRounds: completedRounds.newValue});
      }
    });
  }

  syncStateListener() {
    chrome.storage.onChanged.addListener(({
      totalRounds,
      targetRounds,
      activeTask,
      pomodoroLen,
      breakLen,
      longBreakLen,
      longBreakAfter
    }, namespace) => {

      if (totalRounds) {
        this.setState({totalRounds: totalRounds.newValue});
      }

      if (targetRounds) {
        this.setState({targetRounds: targetRounds.newValue});
      }

      if (pomodoroLen) {
        this.setState({intervalLength: pomodoroLen.newValue * 60});
      }

      if (breakLen) {
        this.setState({breakIntervalLen: breakLen.newValue * 60});
      }

      if (longBreakLen) {
        this.setState({longBreakLen: longBreakLen.newValue * 60});
      }

      if (longBreakAfter) {
        this.setState({longBreakAfter: parseInt(longBreakAfter.newValue)});
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
    chrome.storage.sync.set({timerActive: true});
  }

  pauseTimer() {
    chrome.storage.sync.set({timerActive: false});
  }

  render() {
    let timerDuration = this.state.workInterval ? this.state.intervalLength : this.state.breakIntervalLen

    if (!this.state.workInterval) {
      if (this.state.completedRounds > 0 && this.state.completedRounds % this.state.longBreakAfter === 0) {
        timerDuration = this.state.longBreakLen;
      }
    }

    return (
      <div>

        <div className="icons">
          <div className="lh-icons">
            <Settings />
            <BlockList />
          </div>
          <h2>Tabodoro</h2>
        </div>

        <div className="timer-container">
          <div className="item">
            <h1>{this.state.activeTask}</h1>
            <svg width="500" height="500" viewBox="0 0 500 500">
              <g>
                <text id="timer-text" x="51%" y="-18%" textAnchor="middle" dominantBaseline="central" dy=".3em">
                  { this.timerDisplay(Math.abs(timerDuration - this.state.elapsedTime)) }
                </text>
                <circle id="circle" className="circle-animation" r="200" cy="250" cx="250" strokeWidth="3" stroke="white" fill="transparent">
                </circle>
              </g>
            </svg>
            { this.state.timerActive ? <div className="pause-btn" onClick={this.pauseTimer}></div> :
                <div className="play-btn" onClick={this.startTimer}></div>
            }
          </div>
        </div>

        <div id="completed-rounds">{this.state.totalRounds} pomodoros completed</div>
      </div>
    );
  }
}

export default Timer;
