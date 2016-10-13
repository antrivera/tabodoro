/* global chrome */
import React from 'react';
import Modal from 'react-modal';

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
      ],
      open: false
    };

    this._handleEnterKey = this._handleEnterKey.bind(this);
    this.blockSite = this.blockSite.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentWillMount() {
    chrome.storage.local.get('blocklistOnEnter', ({blocklistOnEnter}) => {
      if (blocklistOnEnter) {
        this.openModal();
        chrome.storage.local.set({blocklistOnEnter: false});
      }
    });
  }

  componentDidMount() {
    this.syncBlockList();
    this.blockedSitesListener();
  }

  componentDidUpdate() {
    let input = document.querySelector(".new-blocklist-site");
    if (input) {
      input.addEventListener('keydown', this._handleEnterKey, false);
    }
  }

  openModal() {
    this.setState({open: true});
  }

  closeModal() {
    this.setState({open: false});
  }

  _handleEnterKey(e) {
    if (e.keyCode === 13) {
      this.blockSite();
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

  blockedSitesListener() {
    chrome.storage.onChanged.addListener(({blockedSites}, namespace) => {
      if (blockedSites) {
        this.setState({blockedSites: blockedSites.newValue});
      }
    });
  }

  blockSite() {
    if (!this.isValidDomain(this.state.siteName)) {
      // invalid domain name
      return;
    }
    chrome.storage.sync.set({blockedSites: [...this.state.blockedSites, this.state.siteName]});
    this.setState({blockedSites: [...this.state.blockedSites, this.state.siteName]});
  }

  isValidDomain(domain) {
    let regex = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
    return domain.match(regex);
  }

  removeSite(site) {
    return () => {
      let idx = this.state.blockedSites.indexOf(site);
      this.state.blockedSites.splice(idx, 1);
      this.setState({blockedSites: this.state.blockedSites});
      chrome.storage.sync.set({blockedSites: this.state.blockedSites});
    }
  }

  render() {
    const styles = {
      overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.30)'
      },
      content: {
        top: 100,
        bottom: 100,
        left: 250,
        right: 250,
        border: '2px solid #ccc',
        color: 'black'
      }
    }

    return (
      <div>
        <div className={"blocklist icon"} onClick={ this.openModal } ></div>
        <Modal isOpen={this.state.open} onRequestClose={this.closeModal} style={styles}>

        <div id="blocklist-container">
          <div>
            <h3 className="menu-title">Blocklist</h3>
            <p>{"Websites listed below will be inaccessible while a work interval timer is active."}</p>
          </div>
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
                <div className={"site-item"} >{site}
                  <button className="remove-site-btn" onClick={ this.removeSite(site) }>Remove</button>
                </div>
              </li>
            )) }
          </ul>
        </div>
      </Modal>
      </div>
    );
  }
}

export default BlockList;
