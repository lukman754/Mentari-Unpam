document.getElementById("runToken").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "MAIN",
    func: () => {
      if (typeof window.toggleTokenPopup === "function") {
        window.toggleTokenPopup();
      } else {
        window.dispatchEvent(new CustomEvent("mentari-toggle-popup"));
      }
    },
  });
});
