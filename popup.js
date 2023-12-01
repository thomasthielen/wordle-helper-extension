chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    message.innerText = request.source;
  }
});

async function onWindowLoad() {

  var message = document.querySelector('#message');

  async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }
  let tab = await getCurrentTab();
  
  chrome.scripting.executeScript(
  {
    target: {tabId: tab.id, allFrames: true},
    files: ['dictionary.js']
  }, function() {
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting the script: \n' + chrome.runtime.lastError.message;
    }
  });

  chrome.scripting.executeScript(
  {
    target: {tabId: tab.id, allFrames: true},
    files: ['helper.js']
  }, function() {
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting the script: \n' + chrome.runtime.lastError.message;
    }
  });

}

window.onload = onWindowLoad;