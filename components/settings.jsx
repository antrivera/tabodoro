/* global chrome */
import React from 'react';
import Modal from 'react-modal';

class Settings extends React.Component {
  constructor() {
    super();

    this.state = {
      pomodoroLen: 25,
      breakLen: 5,
      longBreakLen: 15,
      longBreakAfter: 4,
      targetRounds: 10,
      open: false
    };

    this.saveSettings = this.saveSettings.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentWillMount() {
    Modal.setAppElement('#root');
    chrome.storage.local.get('settingsOnEnter', ({settingsOnEnter}) => {
      if (settingsOnEnter) {
        this.openModal();
        chrome.storage.local.set({settingsOnEnter: false});
      }
    });
  }

  componentDidMount() {
    this.fetchSettings();
  }

  openModal() {
    this.setState({open: true});
  }

  closeModal() {
    this.setState({open: false});
  }

  fetchSettings() {
    chrome.storage.sync.get(this.state, ({pomodoroLen, breakLen, longBreakLen, longBreakAfter, targetRounds}) => {
      this.setState({pomodoroLen, breakLen, longBreakLen, longBreakAfter, targetRounds});
    });
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

    this.closeModal();
  }

  render() {
    const styles = {
      content: {
        top: 100,
        bottom: 100,
        left: 250,
        right: 250,
        color: 'black'
      }
    }

    return (
      <div>
        <div className={"settings icon"} onClick={ this.openModal }></div>
        <Modal isOpen={this.state.open} onRequestClose={this.closeModal} style={styles}>
          <div id="settings-container">
            <div>
              <h3 className="menu-title">Settings</h3>
            </div>
            <div className="setting-item">
              <label htmlFor="pomodoro">Pomodoro</label>
              <input id="pomodoro" className="setting-input" type="text" value={this.state.pomodoroLen} onChange={ this.updateSettings('pomodoroLen')}/> min
            </div>
            <div className="setting-item">
              <label htmlFor="short-break">Short Break</label>
              <input id="short-break" className="setting-input" type="text" value={this.state.breakLen} onChange={ this.updateSettings('breakLen')}/> min
            </div>
            <div className="setting-item">
              <label htmlFor="long-break">Long Break</label>
              <input id="long-break" className="setting-input" type="text" value={this.state.longBreakLen} onChange={ this.updateSettings('longBreakLen')}/> min
            </div>
            <div className="setting-item">
              <label htmlFor="long-break-after">Long Break After</label>
              <input id="long-break-after" className="setting-input" type="text" value={this.state.longBreakAfter} onChange={ this.updateSettings('longBreakAfter')}/> rounds
            </div>
            <div className="setting-item">
              <label htmlFor="target">Target</label>
              <input id="target" className="setting-input" type="text" value={this.state.targetRounds}  onChange={ this.updateSettings('targetRounds')}/> daily
            </div>
            <button className="save-settings" onClick={ this.saveSettings }>Save</button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Settings;
