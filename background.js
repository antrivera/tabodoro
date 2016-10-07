/* global chrome */
class BlockedSitesManager {
  constructor() {
    this.blockedSites = [
      'facebook.com',
      'twitter.com',
      'reddit.com',
      'netflix.com',
      'hulu.com'
    ]
  }

  getBlockedSites() {
    return this.blockedSites;
  }

  blockSite(site) {
    this.blockedSites.push(site);
    return this.blockedSites;
  }

  clearSite(site) {
    let idx = this.blockedSites.indexOf(site);
    if (idx !== -1) {
      this.blockedSites.splice(idx, 1);
    }
    return this.blockedSites;
  }
}

class TimerManager {
  constructor() {
    this.timer;
    this.timerState = {
      elapsedTime: 0,
      totalRounds: 0,
      completedRounds: 0,
      workInterval: true,
      intervalLength: 25,
      breakIntervalLen: 5,
      longBreakLen: 15,
      longBreakAfter: 5,
      strokeDashOffset: 1257
    }

    this.synchTimerState();
    this.addChangeListener();
  }

  addChangeListener() {
    chrome.storage.onChanged.addListener(({pomodoroLen, breakLen, longBreakLen, longBreakAfter}, namespace) => {
      if (pomodoroLen) {
        this.timerState.intervalLength = pomodoroLen.newValue*60;
      }
      if (breakLen) {
        this.timerState.breakIntervalLen = breakLen.newValue*60;
      }
      if (longBreakLen) {
        this.timerState.longBreakLen = longBreakLen.newValue*60;
      }
      if (longBreakAfter) {
        this.timerState.longBreakAfter = longBreakAfter.newValue;
      }
    });
  }

  synchTimerState() {
    let {totalRounds, completedRounds, workInterval, intervalLength, breakIntervalLen, longBreakLen, longBreakAfter, strokeDashOffset} = this.timerState;
    chrome.storage.sync.get({totalRounds, completedRounds, workInterval, pomodoroLen: intervalLength, breakLen: breakIntervalLen, longBreakLen, longBreakAfter, timerActive: false},
    ({totalRounds, completedRounds, workInterval, pomodoroLen, breakLen, longBreakLen, longBreakAfter, timerActive}) => {
      this.timerState.workInterval = workInterval;
      this.timerState.intervalLength = pomodoroLen*60;
      this.timerState.breakIntervalLen = breakLen*60;
      this.timerState.longBreakLen = longBreakLen*60;
      this.timerState.longBreakAfter = longBreakAfter;
      this.timerState.totalRounds = totalRounds;
      this.timerState.completedRounds = completedRounds;
    });

    chrome.storage.local.get({strokeDashOffset}, ({strokeDashOffset}) => {
      this.timerState.strokeDashOffset = strokeDashOffset;
    });
  }

  intervalEnd(msg) {
    alert(msg);
  }

  startTimer() {
    let initialOffset = 1257;
    this.timer = setInterval(() => {
      this.timerState.elapsedTime += 1;
      chrome.storage.local.set({elapsedTime: this.timerState.elapsedTime});

      let updatedTime = this.timerState.elapsedTime;
      let timerDuration = this.timerState.workInterval ? this.timerState.intervalLength : this.timerState.breakIntervalLen;

      if (!this.timerState.workInterval) {
        if (this.timerState.completedRounds % this.timerState.longBreakAfter === 0) {
          timerDuration = this.timerState.longBreakLen;
        }
      }

      if (timerDuration - this.timerState.elapsedTime < 0) {
        if (this.timerState.workInterval) {
          this.timerState.workInterval = false;
          this.timerState.completedRounds = this.timerState.completedRounds + 1;
          this.timerState.totalRounds = this.timerState.totalRounds + 1;
          this.timerState.elapsedTime = 0;

          chrome.storage.sync.set({workInterval: this.timerState.workInterval, completedRounds: this.timerState.completedRounds, totalRounds: this.timerState.totalRounds});
          chrome.storage.local.set({elapsedTime: this.timerState.elapsedTime });

          this.intervalEnd('Time for a break.');
        } else {
          this.timerState.workInterval = true;
          this.timerState.elapsedTime = 0;

          chrome.storage.sync.set({workInterval: this.timerState.workInterval});
          chrome.storage.local.set({elapsedTime: this.timerState.elapsedTime});

          this.intervalEnd('Time to get back to work!');

          if (this.timerState.completedRounds === 10) {
            clearInterval(this.timer);
            this.timerState.timerActive = false
            chrome.storage.sync.set({timerActive: false});
          }
        }

        this.timerState.strokeDashOffset = initialOffset;
        chrome.storage.local.set({strokeDashOffset: this.timerState.strokeDashOffset});
        return;
      }

      this.timerState.strokeDashOffset = initialOffset-((updatedTime)*((initialOffset)/timerDuration));
      chrome.storage.local.set({strokeDashOffset: this.timerState.strokeDashOffset});
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.timer);
    chrome.storage.sync.set({timerActive: false});
  }
}

const BSM = new BlockedSitesManager();
const TM = new TimerManager();


chrome.storage.onChanged.addListener(({timerActive}, namespace) => {
  if (!timerActive) return;
  if (timerActive.newValue) {
    TM.startTimer();
  } else {
    if (TM.timer && !timerActive.newValue) {
      TM.pauseTimer();
    }
  }
});

chrome.tabs.onUpdated.addListener((tabId, changedInfo, tab) => {
  chrome.storage.sync.get({blockedSites: BSM.getBlockedSites(), workInterval: true, timerActive: false}, ({blockedSites, workInterval, timerActive}) => {
    if (workInterval && timerActive) {
      blockedSites.forEach( site => {
        if (tab.url.match(site)) {
          chrome.tabs.update(tabId, {"url": "timer.html"});
        }
      });
    }
  });
});
