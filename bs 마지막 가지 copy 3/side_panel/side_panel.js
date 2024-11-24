// side_panel/side_panel.js

// 자동 높이 조절 함수
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// DOMContentLoaded 이벤트 내에서 검색창 초기화 및 높이 조절
document.addEventListener('DOMContentLoaded', function() {
    // 기존의 초기화 코드...

    // 검색 입력창 자동 높이 조절 이벤트 등록 (탭 1과 탭 2 모두에 적용)
    document.querySelectorAll('.search-group textarea').forEach(function(textarea) {
        // 초기 내용 지우기
        textarea.value = '';
        // 입력 이벤트 리스너 등록
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // 탭 전환 시 문서 로드
    var tabTriggerList = [].slice.call(document.querySelectorAll('a[data-bs-toggle="tab"]'));
    tabTriggerList.forEach(function(tabEl) {
        tabEl.addEventListener('shown.bs.tab', function (e) {
            if (e.target.id === 'tab2-tab') {
                // 탭2가 활성화될 때 페이지 번호 초기화 및 문서 목록 초기화
                tab2Page = 0;
                const container = document.getElementById('tab2-document-list');
                if (container) {
                    container.innerHTML = '';
                }
                loadTab2Documents();
            } else if (e.target.id === 'tab1-tab') {
                // 탭1이 활성화될 때 필요한 로직이 있으면 추가
                // 예: tab1Page = 0; document.getElementById('tab1-document-list').innerHTML = ''; loadTab1Documents();
            }
        });
    });

    // 초기 로드 시 기본 탭이 활성화되어 있지 않다면, 필요에 따라 초기 문서 목록 로드
    const defaultTab = document.querySelector('a[data-bs-toggle="tab"].active');
    if (defaultTab && defaultTab.id === 'tab1-tab') {
        loadTab1Documents();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // 기존의 초기화 코드
    // ...

    // 버튼1-1 클릭 시 이벤트 처리
    const button1 = document.querySelector('.aaaaaaa .btn:nth-child(1)');
    if (button1) {
        button1.addEventListener('click', function() {
            // 현재 활성 탭에 메시지 보내기
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const activeTab = tabs[0];

                // content.js를 현재 탭에 명시적으로 로드
                chrome.scripting.executeScript(
                    {
                        target: { tabId: activeTab.id },
                        files: ['content.js']
                    },
                    () => {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError);
                            alert('현재 페이지에서 정보를 가져올 수 없습니다.');
                            return;
                        }
                        
                        // 탭1 문서 목록에 '새 페이지 분석중' 항목 추가
                        addAnalyzingDocumentItem();
                        
                        // content.js가 로드된 후 현재 탭에 메시지를 보내 정보를 요청
                        chrome.tabs.sendMessage(activeTab.id, { action: 'getPageInfo' }, function(response) {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError);
                                alert('현재 페이지에서 정보를 가져올 수 없습니다.');
                                removeAnalyzingDocumentItem(); // 오류 발생 시 항목 제거
                                return;
                            }
                            // 서버로 데이터 전송
                            sendDataToServer(response);
                        });
                    }
                );
            });
        });
    }
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
      removeAnalyzingDocumentItem(); // 성공 시 항목 제거
      // 문서 목록 갱신
      tab1Page = 0;
      document.getElementById('tab1-document-list').innerHTML = '';
      loadTab1Documents();
  })
  .catch(error => {
      console.error('Error saving document:', error);
      alert('저장 중 오류가 발생했습니다: ' + error.message);
      removeAnalyzingDocumentItem(); // 오류 발생 시 항목 제거
  });
}

// 탭1 문서 목록에 '새 페이지 분석중' 항목 추가 함수
function addAnalyzingDocumentItem() {
    let container = document.getElementById('tab1-document-list');
    let analyzingItem = document.createElement('div');
    analyzingItem.className = 'document-item analyzing';
    analyzingItem.id = 'analyzing-document-item';
    analyzingItem.innerHTML = `
        <div class="document-title">
            <span class="title">새 페이지 분석중...</span>
        </div>
    `;
    container.prepend(analyzingItem);
}

