// IndexedDB 데이터베이스 초기화와 단축키로 요소 선택 모드 활성화 기능을 수행합니다.
let db;
const request = indexedDB.open("ElementClipperDB", 1); // IndexedDB 데이터베이스를 엽니다.

// 데이터베이스가 처음 생성될 때 실행됩니다.
request.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains("clips")) {
    db.createObjectStore("clips", { autoIncrement: true }); // "clips" 저장소 생성 (자동 증가 키 사용)
  }
};

// 데이터베이스 연결에 성공했을 때 실행됩니다.
request.onsuccess = (event) => {
  db = event.target.result;
};

// 확장 프로그램 설치 시 사이드 패널 설정
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }); // 아이콘 클릭 시 사이드 패널 열기 설정
});

// 단축키로 요소 선택 모드 활성화
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-selection-mode") { // 명령이 "toggle-selection-mode"인 경우
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleSelectionMode // 스크립트 내에서 정의된 함수를 직접 실행하도록 수정
      });
    });
  }
});
