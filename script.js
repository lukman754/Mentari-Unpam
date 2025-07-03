document.getElementById("runToken").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      if (window.runToken) {
        window.runToken();
      } else {
        alert("Ekstensi tidak dapat dijalankan di halaman ini!");
      }
    },
  });
});
