// background.js

// chrome.webRequest.onBeforeRequest.addListener(
    // function(tab) {
    //     console.log("asdfsdfsd");
    // }
  // function (details) {
  //   // if (!severalConditionsToCheckIfIWantToDoTheMagic) {
  //   //     return;
  //   // }
  //
  //   console.log("sadfsaf");
  //   }

  //   $.ajax(url, {
  //       async:false,
  //       complete:function () {
  //         return {redirectUrl:details.url};
  //       }
  //   });
  // },
  // {urls:["<all_urls>"]},
  // ["blocking"]
// );

// chrome.webRequest.onBeforeRequest.addListener(details => {
//     console.log("Redirecting request: ", details.url);   // Logs the request
//     return {redirectUrl: "/feed/subscriptions"};         // Doesn't redirect request
// }, {
//     "urls": [
//         "https://www.youtube.com/"
//     ],
//     types: [
//         "main_frame"
//     ]
// }, [
//     "blocking"
// ]);

function doStuffWithDom(domContent) {
    if(domContent) {
        alert(domContent);
    }
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.sendMessage(activeInfo.tabId, {"message": "report_back"}, doStuffWithDom);
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    // chrome.tabs.sendMessage(activeTab.id, {"message": "tabs_browser_switched"});
  });
});
