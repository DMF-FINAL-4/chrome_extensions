document.addEventListener('DOMContentLoaded', () => {
    // 버튼 클릭 시 현재 페이지 저장 요청을 보냄
    document.getElementById('saveButton').addEventListener('click', () => {
        chrome.runtime.sendMessage({ command: 'save_page' });
    });

    // IndexedDB에서 저장된 페이지 목록 불러오기
    let request = indexedDB.open('PageStorage', 1);
    request.onsuccess = (event) => {
        let db = event.target.result;
        let transaction = db.transaction(['pages'], 'readonly');
        let store = transaction.objectStore('pages');

        let pageList = document.getElementById('pageList');
        pageList.innerHTML = '';

        store.openCursor().onsuccess = (event) => {
            let cursor = event.target.result;
            if (cursor) {
                let listItem = document.createElement('li');
                listItem.textContent = cursor.value.title;
                pageList.appendChild(listItem);
                cursor.continue();
            }
        };
    };
});
