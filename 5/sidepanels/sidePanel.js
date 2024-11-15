document.addEventListener('DOMContentLoaded', function () {
    var tabTriggerElements = [].slice.call(document.querySelectorAll('#myTab button[data-bs-toggle="tab"]'));
    tabTriggerElements.forEach(function (tabTriggerElement) {
        var tabTrigger = new bootstrap.Tab(tabTriggerElement);
        tabTriggerElement.addEventListener('click', function (event) {
            event.preventDefault();
            tabTrigger.show();
        });
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const listContainer = document.getElementById('list-container');
    const contentArea = document.querySelector('.content');
    const archiveButtons = document.querySelector('.archive-buttons');
    const autoSaveSwitch = document.querySelector('.auto-save-switch');
    const searchAreaArchive = document.querySelector('.footer.archive-search');
    const searchAreaHistory = document.querySelector('.footer.history-search');

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
        </div>`;

    function switchTab(tabId) {
        if (tabId === 'pages-tab') {
            listContainer.innerHTML = pagesContent;
            contentArea.style.backgroundColor = '#ffffff';
            archiveButtons.style.display = 'block';
            autoSaveSwitch.style.display = 'none';
            searchAreaArchive.style.display = 'block';
            searchAreaHistory.style.display = 'none';
        } else if (tabId === 'history-tab') {
            listContainer.innerHTML = historyContent;
            contentArea.style.backgroundColor = '#e9ecef';
            archiveButtons.style.display = 'none';
            autoSaveSwitch.style.display = 'block';
            searchAreaArchive.style.display = 'none';
            searchAreaHistory.style.display = 'block';
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            switchTab(tab.id);
        });
    });

    // 초기 로드
    switchTab('pages-tab');
});
