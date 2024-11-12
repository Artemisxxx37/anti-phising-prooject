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
    return null;
  }
}

async function checkIpReputation(ip) {
  try {
    const url = `http://localhost:3000/proxy?url=https://www.virustotal.com/api/v3/ip_addresses/${ip}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.data.attributes.last_analysis_stats.malicious > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking IP reputation:", error);
    return null;
  }
}

async function analyzePage(tab) {
  try {
    const currentUrl = new URL(tab.url).hostname;
    console.log(`Current URL: ${currentUrl}`);

    const ipAddress = await getIpAddress(currentUrl);
    if (!ipAddress) {
      chrome.tabs.sendMessage(tab.id, { action: "alertUser", message: "Failed to fetch IP address. Suggest blocking request and leaving website." });
      return;
    }

    const isMalicious = await checkIpReputation(ipAddress);
    if (isMalicious === null) {
      chrome.tabs.sendMessage(tab.id, { action: "alertUser", message: "Failed to check IP reputation. Suggest blocking request and leaving website." });
      return;
    }

    if (phishingUrls.includes(currentUrl) || isMalicious) {
      chrome.tabs.sendMessage(tab.id, { action: "alertUser", message: "This site might be a phishing site. Be cautious!" });
    } else {
      chrome.tabs.sendMessage(tab.id, { action: "alertUser", message: "This site is safe." });
    }
  } catch (error) {
    console.error("Error analyzing page:", error);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
    analyzePage(tab);
  }
});
