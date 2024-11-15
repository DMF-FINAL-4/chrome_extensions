// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const sendButton = document.getElementById('send-page-info');
  const statusDiv = document.getElementById('status');

  sendButton.addEventListener('click', () => {
    // 현재 활성 탭 가져오기
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // content.js를 현재 탭에 주입
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ['content.js'],
        },
        () => {
          // content.js에 메시지 전송하여 페이지 정보 수집 요청
          chrome.tabs.sendMessage(tabId, { action: 'collectPageInfo' }, (response) => {
            if (chrome.runtime.lastError) {
              statusDiv.textContent = '오류 발생: ' + chrome.runtime.lastError.message;
            } else if (response && response.success) {
              statusDiv.textContent = '페이지 정보가 성공적으로 전송되었습니다!';
            } else {
              statusDiv.textContent = '페이지 정보 전송에 실패했습니다.';
            }
          });
        }
      );
    });
  });
});
