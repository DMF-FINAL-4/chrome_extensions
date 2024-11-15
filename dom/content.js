// 페이지 내에서 사용자가 요소를 선택할 수 있도록 돕는 기능을 포함합니다.
let selecting = false; // 선택 모드 활성화 상태를 나타내는 플래그

// 요소 선택 모드 토글 함수
function toggleSelectionMode() {
  selecting = !selecting; // 선택 모드 활성화/비활성화 토글
  if (selecting) {
    document.body.style.cursor = "crosshair"; // 선택 모드일 때 커서를 십자 모양으로 변경
    document.addEventListener("mouseover", highlightElement); // 마우스를 요소 위에 올렸을 때 이벤트
    document.addEventListener("click", selectElement); // 요소 클릭 시 이벤트
  } else {
    document.body.style.cursor = "default"; // 기본 커서로 복원
    document.removeEventListener("mouseover", highlightElement);
    document.removeEventListener("click", selectElement);
  }
}

// 마우스를 요소 위에 올렸을 때 요소를 하이라이트하는 함수
function highlightElement(event) {
  event.target.style.outline = "2px solid red"; // 요소를 빨간색 윤곽선으로 강조
  event.target.addEventListener("mouseout", () => {
    event.target.style.outline = ""; // 마우스를 떼면 윤곽선 제거
  }, { once: true });
}

// 요소를 클릭하여 선택하는 함수
function selectElement(event) {
  event.preventDefault();
  event.stopPropagation();
  const element = event.target; // 선택한 요소
  const text = element.innerText.trim(); // 요소 내의 텍스트 가져오기
  const images = Array.from(element.querySelectorAll("img")) // 요소 내의 이미지 URL 가져오기
                      .map(img => img.src);
  const pageTitle = document.title; // 페이지 제목 가져오기
  const pageUrl = window.location.href; // 현재 페이지의 URL 가져오기

  // 선택한 요소의 텍스트, 이미지 URL, 페이지 제목 및 URL을 background.js로 전달하여 저장 요청
  chrome.runtime.sendMessage({
    action: "saveClip",
    data: {
      text: text,
      images: images,
      pageTitle: pageTitle,
      pageUrl: pageUrl,
      timestamp: new Date().toISOString() // 저장 시간
    }
  });

  toggleSelectionMode(); // 선택 모드 비활성화
}