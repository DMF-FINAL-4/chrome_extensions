// background.js

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLOSE_SIDEPANEL') {
    if (sender.tab && sender.tab.id) {
      chrome.sidePanel.close({ tabId: sender.tab.id });
    }
  }
});