// '새 페이지 분석중' 항목 제거 함수
function removeAnalyzingDocumentItem() {
    let analyzingItem = document.getElementById('analyzing-document-item');
    if (analyzingItem) {
        analyzingItem.remove();
    }
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
            createDocumentItem(container, data);
        });
        tab1Page++; // 다음 페이지를 위해 페이지 번호 증가
        updateLabels();

        // 일반 문서 목록에서는 더보기 버튼 표시
        let loadMoreButton = document.getElementById('tab1-load-more');
        loadMoreButton.style.display = 'block';
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

// 유효한 URL인지 확인하는 함수
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

// 상세보기 표시설정
const keySettings = [
    // ... (이전과 동일)
];

// 사용자 피드백을 위한 Toast 초기화
const copyToastEl = document.getElementById('copyToast');
const copyToast = new bootstrap.Toast(copyToastEl);

// 'Copy All' 버튼 클릭 시 전체 데이터를 복사하는 함수
function copyAllData(data) {
    // ... (이전과 동일)
}

// 개별 데이터 복사 함수
function copySingleData(label, value) {
    // ... (이전과 동일)
}

// 상세보기 버튼 이벤트
function showDocumentDetailsModal(docId) {
    // ... (이전과 동일)
}

// URL 유효성 검사 함수
function isValidURL(string) {
    // ... (이전과 동일)
}

// 검색 이벤트 -분기 처리로 대체
function searchDocuments(queryText) {
    // ... (이전과 동일)
}

// 앤터 검색
document.addEventListener('DOMContentLoaded', function () {
    // ... (이전과 동일)
});

