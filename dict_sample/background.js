chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchWordMeaning") {
      const word = request.word;
  
      // 우리말샘 API 호출 URL
      const apiUrl = `https://opendict.korean.go.kr/api/search?certkey_no=6963&key=8DEB3F1CA24BBDC0703FE4D020A34251&target_type=search&req_type=json&part=word&q=${word}`;
  
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          if (data.channel && data.channel.item && data.channel.item.length > 0) {
            const definition = data.channel.item[0].sense[0].definition;
            sendResponse({ success: true, definition: definition });
          } else {
            sendResponse({ success: false, error: "No definition found" });
          }
        })
        .catch(error => {
          sendResponse({ success: false, error: error.toString() });
        });
  
      // 비동기 응답을 위해 return true로 처리
      return true;
    }
  });
  