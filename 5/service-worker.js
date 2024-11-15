chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener(() => {  // 확장 프로그램 아이콘 클릭 시 호출되는 이벤트 리스너.
  chrome.sidePanel.setOptions({ path: 'sidepanels/sidePanel.html' });  // 아이콘 클릭 시 사이드 패널 열기.
});