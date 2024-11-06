const phishingUrls = [
    "example.com",
    "evilwebsite.com",
    // Add more phishing websites as needed
  ];
  
  async function getIpAddress(hostname) {
    try {
      console.log(`Resolving IP for hostname: ${hostname}`);
      const response = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`);
      const data = await response.json();
      return data.Answer[0].data;
    } catch (error) {
      console.error("Error fetching IP address:", error);
    }
  }
  
  async function checkIpReputation(ip) {
    try {
      const apiKey = 'YOUR_API_KEY'; // Replace with your VirusTotal API key
      const response = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
        headers: { 'x-apikey': apiKey }
      });
      const data = await response.json();
      return data.data.attributes.reputation;
    } catch (error) {
      console.error("Error checking IP reputation:", error);
    }
  }
  
  async function analyzePage() {
    try {
      const currentUrl = window.location.hostname;
      console.log(`Current URL: ${currentUrl}`);
  
      const ipAddress = await getIpAddress(currentUrl);
      console.log(`IP Address: ${ipAddress}`);
  
      if (phishingUrls.includes(currentUrl) || (ipAddress && await checkIpReputation(ipAddress) < 50)) {
        alert("This site might be a phishing site. Be cautious!");
  
        // Show the block button
        chrome.action.setPopup({ popup: "popup.html" });
        chrome.runtime.sendMessage({ action: "showBlockButton" });
      } else {
        alert("This site is safe.");
      }
    } catch (error) {
      console.error("Error analyzing page:", error);
    }
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyzePage") {
      analyzePage();
    }
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
      analyzePage();
    }
  });
  