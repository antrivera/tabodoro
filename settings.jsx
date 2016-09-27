/* global chrome */

import React from 'react';

class Settings extends React.Component {
  constructor() {
    super();
  }

  toggleContentDisplay() {
    let settings = document.getElementById('settings-container');
    settings.classList.toggle('hide');
  }

  render() {
    return (
      <div>
        <div className={"settings icon"} onClick={ this.toggleContentDisplay }></div>
        <div id="settings-container" className="hide">
          <div className="setting-item">
            Pomodoro <input className="setting-input" type="text" placeholder="25" step="5" min="10" max="60" /> min
          </div>
          <div className="setting-item">
            Short Break <input className="setting-input" type="text" placeholder="5" step="5" min="10" max="60" /> min
          </div>
          <div className="setting-item">
            Long Break <input className="setting-input" type="text" placeholder="15" step="5" min="10" max="60" /> min
          </div>
          <div className="setting-item">
            Long Break After <input className="setting-input" type="text" placeholder="4" step="5" min="10" max="10" /> rounds
          </div>
          <div className="setting-item">
            Goal <input className="setting-input" type="text" placeholder="10"  max="50" /> daily
          </div>
          <button className="save-settings">Save</button>
        </div>
      </div>
    );
  }
}

export default Settings;
