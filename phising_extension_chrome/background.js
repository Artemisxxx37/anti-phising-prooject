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
    const apiKey = '1be91a59b6ca271f733393f2bacb7ffa73309a363305a74ee9d9fffd46cb3eb1'; // Replace with your VirusTotal API key
    const response = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: { 'x-apikey': apiKey }
    });
    const data = await response.json();
    return data.data.attributes.reputation;
  } catch (error) {
    console.error("Error checking IP reputation:", error);
  }
}

async function analyzePage(tab) {
  try {
    const currentUrl = new URL(tab.url).hostname;
    console.log(`Current URL: ${currentUrl}`);

    const ipAddress = await getIpAddress(currentUrl);
    console.log(`IP Address: ${ipAddress}`);

    if (phishingUrls.includes(currentUrl) || (ipAddress && await checkIpReputation(ipAddress) < 50)) {
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