// 검색 결과 목록 표시
function createDocumentItem(container, data) {
    let docItem = document.createElement('div');
    docItem.className = 'document-item expanded';

    // 필요한 데이터 처리
    let title = data.title || '';
    let url = data.alternate_url || '#';
    let favicon_link = data.favicon || 'default-icon.png';
    let keyword_list = data.keywords || [];
    let host_domain = data.host_domain || '';
    let short_summary = data.short_summary || '';
    let author = data.author || '';
    let document_create_time = data.date === '0001-01-01' ? '' : data.date || '';
    let created_at = data.created_at || '';
    let data_id = data.id || '';

    docItem.innerHTML = `
        <div class="document-title">
            <input type="checkbox" class="form-check-input me-2">
            <img src="${favicon_link}" alt="파비콘" class="favicon-img" onerror="this.onerror=null; this.src='default-icon.png';">
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
        <div class="document-details">
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
                <button class="btn btn-sm  hub-btn bi bi-zoom-in">관련</button>
            </div>
            <div class="keywords">
                <div class="keyword-list">
                    ${keyword_list.map(keyword => `<span class="keyword-badge">${keyword}</span>`).join('')}
                </div>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-dark folder-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        폴더
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#">개발자의 삶</a></li>
                        <li><a class="dropdown-item" href="#">미국대선 이슈</a></li>
                        <li><a class="dropdown-item" href="#">나의 요리 레시피</a></li>
                        <li><a class="dropdown-item" href="#">+ 새 폴더</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // favicon 이미지 오류 처리
    const faviconImg = docItem.querySelector('.favicon-img');
    faviconImg.addEventListener('error', function() {
        this.src = 'default-icon.png';
    });

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

    // 상세보기 버튼 이벤트
    let viewDetailsBtn = docItem.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showDocumentDetailsModal(data_id);
    });

    // 키워드 클릭 이벤트
    const keywordBadges = docItem.querySelectorAll('.keyword-badge');
    keywordBadges.forEach(badge => {
        badge.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!badge.classList.contains('highlighted')) {
                // 키워드 강조
                badge.classList.add('highlighted');

                // 다른 곳 클릭 시 강조 취소
                const removeHighlight = function(event) {
                    if (!badge.contains(event.target)) {
                        badge.classList.remove('highlighted');
                        document.removeEventListener('click', removeHighlight);
                    }
                };
                document.addEventListener('click', removeHighlight);
            } else {
                // 강조된 키워드 다시 클릭 시 검색 실행
                const keyword = badge.textContent.trim();
                fetch('http://localhost:8000/pages/tag_search/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({'tag': 'keywords', 'keyword': keyword, 'method': 'term'})
                })
                .then(response => response.json())
                .then(dataList => {
                    // 문서 목록 갱신
                    container.innerHTML = '';
                    dataList.forEach(data => {
                        createDocumentItem(container, data);
                    });
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
            }
        });
    });

    // 폴더 버튼 이벤트
    const folderButton = docItem.querySelector('.folder-btn');
    const dropdownItems = docItem.querySelectorAll('.dropdown-item');

    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedText = item.textContent.trim();
            folderButton.textContent = selectedText;
        });
    });

    // 허브 버튼 이벤트
    let hubBtn = docItem.querySelector('.hub-btn');
    hubBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showHubModal(data);
    });

    container.appendChild(docItem);
}

// 허브 모달 표시 함수
function showHubModal(selectedDocumentData) {
    // 모달 창 표시
    let hubModal = new bootstrap.Modal(document.getElementById('hubModal'));
    hubModal.show();

    // 좌측 열에 선택한 문서 정보 표시
    let selectedDocContainer = document.getElementById('hub-selected-document');
    selectedDocContainer.innerHTML = ''; // 기존 내용 초기화

    // 선택한 문서 아이템 생성
    let docItem = document.createElement('div');
    docItem.className = 'document-item expanded';

    // 필요한 데이터 처리
    let title = selectedDocumentData.title || '';
    let url = selectedDocumentData.alternate_url || '#';
    let favicon_link = selectedDocumentData.favicon || 'default-icon.png';
    let keyword_list = selectedDocumentData.keywords || [];
    let host_domain = selectedDocumentData.host_domain || '';
    let short_summary = selectedDocumentData.short_summary || '';
    let author = selectedDocumentData.author || '';
    let document_create_time = selectedDocumentData.date === '0001-01-01' ? '' : selectedDocumentData.date || '';
    let created_at = selectedDocumentData.created_at || '';
    let data_id = selectedDocumentData.id || '';

    docItem.innerHTML = `
        <div class="document-title">
            <input type="checkbox" class="form-check-input me-2">
            <img src="${favicon_link}" alt="파비콘" class="favicon-img" onerror="this.onerror=null; this.src='default-icon.png';">
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
        <div class="document-details">
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
            </div>
        </div>
    `;

    // 이벤트 리스너 추가 (필요에 따라 추가)
    // 예: docItem.querySelector('.view-details').addEventListener('click', ...);

    // 좌측 열에 추가
    selectedDocContainer.appendChild(docItem);

    // 라벨 업데이트
    updateLabels();

    // 좌측 열에 탭2의 관련 문서 표시
    let keywords = selectedDocumentData.keywords || [];
    let queryText = keywords.join(' ');
    searchTab2Documents(queryText, 'hub-tab2-related-documents', true);

    // 우측 열에 탭1의 관련 문서 표시
    let docId = selectedDocumentData.id;
    fetch('http://localhost:8000/pages/similar_search/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'doc_id': docId })
    })
    .then(response => response.json())
    .then(dataList => {
        let container = document.getElementById('hub-tab1-related-documents');
        container.innerHTML = '';
        dataList.forEach(data => {
            createDocumentItem(container, data);
        });
    })
    .catch(error => {
        console.error('Error fetching similar documents:', error);
    });
}

// AI 검색 이벤트
function aiSearchDocuments(queryText) {
    // ... (이전과 동일)
}

// 탭2가 활성화될 때 문서 목록을 다시 로드
document.getElementById('tab2-tab').addEventListener('shown.bs.tab', function () {
    loadTab2Documents();
});  

// 탭2 문서 목록 로드 함수 수정 (필요 시)
let tab2Page = 0;
function loadTab2Documents() {
    fetch(`http://localhost:8000/history/full_list/${tab2Page}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(dataList => {
        let container = document.getElementById('tab2-document-list');
        if (!container) {
            console.error('tab2-document-list 요소를 찾을 수 없습니다.');
            return;
        }

        dataList.forEach(data => {
            createTab2DocumentItem(container, data);
        });
        tab2Page++; // 다음 페이지를 위해 페이지 번호 증가
    })
    .catch(error => {
        console.error('Error fetching documents:', error);
    });
}

