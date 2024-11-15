// contentScript.js

(function() {
  // 기존에 사이드바가 있는지 확인
  if (document.getElementById('my-extension-shadow-host')) {
    return; // 이미 사이드바가 있으면 중복 생성 방지
  }

  // Shadow DOM 호스트 생성
  const shadowHost = document.createElement('div');
  shadowHost.id = 'my-extension-shadow-host';
  shadowHost.style.position = 'fixed';
  shadowHost.style.top = '0';
  shadowHost.style.right = '0';
  shadowHost.style.width = '300px';
  shadowHost.style.height = '100%';
  shadowHost.style.zIndex = '100000'; // 다른 요소보다 위에 표시
  document.body.appendChild(shadowHost);

  // Shadow DOM 생성
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  // 사이드바 iframe 삽입
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('sidebar/sidebar.html');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  shadowRoot.appendChild(iframe);
})();

// 메시지 수신 및 사이드바 제거
window.addEventListener('message', (event) => {
  if (event.data.type && event.data.type === 'CLOSE_SIDEBAR') {
    const shadowHost = document.getElementById('my-extension-shadow-host');
    if (shadowHost) {
      shadowHost.remove();
    }
  }
});
