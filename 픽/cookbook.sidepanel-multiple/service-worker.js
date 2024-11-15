
// service-worker.js
const Page = 'sidePanelHTML.html';
const mainPage = 'sidepanels/main-sp.html';

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ path: Page });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
