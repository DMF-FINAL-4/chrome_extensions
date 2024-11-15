// IndexedDB에서 데이터를 가져와 글로벌 사이트 패널에 표시합니다.
let db;
const request = indexedDB.open("ElementClipperDB", 1); // IndexedDB 데이터베이스 열기

// 데이터베이스 연결에 성공했을 때 실행
request.onsuccess = (event) => {
  db = event.target.result;
  displayClips(); // 저장된 클립을 화면에 표시하는 함수 호출
};

// 저장된 클립을 화면에 표시하는 함수
function displayClips() {
  const transaction = db.transaction("clips", "readonly"); // 읽기 전용 트랜잭션 시작
  const store = transaction.objectStore("clips"); // 저장소 객체 접근
  const request = store.getAll(); // 저장된 모든 항목 가져오기

  // 데이터를 성공적으로 가져왔을 때 실행
  request.onsuccess = (event) => {
    const clips = event.target.result; // 저장된 클립 데이터
    const clipList = document.getElementById("clipList"); // HTML에서 리스트 요소 가져오기
    clipList.innerHTML = ""; // 기존 리스트 초기화

    // 각 클립을 리스트 항목으로 추가
    clips.forEach((clip) => {
      const listItem = document.createElement("li"); // 리스트 항목 생성
      listItem.textContent = `${clip.pageTitle} - ${clip.pageUrl}`; // 페이지 제목과 URL을 텍스트로 설정
      clipList.appendChild(listItem); // 리스트에 항목 추가
    });
  };
}
