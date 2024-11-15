// side_panel/side_panel.js

document.getElementById('close-button').addEventListener('click', () => {
  // 사이드 패널을 닫기 위해 백그라운드로 메시지 보내기
  chrome.runtime.sendMessage({ type: 'CLOSE_SIDEPANEL' });
});




document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const listContainer = document.getElementById('list-container');
  const contentArea = document.querySelector('.content');
  const footer = document.querySelector('.footer');
  const archiveButtons = document.querySelector('.archive-buttons');
  const autoSaveSwitch = document.querySelector('.auto-save-switch');
  const searchAreaArchive = document.querySelector('.footer.archive-search');
  const searchAreaHistory = document.querySelector('.footer.history-search');
  const aiSwitch = document.querySelector('.footer.ai-switch');

  const pagesContent = `
      <div class="list-item">
          <div class="d-flex align-items-center">
              <img src="" alt="." class="favicon me-2">
              <span class="page-name">Page Item 1</span>
          </div>
          <div class="buttons">
              <button class="icon-btn" title="View"><i class="bi bi-eye"></i></button>
              <button class="icon-btn" title="URL"><i class="bi bi-link-45deg"></i></button>
              <button class="icon-btn" title="Delete"><i class="bi bi-trash"></i></button>
          </div>
      </div>`;

  const historyContent = `
      <div class="list-group-item d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
              <img src="" alt="." class="favicon me-2">
              <span class="history-name">History Item 1</span>
          </div>
          <div>
              <button class="icon-btn" title="URL"><i class="bi bi-link-45deg"></i></button>
              <button class="icon-btn" title="Delete"><i class="bi bi-trash"></i></button>
          </div>
      </div>
  `;

  tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
          e.preventDefault();
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          if (tab.id === 'pages-tab') {
              listContainer.innerHTML = pagesContent;
              contentArea.style.backgroundColor = '#ffffff';
              archiveButtons.style.display = 'block';
              autoSaveSwitch.style.display = 'none';
              searchAreaArchive.style.display = 'block';
              searchAreaHistory.style.display = 'none';
          } else if (tab.id === 'history-tab') {
              listContainer.innerHTML = historyContent;
              contentArea.style.backgroundColor = '#e9ecef';
              archiveButtons.style.display = 'none';
              autoSaveSwitch.style.display = 'block';
              searchAreaArchive.style.display = 'none';
              searchAreaHistory.style.display = 'block';
          }
      });
  });

  // 초기 로드
  listContainer.innerHTML = pagesContent;
  contentArea.style.backgroundColor = '#ffffff';
  archiveButtons.style.display = 'block';
  autoSaveSwitch.style.display = 'none';
  searchAreaArchive.style.display = 'block';
  searchAreaHistory.style.display = 'none';
});