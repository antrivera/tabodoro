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

  componentDidMount() {
    this.fetchTotalRounds();
    this.fetchActiveTask();
    this.fetchIntervalLength();
    this.fetchCurrentDate();
    this.fetchTimerState();
    this.syncStateListener();
  }

  fetchTimerState() {
    chrome.storage.sync.get({workInterval: this.state.workInterval, timerActive: this.state.timerActive},
    ({workInterval, timerActive}) => {
      this.setState({workInterval, timerActive});
    });
  }

  fetchCurrentDate() {
    let now = new Date;
    chrome.storage.sync.get({timeStamp: {day: now.getDate(), month: now.getMonth(), year: now.getFullYear()}},
    ({timeStamp}) => {
      let today = new Date;
      if (today.getDate() !== timeStamp.day || today.getMonth() !== timeStamp.month || today.getFullYear() !== timeStamp.year) {
        this.resetCompletedPomodoros();
      }
    });
  }

  resetCompletedPomodoros() {
    chrome.storage.sync.set({totalRounds: 0});
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

  fetchTotalRounds() {
    chrome.storage.sync.get('totalRounds', ({totalRounds}) => {
      if (totalRounds) {
        this.setState({totalRounds});
      }
    });
  }

  fetchActiveTask() {
    chrome.storage.sync.get('activeTask', ({activeTask}) => {
      if (activeTask) {
        this.setState({activeTask});
      }
    });
  }

  syncStateListener() {
    chrome.storage.onChanged.addListener(({
      totalRounds,
      completedRounds,
      activeTask,
      pomodoroLen,
      timerActive,
      elapsedTime,
      breakLen,
      longBreakLen,
      longBreakAfter
    }, namespace) => {

      if (totalRounds) {
        this.setState({totalRounds: totalRounds.newValue});
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
        this.setState({longBreakAfter: longBreakAfter.newValue});
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

  intervalEnd(msg) {
    let ringer = document.getElementById('ringer')
    ringer.play();
    alert(msg);
    ringer.pause();
    ringer.currentTime = 0;
  }

  startTimer() {
    let initialOffset = 1257;
    this.setState({timerActive: true});
    chrome.storage.sync.set({timerActive: true});

    this.timer = setInterval(() => {
      this.setState({elapsedTime: this.state.elapsedTime + 1});

      let circle = document.getElementsByClassName('circle-animation');
      let c = circle[0].style;
      let updatedTime = this.state.elapsedTime + 1;

      let timerDuration = this.state.workInterval ? this.state.intervalLength : this.state.breakIntervalLen

      if (!this.state.workInterval) {
        if (this.state.completedRounds % this.state.longBreakAfter === 0) {
          timerDuration = this.state.longBreakLen;
        }
      }

      if (this.state.elapsedTime % timerDuration === 0) {
        if (this.state.workInterval) {
          this.setState({
            workInterval: false,
            completedRounds: this.state.completedRounds + 1,
            elapsedTime: 0
          });

          chrome.storage.sync.set({
            completedRounds: this.state.completedRounds,
            totalRounds: this.state.totalRounds + 1,
            workInterval: false
          });
          this.intervalEnd('Time for a break');

          document.body.style.background = '#5CBC9E';
          c.strokeDashoffset = initialOffset;
        } else {
          this.setState({
            workInterval: true,
            elapsedTime: 0
          });

          chrome.storage.sync.set({workInterval: true});

          this.intervalEnd('Time to get to work');

          document.body.style.background = '#EC5E54';
          c.strokeDashoffset = initialOffset;

          if (this.state.completedRounds === this.state.targetRounds) {
            clearInterval(this.timer);
            chrome.storage.sync.set({timerActive: false});
            this.setState({timerActive: false});
          }
        }

        return;
      }

      c.strokeDashoffset = initialOffset-((updatedTime)*((initialOffset)/timerDuration));
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.timer);
    chrome.storage.sync.set({timerActive: false});
    this.setState({timerActive: false});
  }

  render() {
    let timerDuration = this.state.workInterval ? this.state.intervalLength : this.state.breakIntervalLen

    if (!this.state.workInterval) {
      if (this.state.completedRounds % this.state.longBreakAfter === 0) {
        timerDuration = this.state.longBreakLen;
      }
    }

    return (
      <div>
        <h2>Tabodoro</h2>

        <div className="icons">
          <Settings />
          <Tasks />
          <BlockList />
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