// 탭2 문서 아이템 생성 함수
function createTab2DocumentItem(container, data, hideButtonText = false) {
    let docItem = document.createElement('div');
    docItem.className = 'document-item';

    // 키나 값이 없는 항목은 공란 또는 기본값으로 처리
    let title = data.title || '제목 없음';
    let url = data.url || '#';
    let favicon_link = data.favicon || 'default-icon.png';
    let created_at = data.created_at || '';
    let data_id = data.id || '';

    docItem.innerHTML = `
        <div class="document-title">
            <input type="checkbox" class="form-check-input me-2">
            <img src="${favicon_link}" alt="파비콘" onerror="this.onerror=null; this.src='default-icon.png';">
            <span class="title">${title}</span>
            <div class="document-actions ms-auto">
                <button class="action-btn view-details" title="상세">
                    <i class="bi bi-eye icon"></i>
                    ${!hideButtonText ? '<span class="btn-text">상세</span>' : ''}
                </button>
                <button class="action-btn open-url" title="URL">
                    <i class="bi bi-box-arrow-up-right icon"></i>
                    ${!hideButtonText ? '<span class="btn-text">URL</span>' : ''}
                </button>
                <button class="action-btn delete" title="삭제">
                    <i class="bi bi-trash icon"></i>
                    ${!hideButtonText ? '<span class="btn-text">삭제</span>' : ''}
                </button>
            </div>
        </div>
    `;

    // favicon 이미지 오류 처리
    const faviconImg = docItem.querySelector('img');
    faviconImg.addEventListener('error', function() {
        this.src = 'default-icon.png';
    });

    // 상세보기 버튼 이벤트
    let viewDetailsBtn = docItem.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showDocumentDetailsModal2(data_id, title, url, created_at);
    });

    // URL 버튼 이벤트
    let openUrlBtn = docItem.querySelector('.open-url');
    openUrlBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        window.open(url, '_blank');
    });

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
                fetch(`http://localhost:8000/history/id/${data_id}/`, {
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

    container.appendChild(docItem);
}

// 상세보기 버튼 이벤트
function showDocumentDetailsModal2(docId, title, url, created_at) {
    // ... (이전과 동일)
}

// 더보기 버튼 이벤트
document.getElementById('tab2-load-more').addEventListener('click', function() {
    loadTab2Documents();
});

// 검색 이벤트 구현
function initializeTab2SearchEvents() {
    // ... (이전과 동일)
}

document.addEventListener('DOMContentLoaded', function () {
    initializeTab2SearchEvents();
});

// 검색 기능 구현
function searchTab2Documents(queryText, containerId, hideButtonText = false) {
    fetch('http://localhost:8000/history/text_search/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query_text: queryText }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.error || 'Unknown error');
            });
        }
        return response.json();
    })
    .then(dataList => {
        // 문서 목록 영역 초기화
        let container = document.getElementById(containerId);
        container.innerHTML = '';

        // 검색 결과 표시
        dataList.forEach(data => {
            createTab2DocumentItem(container, data, hideButtonText);
        });
    })
    .catch(error => {
        console.error('Error during Tab 2 search:', error);
        alert('검색 중 오류가 발생했습니다: ' + error.message);
    });
}

// 반응형 라벨 표시
function updateLabels() {
    // ... (이전과 동일)
}
window.addEventListener('resize', updateLabels);
updateLabels();
