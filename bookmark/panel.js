// "clipList"라는 ID를 가진 요소를 가져옴 (저장된 텍스트 목록을 표시할 위치)
const clipList = document.getElementById("clipList");

// IndexedDB 데이터베이스 연결 요청
let db;
const request = indexedDB.open("TextClipperDB", 1);

// 데이터베이스 연결에 성공했을 때 실행
request.onsuccess = (event) => {
    db = event.target.result;  // 데이터베이스 객체 할당
    displayClips();  // 저장된 텍스트를 화면에 표시하는 함수 호출
};

// 저장된 텍스트를 화면에 표시하는 함수
function displayClips() {
    // "clips" 저장소에 읽기 전용 트랜잭션 시작
    const transaction = db.transaction("clips", "readonly");
    // "clips" 저장소 객체
    const store = transaction.objectStore("clips");
    // 모든 데이터를 가져오는 요청
    const request = store.getAll();

    // 데이터를 가져오는 요청이 성공했을 때 실행
    request.onsuccess = (event) => {
        const clips = event.target.result;  // 저장된 텍스트 데이터
        // 각 저장된 텍스트 항목을 리스트로 추가
        clips.forEach((clip) => {
            // 리스트 항목을 생성
            const listItem = document.createElement("li");
            // 텍스트와 시간 정보를 리스트 항목에 설정
            listItem.textContent = `${clip.text} - ${clip.timestamp}`;
            // 리스트에 리스트 항목 추가
            clipList.appendChild(listItem);
        });
    };
}
