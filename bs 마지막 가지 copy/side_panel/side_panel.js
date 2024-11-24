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
        // 초기 높이 조절
        // autoResizeTextarea(textarea);
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
    // 예를 들어, 탭1이 기본 탭이라면:
    const defaultTab = document.querySelector('a[data-bs-toggle="tab"].active');
    if (defaultTab && defaultTab.id === 'tab1-tab') {
        loadTab1Documents();
    }
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
    {
        key: "created_at",
        label: "저장 일시",
        formatter: value => {
            const date = new Date(value);
            return date.toLocaleString();
        }
    },
    {
        key: "host_name",
        label: "호스트 이름"
    },
    {
        key: "host_domain",
        label: "호스트 도메인"
    },
    {
        key: "alternate_url",
        label: "URL",
        formatter: value => {
            const link = document.createElement('a');
            link.href = value;
            link.target = '_blank';
            link.textContent = value;
            return link;
        }
    },
    {
        key: "title",
        label: "제목"
    },
    {
        key: "author",
        label: "작성자"
    },
    {
        key: "date",
        label: "작성일",
        formatter: value => {
            const date = new Date(value);
            return date.toLocaleDateString();
        }
    },
    {
        key: "keywords",
        label: "키워드",
        formatter: value => value.join(', ')
    },
    {
        key: "category_keywords",
        label: "카테고리 키워드",
        formatter: value => value.join(', ')
    },
    {
        key: "short_summary",
        label: "짧은 요약"
    },
    {
        key: "long_summary",
        label: "긴 요약"
    },
    {
        key: "content_length",
        label: "전문 길이(분)"
    },
    {
        key: "content",
        label: "전문",
        formatter: value => {
            const div = document.createElement('div');
            div.textContent = value; // 텍스트 그대로 삽입
            div.style.whiteSpace = 'pre-wrap'; // 줄바꿈 유지
            return div;
        }
    },
    {
        key: "image_links",
        label: "이미지",
        formatter: value => {
            if (Array.isArray(value) && value.length > 0) {
                const list = document.createElement('ul');
                value.forEach(image => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = image.url;
                    link.target = '_blank';
                    link.textContent = image.caption || "이름 없는 이미지";
                    listItem.appendChild(link);
                    list.appendChild(listItem);
                });
                return list;
            }
            return '이미지 없음';
        }
    },
    {
        key: "links",
        label: "링크",
        formatter: value => {
            if (Array.isArray(value) && value.length > 0) {
                const list = document.createElement('ul');
                value.forEach(linkItem => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = linkItem.url;
                    link.target = '_blank';
                    link.textContent = linkItem.caption || "이름 없는 링크";
                    listItem.appendChild(link);
                    list.appendChild(listItem);
                });
                return list;
            }
            return '링크 없음';
        }
    },
    {
        key: "media",
        label: "미디어",
        formatter: value => {
            if (Array.isArray(value) && value.length > 0) {
                const list = document.createElement('ul');
                value.forEach(mediaItem => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = mediaItem.url;
                    link.target = '_blank';
                    link.textContent = mediaItem.caption || "이름 없는 미디어";
                    listItem.appendChild(link);
                    list.appendChild(listItem);
                });
                return list;
            }
            return '미디어 없음';
        }
    },
    {
        key: "file_download_links",
        label: "첨부파일",
        formatter: value => {
            if (Array.isArray(value) && value.length > 0) {
                const list = document.createElement('ul');
                value.forEach(file => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = file.url;
                    link.target = '_blank';
                    link.textContent = `${file.caption || "이름 없는 첨부파일"} (${file.size})`;
                    listItem.appendChild(link);
                    list.appendChild(listItem);
                });
                return list;
            }
            return '파일 없음';
        }
    },
    {
        key: "comments",
        label: "댓글",
        formatter: value => {
            if (Array.isArray(value) && value.length > 0) {
                const list = document.createElement('ul');
                value.forEach(comment => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${comment.author} (${comment.date}): ${comment.content}`;
                    list.appendChild(listItem);
                });
                return list;
            }
            return '댓글 없음';
        }
    }
];

// 사용자 피드백을 위한 Toast 초기화
const copyToastEl = document.getElementById('copyToast');
const copyToast = new bootstrap.Toast(copyToastEl);

// 'Copy All' 버튼 클릭 시 전체 데이터를 복사하는 함수
function copyAllData(data) {
    let copyText = '';
    keySettings.forEach(setting => {
        const { key, label } = setting;
        if (data.hasOwnProperty(key)) {
            let value = data[key];
            if (Array.isArray(value)) {
                value = JSON.stringify(value, null, 2);
            } else if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value, null, 2);
            }
            copyText += `${label}: ${value}\n\n`;
        }
    });
    navigator.clipboard.writeText(copyText.trim())
        .then(() => {
            copyToast.show();
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            alert('복사에 실패했습니다.');
        });
}

// 개별 데이터 복사 함수
function copySingleData(label, value) {
    let copyText = `${label}: ${value}`;
    navigator.clipboard.writeText(copyText)
        .then(() => {
            copyToast.show();
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            alert('복사에 실패했습니다.');
        });
}

// 상세보기 버튼 이벤트
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
        const detailsContent = document.getElementById('document-details-content');
        detailsContent.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'table table-bordered';

        keySettings.forEach(setting => {
            const { key, label, formatter } = setting;
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                const row = document.createElement('tr');

                // 키 셀 (복사 버튼을 왼쪽에 배치)
                const keyCell = document.createElement('th');
                keyCell.style.width = '30%';

                const copyButton = document.createElement('button');
                copyButton.className = 'btn btn-sm btn-light border-0 me-2';
                copyButton.innerHTML = '<i class="bi bi-copy"></i>';
                copyButton.title = '복사';
                copyButton.addEventListener('click', () => {
                    let copyValue = '';
                    if (Array.isArray(value)) {
                        copyValue = value.join(', ');
                    } else if (typeof value === 'object' && value !== null) {
                        copyValue = JSON.stringify(value, null, 2);
                    } else {
                        copyValue = value;
                    }
                    copySingleData(label, copyValue);
                });

                const labelSpan = document.createElement('span');
                labelSpan.textContent = label;

                keyCell.appendChild(copyButton);
                keyCell.appendChild(labelSpan);

                // 값 셀
                const valueCell = document.createElement('td');

                if (formatter && typeof formatter === 'function') {
                    const formattedValue = formatter(value);
                    if (formattedValue instanceof HTMLElement) {
                        valueCell.appendChild(formattedValue);
                    } else {
                        valueCell.innerHTML = formattedValue;
                    }
                } else {
                    if (Array.isArray(value)) {
                        valueCell.textContent = value.join(', ');
                    } else if (typeof value === 'object' && value !== null) {
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
                }

                // URL 항목의 값 글씨 크기 조정
                if (key === 'alternate_url') {
                    valueCell.style.fontSize = '0.9em';
                }

                row.appendChild(keyCell);
                row.appendChild(valueCell);
                table.appendChild(row);
            }
        });

        detailsContent.appendChild(table);

        // 'Copy All' 버튼 이벤트 연결
        const copyAllTopButton = document.getElementById('copy-all-top');
        const copyAllBottomButton = document.getElementById('copy-all-bottom');
        
        // 기존 이벤트 리스너 제거 (중복 방지)
        copyAllTopButton.replaceWith(copyAllTopButton.cloneNode(true));
        copyAllBottomButton.replaceWith(copyAllBottomButton.cloneNode(true));

        // 새 버튼 요소 가져오기
        const newCopyAllTopButton = document.getElementById('copy-all-top');
        const newCopyAllBottomButton = document.getElementById('copy-all-bottom');

        // 이벤트 리스너 추가
        newCopyAllTopButton.addEventListener('click', () => {
            copyAllData(data);
        });

        newCopyAllBottomButton.addEventListener('click', () => {
            copyAllData(data);
        });

        // 모달 창 표시
        let modal = new bootstrap.Modal(document.getElementById('documentDetailsModal'));
        modal.show();
    })
    .catch(error => {
        console.error('Error fetching document details:', error);
        alert('문서 상세 정보를 가져오는 중 오류가 발생했습니다: ' + error.message);
    });
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

// 검색 이벤트 -분기 처리로 대체
function searchDocuments(queryText) {
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
        let container = document.getElementById('tab1-document-list');
        container.innerHTML = '';

        // 검색 결과 표시
        dataList.forEach(data => {
            createDocumentItem(container, data);
        });

        // 검색 결과에서는 더보기 버튼 숨기기
        let loadMoreButton = document.getElementById('tab1-load-more');
        loadMoreButton.style.display = 'none';

        // 페이지 번호 초기화 (필요 시)
        tab1Page = 0;

        // 라벨 업데이트
        updateLabels();
    })
    .catch(error => {
        console.error('Error during search:', error);
        alert('검색 중 오류가 발생했습니다: ' + error.message);
    });
}

// 앤터 검색
document.addEventListener('DOMContentLoaded', function () {
    const searchBox1 = document.querySelector('.search-group .form-control');
    const searchButton1 = document.getElementById('searchButton1');

    // Enter 키 입력 시 검색 실행
    searchBox1.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // 기본 동작 방지 (엔터로 줄바꿈되는 것을 막음)
            executeSearch(); // 검색 실행 함수 호출
        }
    });

    // 검색 버튼 클릭 시 검색 실행
    searchButton1.addEventListener('click', function () {
        executeSearch(); // 검색 실행 함수 호출
    });

    // 검색 실행 함수
    function executeSearch() {
        const queryText = searchBox1.value.trim();
        if (queryText) {
            const isAiSearch = document.getElementById('searchSwitch1').checked;
            if (isAiSearch) {
                // AI 검색 수행
                aiSearchDocuments(queryText);
            } else {
                // 기존 검색 수행
                searchDocuments(queryText);
            }
            // searchBox1.value = ''; // 검색 후 검색창 비우기
        }
    }
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
                <button class="btn btn-sm btn-outline-primary hub-btn">허브</button>
            </div>
            <div class="keywords">
                <div class="keyword-list">
                    ${keyword_list.map(keyword => `<span class="keyword-badge">${keyword}</span>`).join('')}
                </div>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-primary folder-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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

    container.appendChild(docItem);
}

// AI 검색 이벤트
function aiSearchDocuments(queryText) {
    fetch('http://localhost:8000/ai_search/gpt_search/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query_text: queryText,
            index: 'pages'
        }),
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
        // 문서 목록 영역 초기화
        let container = document.getElementById('tab1-document-list');
        container.innerHTML = '';

        // 검색 결과 표시 (AI 검색 응답)
        const queryResults = data.results;
        queryResults.forEach(data => {
            createDocumentItem(container, data);
        });

        // 검색 결과에서는 더보기 버튼 숨기기
        let loadMoreButton = document.getElementById('tab1-load-more');
        loadMoreButton.style.display = 'none';

        // 페이지 번호 초기화 (필요 시)
        tab1Page = 0;

        // 라벨 업데이트
        updateLabels();
    })
    .catch(error => {
        console.error('Error during AI search:', error);
        alert('AI 검색 중 오류가 발생했습니다: ' + error.message);
    });
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
        });
        tab2Page++; // 다음 페이지를 위해 페이지 번호 증가
    })
    .catch(error => {
        console.error('Error fetching documents:', error);
    });
}

// 상세보기 버튼 이벤트
function showDocumentDetailsModal2(docId, title, url, created_at) {
    fetch(`http://localhost:8000/history/id/${docId}/`, {
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

        // 테이블 생성
        const table = document.createElement('table');
        table.className = 'table table-bordered';

        // 제목 행
        let titleRow = document.createElement('tr');
        let titleKeyCell = document.createElement('th');
        titleKeyCell.textContent = '제목';
        let titleValueCell = document.createElement('td');
        titleValueCell.textContent = title;
        titleRow.appendChild(titleKeyCell);
        titleRow.appendChild(titleValueCell);
        table.appendChild(titleRow);

        // URL 행
        let urlRow = document.createElement('tr');
        let urlKeyCell = document.createElement('th');
        urlKeyCell.textContent = 'URL';
        let urlValueCell = document.createElement('td');
        let link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.textContent = url;
        urlValueCell.appendChild(link);
        urlRow.appendChild(urlKeyCell);
        urlRow.appendChild(urlValueCell);
        table.appendChild(urlRow);

        // 저장일자 행
        let createdAtRow = document.createElement('tr');
        let createdAtKeyCell = document.createElement('th');
        createdAtKeyCell.textContent = '저장일자';
        let createdAtValueCell = document.createElement('td');
        createdAtValueCell.textContent = created_at;
        createdAtRow.appendChild(createdAtKeyCell);
        createdAtRow.appendChild(createdAtValueCell);
        table.appendChild(createdAtRow);

        // 본문 행
        let contentRow = document.createElement('tr');
        let contentKeyCell = document.createElement('th');
        contentKeyCell.textContent = '본문';
        let contentValueCell = document.createElement('td');
        contentValueCell.textContent = data.content || '내용 없음';
        contentRow.appendChild(contentKeyCell);
        contentRow.appendChild(contentValueCell);
        table.appendChild(contentRow);

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

// 더보기 버튼 이벤트
document.getElementById('tab2-load-more').addEventListener('click', function() {
    loadTab2Documents();
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
