/* global chrome */

import React from 'react';

class Settings extends React.Component {
  constructor() {
    super();

    this.state = {
      pomodoroLen: 25,
      breakLen: 5,
      longBreakLen: 15,
      longBreakAfter: 4,
      targetRounds: 10
    };

    this.saveSettings = this.saveSettings.bind(this);
    this._hideSettings = this._hideSettings.bind(this);
  }

  componentDidMount() {
    this.fetchSettings();
    document.addEventListener('click', this._hideSettings(), false);
  }

  _hideSettings() {
    return e => {
      let settings = document.getElementById('settings-container');
      let settingsIcon = document.getElementsByClassName('settings')[0];
      if (e.target !== settingsIcon && !settings.contains(e.target)) {
        settings.classList.add('hide');
      }
    }
  }

  fetchSettings() {
    chrome.storage.sync.get(this.state, ({pomodoroLen, breakLen, longBreakLen, longBreakAfter, targetRounds}) => {
      this.setState({pomodoroLen, breakLen, longBreakLen, longBreakAfter, targetRounds});
    });
  }

  toggleContentDisplay() {
    let settings = document.getElementById('settings-container');
    settings.classList.toggle('hide');
  }

  updateSettings(field) {
    return e => {
      if (isNaN(e.currentTarget.value)) {
        return;
      }
      this.setState({[field]: e.currentTarget.value});
    }
  }

  saveSettings() {
    chrome.storage.sync.set({
      pomodoroLen: this.state.pomodoroLen,
      breakLen: this.state.breakLen,
      longBreakLen: this.state.longBreakLen,
      longBreakAfter: this.state.longBreakAfter,
      targetRounds: this.state.targetRounds
    });
  }

  render() {
    return (
      <div>
        <div className={"settings icon"} onClick={ this.toggleContentDisplay }></div>
        <div id="settings-container" className="hide">
          <div>
            <h3 className="menu-title">Settings</h3>
          </div>
          <div className="setting-item">
            Pomodoro
            <input className="setting-input" type="text" value={this.state.pomodoroLen} onChange={ this.updateSettings('pomodoroLen')}/> min
          </div>
          <div className="setting-item">
            Short Break
            <input className="setting-input" type="text" value={this.state.breakLen} onChange={ this.updateSettings('breakLen')}/> min
          </div>
          <div className="setting-item">
            Long Break
            <input className="setting-input" type="text" value={this.state.longBreakLen} onChange={ this.updateSettings('longBreakLen')}/> min
          </div>
          <div className="setting-item">
            Long Break After
            <input className="setting-input" type="text" value={this.state.longBreakAfter} onChange={ this.updateSettings('longBreakAfter')}/> rounds
          </div>
          <div className="setting-item">
            Goal
            <input className="setting-input" type="text" value={this.state.targetRounds}  onChange={ this.updateSettings('targetRounds')}/> daily
          </div>
          <button className="save-settings" onClick={ this.saveSettings }>Save</button>
        </div>
      </div>
    );
  }
}

export default Settings;
