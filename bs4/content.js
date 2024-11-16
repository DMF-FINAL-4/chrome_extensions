// content.js

// 메시지 수신 대기
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageInfo') {
      // 현재 페이지의 URL과 HTML을 가져옴
      const pageInfo = {
        url: window.location.href,
        html: document.documentElement.outerHTML,
        duplicates: false // 기본값으로 설정
      };
      // 응답 전송
      sendResponse(pageInfo);
    }
    // 메시지 리스너는 true를 반환해야 비동기 응답을 보낼 수 있음
    return true;
  });
  


