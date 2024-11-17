// side_panel.js

// 자동 높이 조절 함수
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// URL 유효성 검사 함수
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// 문서 아이템 생성 함수
function createDocumentItem(container, data) {
    let docItem = document.createElement('div');
    docItem.className = 'document-item';

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
            <img src="${favicon_link}" alt="파비콘" onerror="this.onerror=null; this.src='default-icon.png';">
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
                    <span class="author-info" data-author="${author}">작성자: ${author}</span>
                    <span class="separator"> | </span>
                    <span class="created-time" data-time="${document_create_time}">문서작성일: ${document_create_time}</span>
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

    // 상세보기 버튼 이벤트
    let viewDetailsBtn = docItem.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showDocumentDetailsModal(data_id);
    });

    container.appendChild(docItem);
}

// 모달 창 표시 함수
function showDocumentDetailsModal(docId) {
    fetch(`http://localhost:8000/pages/id/${docId}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.error || 'Unknown error');
            });
        }
        return response.json();
    })
    .then(data => {
        // 모달 창에 데이터 표시
        const detailsContent = document.getElementById('document-details-content');
        detailsContent.innerHTML = ''; // 기존 내용 초기화

        // 데이터 객체의 키와 값을 순회하여 테이블로 표시
        const table = document.createElement('table');
        table.className = 'table table-bordered';

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                const row = document.createElement('tr');

                const keyCell = document.createElement('th');
                keyCell.textContent = key;
                keyCell.style.width = '30%';
                keyCell.style.wordBreak = 'break-all';

                const valueCell = document.createElement('td');
                valueCell.style.wordBreak = 'break-all';
                if (typeof value === 'object' && value !== null) {
                    valueCell.textContent = JSON.stringify(value, null, 2);
                } else if (typeof value === 'string' && isValidURL(value)) {
                    const link = document.createElement('a');
                    link.href = value;
                    link.target = '_blank';
                    link.textContent = value;
                    valueCell.appendChild(link);
                } else {
                    valueCell.textContent = value;
                }

                row.appendChild(keyCell);
                row.appendChild(valueCell);
                table.appendChild(row);
            }
        }

        detailsContent.appendChild(table);

        // 모달 창 표시
        let modal = new bootstrap.Modal(document.getElementById('documentDetailsModal'));
        modal.show();
    })
    .catch(error => {
        console.error('Error fetching document details:', error);
        alert('문서 상세 정보를 가져오는 중 오류가 발생했습니다: ' + error.message);
    });
}

// 검색 문서 함수
function searchDocuments(queryText, tabNumber) {
    // tabNumber: 1 또는 2
    fetch('http://localhost:8000/pages/text_search/', {
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
        let container = document.getElementById(`tab${tabNumber}-document-list`);
        container.innerHTML = '';

        // 검색 결과 표시
        dataList.forEach(data => {
            createDocumentItem(container, data);
        });

        // 페이지 번호 초기화 (필요 시)
        if (tabNumber === 1) {
            tab1Page = 0;
        } else if (tabNumber === 2) {
            tab2Page = 0;
        }

        // 라벨 업데이트 (필요 시)
        updateLabels();
    })
    .catch(error => {
        console.error('Error during search:', error);
        alert('검색 중 오류가 발생했습니다: ' + error.message);
    });
}

// 문서 상세 모달을 위한 Bootstrap Modal 초기화 (필요 시)
document.addEventListener('DOMContentLoaded', function() {
    // 검색 입력창 자동 높이 조절 이벤트 등록
    document.querySelectorAll('.search-group textarea').forEach(function(textarea) {
        // 초기 내용 지우기
        textarea.value = '';
        // 입력 이벤트 리스너 등록
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
    });

    // 검색 버튼 클릭 이벤트 리스너 추가 (탭 1)
    const searchButton1 = document.getElementById('searchButton1');
    searchButton1.addEventListener('click', function() {
        const queryText = document.querySelector('#tab1-content .search-group textarea').value.trim();
        if (queryText) {
            searchDocuments(queryText, 1);
        } else {
            alert('검색어를 입력하세요.');
        }
    });

    // 검색 버튼 클릭 이벤트 리스너 추가 (탭 2)
    const searchButton2 = document.getElementById('searchButton2');
    searchButton2.addEventListener('click', function() {
        const queryText = document.querySelector('#tab2-content .search-group textarea').value.trim();
        if (queryText) {
            searchDocuments(queryText, 2);
        } else {
            alert('검색어를 입력하세요.');
        }
    });

    // 더 불러오기 버튼 클릭 이벤트 리스너 추가 (탭 1)
    const loadMoreButton1 = document.querySelector('#tab1-load-more .btn-load-more');
    loadMoreButton1.addEventListener('click', function() {
        loadMoreDocuments(1);
    });

    // 더 불러오기 버튼 클릭 이벤트 리스너 추가 (탭 2)
    const loadMoreButton2 = document.querySelector('#tab2-load-more .btn-load-more');
    loadMoreButton2.addEventListener('click', function() {
        loadMoreDocuments(2);
    });
});

// 페이지 번호 초기화
let tab1Page = 0;
let tab2Page = 0;

// 더 불러오기 함수
function loadMoreDocuments(tabNumber) {
    fetch(`http://localhost:8000/pages/full_list/${tabNumber}?page=${tabNumber === 1 ? tab1Page : tab2Page}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(dataList => {
        let container = document.getElementById(`tab${tabNumber}-document-list`);
        dataList.forEach(data => {
            createDocumentItem(container, data);
        });
        if (tabNumber === 1) {
            tab1Page++;
        } else if (tabNumber === 2) {
            tab2Page++;
        }
        updateLabels();
    })
    .catch(error => {
        console.error('Error fetching more documents:', error);
    });
}

// 라벨 업데이트 함수 (필요 시 구현)
function updateLabels() {
    // 예: 페이지 번호 표시, 총 문서 수 표시 등
    // 현재 예시는 구현되지 않았습니다.
}
