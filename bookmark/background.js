let db;
const request = indexedDB.open("ElementSelectorDB", 1);

// 데이터베이스가 처음 생성될 때 실행
request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("elements")) {
        db.createObjectStore("elements", { autoIncrement: true });
    }
};

// 데이터베이스 연결 성공 시 실행
request.onsuccess = (event) => {
    db = event.target.result;
};

// 콘텐츠 스크립트로부터 메시지를 받을 때 실행
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "saveText" && db) {
        const transaction = db.transaction("elements", "readwrite");
        const store = transaction.objectStore("elements");
        store.add({ text: message.text, timestamp: new Date().toISOString() });
    }
});
