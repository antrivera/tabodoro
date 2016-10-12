/* global chrome */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#config').addEventListener('click', () => {
    chrome.storage.local.set({settingsOnEnter: true}, () => {
      window.open(chrome.extension.getURL("timer.html"))
    });
  });

  document.querySelector('#blocklist').addEventListener('click', () => {
    chrome.storage.local.set({blocklistOnEnter: true}, () => {
      window.open(chrome.extension.getURL("timer.html"))
    });
  });
});
