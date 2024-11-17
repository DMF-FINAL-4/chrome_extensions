// side_panel/side_panel.js

// document.getElementById('close-button').addEventListener('click', () => {
// // 사이드 패널을 닫기 위해 백그라운드로 메시지 보내기
// chrome.runtime.sendMessage({ type: 'CLOSE_SIDEPANEL' });
// });


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
        // 초기 높이 조절 - 이부분을 주석처리 하니까 로드당시 검색상자가 4줄로 되어있는 문제가 해결되었다.
        // autoResizeTextarea(textarea);
        // 입력 이벤트 리스너 등록
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
            
        });
    });
    // 검색 버튼 클릭 이벤트 리스너 추가
    const searchButton1 = document.getElementById('searchButton1');
    searchButton1.addEventListener('click', function() {
        const queryText = document.querySelector('#tab1-content .search-group textarea').value.trim();
        if (queryText) {
            searchDocuments(queryText);
        } else {
            alert('검색어를 입력하세요.');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // 기존 초기화 코드...


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
                    
                    // content.js가 로드된 후 현재 탭에 메시지를 보내 정보를 요청
                    chrome.tabs.sendMessage(activeTab.id, { action: 'getPageInfo' }, function(response) {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError);
                            alert('현재 페이지에서 정보를 가져올 수 없습니다.');
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
            let favicon_link = data.favicon || 'default-icon.ico';
            let keyword_list = data.keywords || [];
            let host_domain = data.host_domain || '';
            let short_summary = data.short_summary || '';
            let author = data.author || '';
            // 기존 코드에서 날짜 처리 부분 수정
            let document_create_time = data.date;
            if (document_create_time === '0001-01-01') {
                document_create_time = '';
            } else {
                document_create_time = document_create_time || '';
            }
            let data_id = data.id || '';
            let created_at = data.created_at || '';

            // 파비콘 이미지 요소 생성 시 이벤트 리스너 추가
            // let faviconImg = document.createElement('img');
            // faviconImg.src = favicon_link;
            // faviconImg.alt = '파비콘';

            // 이미지 로드 실패 시 대체 이미지로 변경
            // faviconImg.onerror = function() {
            //     this.src = 'default-icon.png';
            // };

            docItem.innerHTML = `
                <div class="document-title">
                    <input type="checkbox" class="form-check-input me-2">
                    <img src="${favicon_link}" alt="파비콘" class="favicon-img">
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

            // favicon 이미지 오류 처리
            const faviconImg = docItem.querySelector('.favicon-img');
            faviconImg.addEventListener('error', function() {
                this.src = 'default-icon.ico';
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

// 상세보기 버튼 이벤트
// function showDocumentDetailsModal(docId) {
//     fetch(`http://localhost:8000/pages/id/${docId}/`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//     .then(response => {
//         if (!response.ok) {
//             return response.json().then(errData => {
//                 throw new Error(errData.error || 'Unknown error');
//             });
//         }
//         return response.json();
//     })
//     .then(data => {
//         // 모달 창에 데이터 표시
//         const detailsContent = document.getElementById('document-details-content');
//         detailsContent.innerHTML = ''; // 기존 내용 초기화

//         // 데이터 객체의 키와 값을 순회하여 테이블로 표시
//         const table = document.createElement('table');
//         table.className = 'table table-bordered';

//         for (const key in data) {
//             if (data.hasOwnProperty(key)) {
//                 const value = data[key];
//                 const row = document.createElement('tr');

//                 const keyCell = document.createElement('th');
//                 keyCell.textContent = key;
//                 keyCell.style.width = '30%';
//                 keyCell.style.wordBreak = 'break-all';

//                 const valueCell = document.createElement('td');
//                 valueCell.style.wordBreak = 'break-all';
//                 if (typeof value === 'object' && value !== null) {
//                     valueCell.textContent = JSON.stringify(value, null, 2);
//                 } else if (typeof value === 'string' && isValidURL(value)) {
//                     const link = document.createElement('a');
//                     link.href = value;
//                     link.target = '_blank';
//                     link.textContent = value;
//                     valueCell.appendChild(link);
//                 } else {
//                     valueCell.textContent = value;
//                 }

//                 row.appendChild(keyCell);
//                 row.appendChild(valueCell);
//                 table.appendChild(row);
//             }
//         }

//         detailsContent.appendChild(table);

//         // 모달 창 표시
//         let modal = new bootstrap.Modal(document.getElementById('documentDetailsModal'));
//         modal.show();
//     })
//     .catch(error => {
//         console.error('Error fetching document details:', error);
//         alert('문서 상세 정보를 가져오는 중 오류가 발생했습니다: ' + error.message);
//     });
// }


// 유효한 URL인지 확인하는 함수 (이미 정의되어 있다면 생략 가능)
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
    // {
    //     key: "access_permission",
    //     label: "접근 권한"
    // },
    // {
    //     key: "favicon",
    //     label: "파비콘",
    //     formatter: value => {
    //         const img = document.createElement('img');
    //         img.src = value;
    //         img.alt = "Favicon";
    //         img.style.width = '32px';
    //         img.style.height = '32px';
    //         return img;
    //     }
    // },
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

// // 상세보기 버튼 이벤트 2
// function showDocumentDetailsModal(docId) {
//     fetch(`http://localhost:8000/pages/id/${docId}/`, { // 템플릿 리터럴 수정
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//     .then(response => {
//         if (!response.ok) {
//             return response.json().then(errData => {
//                 throw new Error(errData.error || 'Unknown error');
//             });
//         }
//         return response.json();
//     })
//     .then(data => {
//         // 모달 창에 데이터 표시
//         const detailsContent = document.getElementById('document-details-content');
//         detailsContent.innerHTML = ''; // 기존 내용 초기화

//         // 테이블 생성
//         const table = document.createElement('table');
//         table.className = 'table table-bordered';

//         keySettings.forEach(setting => {
//             const { key, label, formatter } = setting;
//             if (data.hasOwnProperty(key)) {
//                 const value = data[key];
//                 const row = document.createElement('tr');

//                 const keyCell = document.createElement('th');
//                 keyCell.textContent = label;
//                 keyCell.style.width = '30%';
//                 keyCell.style.wordBreak = 'break-all';

//                 const valueCell = document.createElement('td');
//                 valueCell.style.wordBreak = 'break-all';

//                 if (formatter && typeof formatter === 'function') {
//                     const formattedValue = formatter(value);
//                     if (formattedValue instanceof HTMLElement) {
//                         valueCell.appendChild(formattedValue);
//                     } else {
//                         valueCell.innerHTML = formattedValue;
//                     }
//                 } else {
//                     // 기본 값 처리
//                     if (Array.isArray(value)) {
//                         valueCell.textContent = value.join(', ');
//                     } else if (typeof value === 'object' && value !== null) {
//                         valueCell.textContent = JSON.stringify(value, null, 2);
//                     } else if (typeof value === 'string' && isValidURL(value)) {
//                         const link = document.createElement('a');
//                         link.href = value;
//                         link.target = '_blank';
//                         link.textContent = value;
//                         valueCell.appendChild(link);
//                     } else {
//                         valueCell.textContent = value;
//                     }
//                 }

//                 row.appendChild(keyCell);
//                 row.appendChild(valueCell);
//                 table.appendChild(row);
//             }
//         });

//         detailsContent.appendChild(table);

//         // 모달 창 표시
//         let modal = new bootstrap.Modal(document.getElementById('documentDetailsModal'));
//         modal.show();
//     })
//     .catch(error => {
//         console.error('Error fetching document details:', error);
//         alert('문서 상세 정보를 가져오는 중 오류가 발생했습니다: ' + error.message);
//     });
// }

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
                // 배열인 경우, JSON 문자열로 변환
                value = JSON.stringify(value, null, 2);
            } else if (typeof value === 'object' && value !== null) {
                // 객체인 경우, JSON 문자열로 변환
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

// 상세보기 버튼 이벤트 3
function showDocumentDetailsModal(docId) {
    fetch(`http://localhost:8000/pages/id/${docId}/`, { // 템플릿 리터럴 수정
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

        keySettings.forEach(setting => {
            const { key, label, formatter } = setting;
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                const row = document.createElement('tr');

                // 키 셀 (label + 복사 아이콘)
                const keyCell = document.createElement('th');
                keyCell.style.width = '30%';
                keyCell.style.wordBreak = 'break-all';
                
                const labelSpan = document.createElement('span');
                labelSpan.textContent = label;
                keyCell.appendChild(labelSpan);
                
                const copyButton = document.createElement('button');
                copyButton.className = 'btn btn-sm btn-outline-secondary ms-2';
                copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                copyButton.title = '복사';
                copyButton.style.verticalAlign = 'middle';
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
                keyCell.appendChild(copyButton);

                // 값 셀
                const valueCell = document.createElement('td');
                valueCell.style.wordBreak = 'break-all';

                if (formatter && typeof formatter === 'function') {
                    const formattedValue = formatter(value);
                    if (formattedValue instanceof HTMLElement) {
                        valueCell.appendChild(formattedValue);
                    } else {
                        valueCell.innerHTML = formattedValue;
                    }
                } else {
                    // 기본 값 처리
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




// 검색 이벤트
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

// 검색 결과 목록 표시
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