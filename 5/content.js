// 현재 열려 있는 웹 페이지에 직접 삽입되어 페이지와 상호작용하는 역할을 합니다.

// 예시로, 페이지의 모든 링크를 추적하고 로그를 남기는 기능을 구현할 수 있습니다.
document.addEventListener('DOMContentLoaded', () => {
    console.log('Content script loaded on:', window.location.href);  // 현재 페이지 URL 출력.
  
    // 모든 링크 요소를 찾아 클릭 이벤트 추적.
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        console.log('User clicked on link:', link.href);  // 사용자가 클릭한 링크 출력.
      });
    });
  
    // 예시: 페이지의 HTML 데이터를 백그라운드로 전송하는 함수.
    chrome.runtime.sendMessage({
      action: 'SAVE_PAGE_CONTENT',
      url: window.location.href,
      html: document.documentElement.outerHTML
    }, response => {
      console.log('Response from background script:', response);  // 백그라운드에서 받은 응답 출력.
    });
  });