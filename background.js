/* global chrome */
class BlockedSitesManager {
  constructor() {
    this.blockedSites = [
      'facebook.com',
      'youtube.com',
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

const BSM = new BlockedSitesManager();

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
