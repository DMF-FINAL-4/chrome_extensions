// 이 크롬 확장 프로그램은 사이드 패널에서 '현재 페이지 저장'과 '모든 탭 저장' 기능을 제공합니다.
// 버튼을 클릭할 때 Django 백엔드로 데이터를 POST 요청하며, 상태에 따라 UI가 변경됩니다.
// 추가적인 기능 구현 및 구조 개선을 위해 각 함수와 기능에 대한 보완 작업이 필요합니다.

(async () => {
    // const sidePanelHTML = `
    //   <div id="extension-panel">
    //     <button id="save-current-page">현재 페이지 저장</button>
    //     <button id="save-all-tabs">열려있는 모든 탭 저장</button>
    //     <div id="status">상태 표시 영역</div>
    //     <div id="search-container">
    //       <input type="text" id="search-query" placeholder="검색어를 입력하세요" />
    //       <select id="search-type">
    //         <option value="text">텍스트 검색</option>
    //         <option value="gpt">GPT 검색</option>
    //       </select>
    //       <select id="search-source">
    //         <option value="pages">Pages 검색</option>
    //         <option value="history">History 검색</option>
    //       </select>
    //       <button id="search-button">검색</button>
    //     </div>
    //     <div id="results-container"></div>
    //   </div>
    // `;
  
    // // 사이드 패널 HTML 추가
    // document.body.insertAdjacentHTML('afterbegin', sidePanelHTML);
  
    // 요소 참조 및 이벤트 핸들러 등록
    const statusElement = document.getElementById('status');
    const saveCurrentPageButton = document.getElementById('save-current-page');
    const saveAllTabsButton = document.getElementById('save-all-tabs');
    const searchButton = document.getElementById('search-button');
  
    // 현재 페이지 저장
    saveCurrentPageButton.addEventListener('click', async () => {
      try {
        statusElement.innerText = '진행중';
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await savePage(tab.url, tab.title);
        handleSaveResponse(response);
      } catch (error) {
        console.error('현재 페이지 저장 오류: ', error);
        statusElement.innerText = '저장 실패';
      }
    });
  
    // 모든 탭 저장
    saveAllTabsButton.addEventListener('click', async () => {
      try {
        statusElement.innerText = '진행중';
        const tabs = await chrome.tabs.query({ currentWindow: true });
        for (const tab of tabs) {
          const response = await savePage(tab.url, tab.title);
          handleSaveResponse(response);
        }
      } catch (error) {
        console.error('모든 탭 저장 오류: ', error);
        statusElement.innerText = '저장 실패';
      }
    });
  
    // 페이지 저장을 위한 fetch 함수
    async function savePage(url, title) {
      try {
        const response = await fetch('http://localhost:8000/api/pages/new_save/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url, html: document.documentElement.outerHTML })
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
        handleDuplicate(response.duplicates);
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
    searchButton.addEventListener('click', async () => {
      const query = document.getElementById('search-query').value;
      const searchType = document.getElementById('search-type').value;
      const searchSource = document.getElementById('search-source').value;
      const endpoint = searchType === 'text' ? 'text_search' : 'gpt_search';
      const source = searchSource === 'pages' ? 'pages' : 'history';
  
      try {
        statusElement.innerText = '검색 중...';
        const response = await fetch(`http://localhost:8000/api/${source}/${endpoint}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query_text: query })
        });
        const results = await response.json();
        displayResults(results);
        statusElement.innerText = '';
      } catch (error) {
        console.error('검색 실패: ', error);
        statusElement.innerText = '검색 실패';
      }
    });
  
    // 검색 결과 표시 함수
    function displayResults(results) {
      const resultsContainer = document.getElementById('results-container');
      resultsContainer.innerHTML = '';
      results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.innerText = result.source.title;
        resultElement.classList.add('result-item');
        resultElement.addEventListener('click', () => {
          window.open(result.source.alternate_url, '_blank');
        });
        resultsContainer.appendChild(resultElement);
      });
    }
  })();
  