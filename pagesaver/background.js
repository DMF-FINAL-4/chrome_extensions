// background.js

chrome.commands.onCommand.addListener((command) => {
  if (command === 'save_page') {
    saveCurrentPage();
  }
});

// Function to save the current page to IndexedDB
function saveCurrentPage() {
  // Fetch the current tab to get its URL and title
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let tab = tabs[0];
    if (tab) {
      // Get the tab URL and title
      let url = tab.url; // 현재 탭의 URL을 가져옴
      let title = tab.title; // 현재 탭의 제목을 가져옴

      // Execute a script to get the HTML content of the page
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML // 페이지의 전체 HTML 콘텐츠를 가져옴
      }, (results) => {
        if (results && results[0]) {
          let htmlContent = results[0].result; // 가져온 HTML 콘텐츠 저장

          // Save to IndexedDB
          saveToIndexedDB(url, title, htmlContent); // IndexedDB에 저장하는 함수 호출
        }
      });
    }
  });
}

// Function to save the data to IndexedDB
function saveToIndexedDB(url, title, htmlContent) {
  let request = indexedDB.open('PageStorage', 1); // IndexedDB에 'PageStorage' 데이터베이스를 열거나 새로 만듦
  request.onupgradeneeded = (event) => {
    let db = event.target.result;
    if (!db.objectStoreNames.contains('pages')) {
      db.createObjectStore('pages', { keyPath: 'id', autoIncrement: true }); // 자동 증가 ID를 사용하는 Object Store 생성
    }
  };

  request.onsuccess = (event) => {
    let db = event.target.result;
    let transaction = db.transaction(['pages'], 'readwrite'); // 'pages' Object Store에 대한 읽기/쓰기 트랜잭션 생성
    let store = transaction.objectStore('pages');

    let data = {
      url: url,
      title: title,
      htmlContent: htmlContent
    };

    let addRequest = store.add(data); // 데이터를 Object Store에 추가
    addRequest.onsuccess = () => {
      // Show success message after saving
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '저장 완료',
        message: '페이지가 성공적으로 저장되었습니다.'
      });
    };

    addRequest.onerror = (e) => {
      console.error('Error saving to IndexedDB', e.target.error);
    };
  };

  request.onerror = (e) => {
    console.error('Error opening IndexedDB', e.target.error);
  };
}

// Listen for messages to trigger the save_page command
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'save_page') {
    saveCurrentPage();
  }
});
