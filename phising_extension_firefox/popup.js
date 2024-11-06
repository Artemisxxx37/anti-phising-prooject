function blockSite() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentUrl = tabs[0].url;
      chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
          return { cancel: true };
        },
        { urls: [currentUrl] },
        ["blocking"]
      );
      alert("The site has been blocked.");
    });
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    const blockButton = document.getElementById('blockButton');
    if (blockButton) {
      blockButton.addEventListener('click', blockSite);
    }
  
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "showBlockButton") {
        blockButton.style.display = 'block';
      }
    });
  });
  