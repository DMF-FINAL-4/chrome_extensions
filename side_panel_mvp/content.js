let mousePosition = { x: 0, y: 0 };  // 마우스 위치 저장 변수

// 마우스 위치를 업데이트하는 함수
document.addEventListener("mouseup", (e) => {
  mousePosition = { x: e.clientX, y: e.clientY };  // 현재 마우스 위치 저장
  const selectedText = window.getSelection().toString().trim();

  if (selectedText) {
    console.log("Sending message to background script");

    chrome.runtime.sendMessage(
      { action: "fetchWordMeaning", word: selectedText },
      (response) => {
        if (response.success) {
          console.log("Received definition:", response.definition);
          showPopup(response.definition);  // 마우스 좌표 전달 없이 팝업 생성
        } else {
          console.error("Error:", response.error);
        }
      }
    );
  }
});

// 팝업을 표시하는 함수 (마우스 위치를 mousePosition 변수에서 사용)
function showPopup(definition) {
  const popup = document.createElement("div");
  popup.innerText = definition;
  popup.style.position = "absolute";
  popup.style.backgroundColor = "660099";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "15px";
  popup.style.zIndex = "9999";

  // 팝업 위치를 저장된 마우스 좌표로 설정
  popup.style.left = `${mousePosition.x}px`;
  popup.style.top = `${mousePosition.y}px`;

  document.body.appendChild(popup);

  // 일정 시간 후 팝업 제거
  setTimeout(() => {
    popup.remove();
  }, 5000);
}
