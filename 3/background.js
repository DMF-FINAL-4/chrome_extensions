// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendToElasticsearch') {
    const pageInfo = message.data;

    // Elasticsearch로 데이터 전송
    fetch('http://localhost:9200/page_info/_doc/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pageInfo),
    })
      .then((response) => {
        if (response.ok) {
          console.log('데이터가 Elasticsearch에 성공적으로 전송되었습니다.');
          sendResponse({ success: true });
        } else {
          console.error('Elasticsearch로의 전송 실패:', response.statusText);
          sendResponse({ success: false });
        }
      })
      .catch((error) => {
        console.error('Elasticsearch로의 전송 중 오류 발생:', error);
        sendResponse({ success: false });
      });

    // 비동기 응답을 위해 true 반환
    return true;
  }
});
