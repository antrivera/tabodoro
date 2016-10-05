/* global chrome */
import React from 'react';

class BlockList extends React.Component {
  constructor() {
    super();

    this.state = {
      siteName: "",
      blockedSites: [
        'facebook.com',
        'youtube.com',
        'twitter.com',
        'reddit.com',
        'netflix.com',
        'hulu.com'
      ]
    };

    this._hideBlocklist = this._hideBlocklist.bind(this);
    this.blockSite = this.blockSite.bind(this);
  }

  componentDidMount() {
    this.syncBlockList();
    document.addEventListener('click', this._hideBlocklist(), false);
  }

  _hideBlocklist() {
    return e => {
      let blocklist = document.getElementById('blocklist-container');
      let blocklistIcon = document.getElementsByClassName('blocklist')[0];
      if (e.target !== blocklistIcon && !blocklist.contains(e.target)) {
        blocklist.classList.add('hide');
      }
    }
  }

  update(name) {
    return e => {this.setState({siteName: e.currentTarget.value})};
  }

  syncBlockList() {
    chrome.storage.sync.get({blockedSites: this.state.blockedSites}, ({blockedSites}) => {
      this.setState({blockedSites});
    });
  }

  toggleContentDisplay() {
    let blocklist = document.getElementById('blocklist-container');
    blocklist.classList.toggle('hide');

  }

  blockSite() {
    chrome.storage.sync.set({blockedSites: [...this.state.blockedSites, this.state.siteName]});
    this.setState({blockedSites: [...this.state.blockedSites, this.state.siteName]});
  }

  removeSite(site) {

  }

  render() {
    return (
      <div>
        <div className={"blocklist icon"} onClick={ this.toggleContentDisplay } ></div>
        <div id="blocklist-container" className="hide">
          <div className="blocklist-input">
            <input className={"new-blocklist-site"}
              type="text"
              placeholder="Enter a site..."
              value={this.state.siteName}
              ref="new-blocklist-site"
              onChange={this.update("siteName")} />
            <button className={"add-new-site"} onClick={this.blockSite}>Add</button>
          </div>
          <ul id="blocklist-items">
            { this.state.blockedSites.map((site, idx) => (
              <li key={idx + site}>
                <div className={"site-item"} >{site}</div>
              </li>
            )) }
          </ul>
        </div>
      </div>
    );
  }
}

export default BlockList;
