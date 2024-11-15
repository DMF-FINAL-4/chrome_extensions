// side_panel/side_panel.js

document.getElementById('close-button').addEventListener('click', () => {
  // 사이드 패널을 닫기 위해 백그라운드로 메시지 보내기
  chrome.runtime.sendMessage({ type: 'CLOSE_SIDEPANEL' });
});
