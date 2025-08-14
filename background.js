chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CATATAN_STORAGE') {

    if (request.action === 'GET') {
      chrome.storage.local.get([request.key], (result) => {
        sendResponse({ value: result[request.key] });
      });
    }

    else if (request.action === 'SET') {
      let dataToSet = {};
      dataToSet[request.key] = request.value;
      chrome.storage.local.set(dataToSet, () => {
        sendResponse({ success: true });
      });
    }
    return true;
  }
});
