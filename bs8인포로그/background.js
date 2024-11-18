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

// 탭이 업데이트되었을 때 실행되는 리스너
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 페이지 로드가 완료되었을 때만 실행
  if (changeInfo.status === 'complete') {
    // 탭 2의 스위치 상태 확인 (localStorage에서 상태를 가져옴)
    chrome.storage.local.get(['tab2SwitchState'], (result) => {
      if (result.tab2SwitchState) {
        // 스위치가 활성화된 경우 content.js를 현재 탭에 실행
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js'],
        });
      }
    });
  }
});
