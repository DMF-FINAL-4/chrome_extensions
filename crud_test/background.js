// Elasticsearch 서버의 URL 설정
const ELASTICSEARCH_URL = 'http://<PC1_IP>:9200/your-index-name/_doc/';
// 여기서 <PC1_IP>는 PC1의 IP 주소입니다. 예: '<http://192.168.1.100:9200/your-index-name/_doc/>'

// 필요한 경우 인덱스 생성 (생략 가능)
// 인덱스를 미리 생성하지 않아도, Elasticsearch는 문서가 저장될 때 자동으로 인덱스를 생성합니다.

// 메시지 수신 대기
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // API 키가 필요하지 않으므로, 인증 없이 진행
  // Elasticsearch 기본 설정에서는 보안 기능이 비활성화되어 있음

  if (request.action === 'create') {
    // 문서 생성
    fetch(ELASTICSEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.data)
    })
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.toString() }));

    // 비동기 응답을 위해 true 반환
    return true;
  }

  if (request.action === 'read') {
    // 문서 조회
    fetch(ELASTICSEARCH_URL + request.id, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.toString() }));

    return true;
  }

  if (request.action === 'update') {
    // 문서 업데이트
    fetch(ELASTICSEARCH_URL + request.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.data)
    })
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.toString() }));

    return true;
  }

  if (request.action === 'delete') {
    // 문서 삭제
    fetch(ELASTICSEARCH_URL + request.id, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.toString() }));

    return true;
  }
});
