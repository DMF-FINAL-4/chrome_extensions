// content.js

// 메시지 수신 대기
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    // 현재 페이지의 URL과 HTML을 가져옴
    const pageInfo = {
      url: window.location.href,
      html: document.documentElement.outerHTML,
      duplicates: false, // 기본값으로 설정
    };
    // 응답 전송
    sendResponse(pageInfo);
  }
  // 메시지 리스너는 true를 반환해야 비동기 응답을 보낼 수 있음
  return true;
});

// 2초 후 페이지 정보 서버에 전송
setTimeout(() => {
  const pageInfo = {
    url: window.location.href,
    html: document.documentElement.outerHTML,
  };

  // 서버로 데이터 전송
  fetch('http://localhost:8000/history/new_save/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pageInfo),
  })
    .then((response) => {
      if (!response.ok) {
        console.error('Failed to save page to history');
      }
      return response.json();
    })
    .then((result) => {
      console.log('Page saved to history:', result);
    })
    .catch((error) => {
      console.error('Error saving page to history:', error);
    });
}, 2000); // 페이지 로드 후 2초 대기
