import React from 'react';

class Timer extends React.Component {
  constructor() {
    super();

    this.state = {
      workInterval: true,
      intervalLength: 10,
      elapsedTime: 0
    };

    this.startTimer = this.startTimer.bind(this);
  }

  componentDidMount() {
    console.log('here');
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
    let initialOffset = 1257
    let timer = setInterval(() => {
      this.setState({elapsedTime: this.state.elapsedTime + 1});

      if (this.state.elapsedTime === this.state.intervalLength) {
        clearInterval(timer);
        document.body.style.background = '#5CBC9E';
        return;
      }
      
      let circle = document.getElementsByClassName('circle-animation');
      let c = circle[0].style;
      c.strokeDashoffset = initialOffset-((this.state.elapsedTime+1)*((initialOffset)/this.state.intervalLength));

    }, 1000);
  }

  render() {
    return (
      <div className="item">
        <h1>Task Name</h1>
        <svg width="500" height="500" viewBox="0 0 500 500">
          <g>
            <text id="timer-text" x="51%" y="-18%" textAnchor="middle" dominantBaseline="central" stroke="white" strokeWidth="3px" dy=".3em">
              { this.timerDisplay(this.state.intervalLength - this.state.elapsedTime) }
            </text>
            <circle id="circle" className="circle-animation" r="200" cy="250" cx="250" strokeWidth="3" stroke="white" fill="transparent">
            </circle>
          </g>
        </svg>
        <div className="play-btn" onClick={this.startTimer}></div>
        { "Round 1/4" }
      </div>
    );
  }
}

export default Timer;
