// 요소 선택 모드 활성화 상태 플래그
let selecting = false;

// 아이콘 클릭 시 요소 선택 모드 활성화
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: toggleSelectionMode
    });
});

function toggleSelectionMode() {
    selecting = !selecting;  // 선택 모드 활성화/비활성화 토글
    if (selecting) {
        document.body.style.cursor = "crosshair";  // 커서 변경
        document.addEventListener("mouseover", highlightElement);  // 요소 하이라이트
        document.addEventListener("click", selectElement);  // 요소 선택
    } else {
        document.body.style.cursor = "default";  // 커서 복원
        document.removeEventListener("mouseover", highlightElement);
        document.removeEventListener("click", selectElement);
    }
}

function highlightElement(event) {
    event.target.style.outline = "2px solid red";  // 요소에 빨간색 윤곽 추가
    event.target.addEventListener("mouseout", () => {
        event.target.style.outline = "";  // 요소에서 마우스를 떼면 윤곽 제거
    }, { once: true });
}

function selectElement(event) {
    event.preventDefault();
    event.stopPropagation();
    const text = event.target.innerText.trim();  // 선택된 요소의 텍스트 가져오기

    if (text) {
        chrome.runtime.sendMessage({ action: "saveText", text: text });  // 텍스트 저장 요청 전송
    }
    
    toggleSelectionMode();  // 선택 모드 비활성화
}
