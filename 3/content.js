// content.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'collectPageInfo') {
    // 페이지 정보 수집
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      content: document.documentElement.outerHTML,
      timestamp: new Date().toISOString(),
    };

    // background.js로 페이지 정보 전송
    chrome.runtime.sendMessage({ action: 'sendToElasticsearch', data: pageInfo }, (response) => {
      if (response && response.success) {
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });

    // 비동기 응답을 위해 true 반환
    return true;
  }
});
