// side_panel/side_panel.js

// document.getElementById('close-button').addEventListener('click', () => {
// // 사이드 패널을 닫기 위해 백그라운드로 메시지 보내기
// chrome.runtime.sendMessage({ type: 'CLOSE_SIDEPANEL' });
// });


  // 자동 높이 조절 함수
  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';

    // 추가된 높이를 계산하여 CSS 변수에 저장
    const extraHeight = textarea.scrollHeight - 38; // 기본 높이 38px 제외
    document.documentElement.style.setProperty('--textarea-extra-height', extraHeight + 'px');
}

// 검색 입력창 자동 높이 조절 이벤트 등록
document.querySelectorAll('.search-group textarea').forEach(function(textarea) {
    textarea.addEventListener('input', function() {
        autoResizeTextarea(this);
    });
    // 초기 높이 조절
    autoResizeTextarea(textarea);
});


document.addEventListener('DOMContentLoaded', function() {
    // 기존의 초기화 코드
    // ...

    // 버튼 1-1 클릭 시 이벤트 처리
    const button1 = document.querySelector('.btn-group-left .btn:nth-child(1)');
    button1.addEventListener('click', function() {
        // 현재 활성 탭에 메시지 보내기
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: 'getPageInfo' }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    alert('현재 페이지에서 정보를 가져올 수 없습니다.');
                    return;
                }
                // 서버로 데이터 전송
                sendDataToServer(response);
            });
        });
    });
});

// 서버로 데이터 전송 함수
function sendDataToServer(data) {
  fetch('http://localhost:8000/pages/new_save/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  .then(response => {
      if (!response.ok) {
          return response.json().then(errData => {
              throw new Error(errData.error || 'Unknown error');
          });
      }
      return response.json();
  })
  .then(result => {
      alert('저장 성공!');
      // 문서 목록 갱신
      tab1Page = 0;
      document.getElementById('tab1-document-list').innerHTML = '';
      loadTab1Documents();
  })
  .catch(error => {
      console.error('Error saving document:', error);
      alert('저장 중 오류가 발생했습니다: ' + error.message);
  });
}



// 탭1 문서 목록 로드 함수
let tab1Page = 0; // 페이지 번호는 0부터 시작
function loadTab1Documents() {
    fetch('http://localhost:8000/pages/full_list/' + tab1Page, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(dataList => {
        let container = document.getElementById('tab1-document-list');
        dataList.forEach(data => {
            let docItem = document.createElement('div');
            docItem.className = 'document-item';

            // 키나 값이 없는 항목은 공란으로 처리
            let title = data.title || '';
            let url = data.alternate_url || '#';
            let favicon_link = data.favicon || 'default-icon.png';
            let keyword_list = data.keywords || [];
            let host_domain = data.host_domain || '';
            let short_summary = data.short_summary || '';
            let author = data.author || '';
            let document_create_time = data.date || '';
            let data_id = data.id || '';

            docItem.innerHTML = `
                <div class="document-title">
                    <input type="checkbox" class="form-check-input me-2">
                    <img src="${favicon_link}" alt="파비콘">
                    <span class="title">${title}</span>
                    <div class="document-actions ms-auto">
                        <button class="action-btn view-details" title="상세">
                            <i class="bi bi-eye icon"></i>
                            <span class="btn-text">상세</span>
                        </button>
                        <button class="action-btn open-url" title="URL">
                            <i class="bi bi-box-arrow-up-right icon"></i>
                            <span class="btn-text">URL</span>
                        </button>
                        <button class="action-btn delete" title="삭제">
                            <i class="bi bi-trash icon"></i>
                            <span class="btn-text">삭제</span>
                        </button>
                    </div>
                </div>
                <div class="document-details d-none">
                    <div class="detail-line">
                        <div>
                            <span class="author-info" data-author="${author}"></span>
                            <span class="separator"> | </span>
                            <span class="created-time" data-time="${document_create_time}"></span>
                        </div>
                        <span class="host-domain">${host_domain}</span>
                    </div>
                    <div class="summary">
                        ${short_summary}
                    </div>
                    <div class="keywords">
                        <div class="keyword-list">
                            ${keyword_list.map(keyword => `<span class="keyword-badge">${keyword}</span>`).join('')}
                        </div>
                        <button class="btn btn-sm btn-outline-primary hub-btn">허브</button>
                    </div>
                </div>
            `;
            // 이벤트 리스너 추가
            // 상세 보기 토글
            docItem.querySelector('.document-title').addEventListener('click', function(e) {
                if (e.target.closest('.document-actions') || e.target.closest('.action-btn') || e.target.tagName === 'INPUT') {
                    return;
                }
                let details = docItem.querySelector('.document-details');
                if (details.classList.contains('d-none')) {
                    details.classList.remove('d-none');
                    docItem.classList.add('expanded');
                } else {
                    details.classList.add('d-none');
                    docItem.classList.remove('expanded');
                }
            });
            // 삭제 버튼 이벤트
            let deleteBtn = docItem.querySelector('.delete');
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!docItem.querySelector('.confirm-delete')) {
                    let confirmBtn = document.createElement('button');
                    confirmBtn.className = 'btn btn-sm confirm-delete';
                    confirmBtn.textContent = '삭제확인';
                    deleteBtn.replaceWith(confirmBtn);
                    // 실제 삭제 동작
                    confirmBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        fetch(`http://localhost:8000/pages/id/${data_id}/`, {
                            method: 'DELETE',
                        })
                        .then(response => {
                            if (response.ok) {
                                docItem.remove();
                            } else {
                                console.error('Failed to delete document');
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting document:', error);
                        });
                    });
                    // 다른 곳 클릭 시 삭제확인 버튼 제거
                    document.addEventListener('click', function removeConfirm(e) {
                        if (!confirmBtn.contains(e.target)) {
                            confirmBtn.replaceWith(deleteBtn);
                            document.removeEventListener('click', removeConfirm);
                        }
                    });
                }
            });
            // URL 버튼 이벤트
            let openUrlBtn = docItem.querySelector('.open-url');
            openUrlBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                window.open(url, '_blank');
            });
            container.appendChild(docItem);
        });
        tab1Page++; // 다음 페이지를 위해 페이지 번호 증가
        updateLabels();
    })
    .catch(error => {
        console.error('Error fetching documents:', error);
    });
}

