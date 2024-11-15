document.addEventListener('DOMContentLoaded', () => {  // 문서가 완전히 로드되었을 때 실행.
  const saveCurrentPageButton = document.getElementById('save-current-page');
  const saveAllTabsButton = document.getElementById('save-all-tabs');
  const searchButton = document.getElementById('search-button');
  const expandViewButton = document.getElementById('expand-view');
  const statusElement = document.getElementById('status');

  // 현재 페이지 저장
  if (saveCurrentPageButton) {
    saveCurrentPageButton.addEventListener('click', async () => {
      try {
        statusElement.innerText = '진행중';
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });  // 현재 활성 탭 가져오기.
        const response = await savePage(tab.url);  // 현재 페이지 저장 요청.
        handleSaveResponse(response);
      } catch (error) {
        console.error('현재 페이지 저장 오류: ', error);
        statusElement.innerText = '저장 실패';
      }
    });
  }

  // 모든 탭 저장
  if (saveAllTabsButton) {
    saveAllTabsButton.addEventListener('click', async () => {
      try {
        statusElement.innerText = '진행중';
        const tabs = await chrome.tabs.query({ currentWindow: true });  // 현재 창에 있는 모든 탭 가져오기.
        for (const tab of tabs) {
          const response = await savePage(tab.url);  // 각 탭의 URL을 저장.
          handleSaveResponse(response);
        }
      } catch (error) {
        console.error('모든 탭 저장 오류: ', error);
        statusElement.innerText = '저장 실패';
      }
    });
  }

  // 페이지 저장 요청
  async function savePage(url) {
    try {
      const response = await fetch('http://localhost:8000/api/pages/new_save/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, html: document.documentElement.outerHTML })  // Django 프로젝트에서 기대하는 형식으로 요청 본문 구성.
      });
      return await response.json();
    } catch (error) {
      console.error('페이지 저장 요청 오류: ', error);
      throw error;
    }
  }

  // 저장 응답 처리 함수
  function handleSaveResponse(response) {
    if (response.error === 'Duplicate content found') {
      handleDuplicate(response.duplicates);  // 중복 문서 처리.
    } else {
      statusElement.innerText = '저장 완료';
      setTimeout(() => {
        statusElement.innerText = '';
      }, 1000);
    }
  }

  // 중복 문서 처리 함수
  function handleDuplicate(duplicates) {
    const duplicateInfo = `중복된 문서가 발견되었습니다: ${duplicates.map(d => d.title).join(', ')}`;
    const confirmation = confirm(`${duplicateInfo}\n덮어쓰기 하시겠습니까?`);
    if (confirmation) {
      overwritePage(duplicates[0].id);
    } else {
      statusElement.innerText = '저장 취소';
    }
  }

  // 덮어쓰기 요청 함수
  async function overwritePage(docId) {
    try {
      statusElement.innerText = '덮어쓰기 진행 중';
      const response = await fetch(`http://localhost:8000/api/pages/overwrite/${docId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        statusElement.innerText = '덮어쓰기 완료';
        setTimeout(() => {
          statusElement.innerText = '';
        }, 1000);
      } else {
        throw new Error('덮어쓰기 실패');
      }
    } catch (error) {
      console.error('덮어쓰기 오류: ', error);
      statusElement.innerText = '덮어쓰기 실패';
    }
  }

  // 검색 기능
  if (searchButton) {
    searchButton.addEventListener('click', async () => {
      const query = document.getElementById('search-query').value;
      const searchType = document.getElementById('search-type').value;
      const searchSource = document.getElementById('search-source').value;
      const endpoint = searchType === 'text' ? 'text_search' : 'gpt_search';
      const source = searchSource === 'pages' ? 'pages' : 'history';

      try {
        statusElement.innerText = '검색 중...';
        const response = await fetch(`http://localhost:8000/${source}/${endpoint}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query_text: query })  // Django API에 맞게 검색 요청 본문 구성.
        });
        const results = await response.json();
        displayResults(results);
        statusElement.innerText = '';
      } catch (error) {
        console.error('검색 실패: ', error);
        statusElement.innerText = '검색 실패';
      }
    });
  }

  // 검색 결과 표시 함수
  function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
      results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.innerText = result.source.title;  // 검색 결과의 제목 표시.
        resultElement.classList.add('result-item');
        resultElement.addEventListener('click', () => {
          window.open(result.source.alternate_url, '_blank');  // 클릭 시 새 탭에서 열기.
        });
        resultsContainer.appendChild(resultElement);
      });
    }
  }

  // 크게 보기 버튼 클릭 시
  if (expandViewButton) {
    expandViewButton.addEventListener('click', () => {
      window.open('sidepanels/fullPage.html', '_blank');  // 새 탭에서 전체 페이지 열기.
    });
  }
});