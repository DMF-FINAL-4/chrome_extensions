


// popup.js

// DOMContentLoaded 이벤트가 발생하면 실행
document.addEventListener('DOMContentLoaded', () => {
  // 버튼 및 입력 필드에 대한 참조 가져오기
  const createButton = document.getElementById('createButton');
  const documentDataInput = document.getElementById('documentData');
  const responseDisplay = document.getElementById('response');

  // Create 버튼 클릭 이벤트 처리
  createButton.addEventListener('click', () => {
      // 입력된 데이터 가져오기
      const data = documentDataInput.value;

      // JSON 파싱 시도
      let jsonData;
      try {
          jsonData = JSON.parse(data);
      } catch (e) {
          responseDisplay.textContent = '유효한 JSON 데이터를 입력하세요.';
          return;
      }

      // Elasticsearch 서버의 IP 주소 및 인덱스 이름 설정
      const PC1_IP = '192.168.0.145'; // PC1의 내부 IP 주소로 변경하세요
      const INDEX_NAME = 'test_index'; // 사용할 인덱스 이름으로 변경하세요
      const ELASTICSEARCH_URL = `http://${PC1_IP}:9200/${INDEX_NAME}/_doc/`;

      // Elasticsearch에 데이터 전송 (Create)
      fetch(ELASTICSEARCH_URL, {
          method: 'POST', // 데이터 생성 요청
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(jsonData) // 입력된 데이터를 JSON 형식으로 전송
      })
      .then(response => response.json()) // 응답을 JSON으로 파싱
      .then(data => {
          // 성공 시 응답 결과 표시
          responseDisplay.textContent = JSON.stringify(data, null, 2);
      })
      .catch(error => {
          // 오류 시 오류 메시지 표시
          responseDisplay.textContent = '오류 발생: ' + error.toString();
      });
  });
});