// 초기 로드 시 문서 목록 불러오기
document.addEventListener('DOMContentLoaded', function() {
    loadTab1Documents();
});

// 더보기 버튼 이벤트
document.getElementById('tab1-load-more').addEventListener('click', function() {
    loadTab1Documents();
});

// 탭2 문서 목록 로드 함수
let tab2Page = 1;
function loadTab2Documents() {
    // 예시 데이터 생성
    let dataList = [];
    for (let i = 0; i < 50; i++) {
        dataList.push({
            title: '탭2 문서 제목 ' + ((tab2Page - 1) * 50 + i + 1),
            url: '#',
            favicon_link: '', // 파비콘 링크 없을 시 디폴트 아이콘 사용
            host_domain: 'example.net'
        });
    }

    let container = document.getElementById('tab2-document-list');
    dataList.forEach(data => {
        let docItem = document.createElement('div');
        docItem.className = 'document-item';
        docItem.innerHTML = `
            <div class="document-title">
                <input type="checkbox" class="form-check-input me-2">
                <img src="${data.favicon_link || 'default-icon.png'}" alt="파비콘">
                <span class="title">${data.title}</span>
                <div class="document-actions ms-auto">
                    <button class="action-btn delete" title="삭제">
                        <i class="bi bi-trash icon"></i>
                        <span class="btn-text">삭제</span>
                    </button>
                </div>
            </div>
        `;
        // 삭제 버튼 이벤트는 탭1과 동일하게 적용
        let deleteBtn = docItem.querySelector('.delete');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!docItem.querySelector('.confirm-delete')) {
                let confirmBtn = document.createElement('button');
                confirmBtn.className = 'btn btn-sm confirm-delete';
                confirmBtn.textContent = '삭제확인';
                deleteBtn.replaceWith(confirmBtn);
                // 실제 삭제 동작
                confirmBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    // 삭제 로직 구현
                    docItem.remove();
                });
                // 다른 곳 클릭 시 삭제확인 버튼 제거
                document.addEventListener('click', function removeConfirm(e) {
                    if (!confirmBtn.contains(e.target)) {
                        confirmBtn.replaceWith(deleteBtn);
                        document.removeEventListener('click', removeConfirm);
                    }
                });
            }
        });
        container.appendChild(docItem);
    });
    tab2Page++;
}

// 초기 로드
document.addEventListener('DOMContentLoaded', function() {
    loadTab2Documents();
});
// 더보기 버튼 이벤트
document.getElementById('tab2-load-more').addEventListener('click', function() {
    loadTab2Documents();
});

// 탭 전환 시 문서 로드
var tabTriggerList = [].slice.call(document.querySelectorAll('a[data-bs-toggle="tab"]'));
tabTriggerList.forEach(function(tabEl) {
    tabEl.addEventListener('shown.bs.tab', function (e) {
        if (e.target.id === 'tab2-tab' && tab2Page === 1) {
            loadTab2Documents();
        }
    });
});

// 반응형 라벨 표시
function updateLabels() {
    const isWide = window.innerWidth >= 600;
    document.querySelectorAll('.author-info').forEach(function(element) {
        const text = element.getAttribute('data-author');
        element.textContent = text;
    });
    document.querySelectorAll('.created-time').forEach(function(element) {
        const text = element.getAttribute('data-time');
        element.textContent = text;
    });
    // 라벨 처리
    document.querySelectorAll('.separator').forEach(function(element) {
        element.style.display = 'inline';
    });
    if (isWide) {
        document.querySelectorAll('.author-info').forEach(function(element) {
            if (element.textContent) {
                element.textContent = '작성자: ' + element.textContent;
            }
        });
        document.querySelectorAll('.created-time').forEach(function(element) {
            if (element.textContent) {
                element.textContent = '문서작성일: ' + element.textContent;
            }
        });
    }
    // 버튼 텍스트 표시 업데이트
    document.querySelectorAll('.document-actions .action-btn .btn-text').forEach(function(element) {
        element.style.display = isWide ? 'inline' : 'none';
    });
}
window.addEventListener('resize', updateLabels);
updateLabels();