var clientId = "3p02mzgz7bd8semst5y4s88u49ihr3";
var pendingAction;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      if(document.getElementById('twitcheeExtension') == null) {
        createWindow();

        setTimeout(function() {

          loadChannelsPage();
          // var twitchPlayer = document.getElementById("twitchPlayer");
          // twitchPlayer.src = "https://player.twitch.tv/?channel=dreamhackcs&muted=true"
        }, 15);
      } else {
        document.getElementById('twitcheeExtension').outerHTML = '';
      }
  } else if (request.message === "report_back") {
    sendResponse(document.getElementById('twitcheeExtension').outerHTML);
    // sendResponse("hello");
  } else if ( request.message === "tabs_browser_switched") {
      console.log("asdfsadfasdf");
    }
  }
);

function createWindow() {
    var header = document.createElement('div');
    header.id = 'twitcheeHeader';

    var contentWindow = document.createElement('div');
    contentWindow.id = 'twitcheeContentWindow';

    var loader = document.createElement('div');
    loader.id = 'twitcheeLoader';

    var twitchExtension = document.getElementById('twitcheeExtension');
    twitchExtension = document.createElement('div');

    twitchExtension.id = 'twitcheeExtension';
    twitchExtension.className = 'twitcheeDragEnabled';

    twitchExtension.appendChild(header);
    twitchExtension.appendChild(contentWindow);
    twitchExtension.appendChild(loader);

    $(twitchExtension).appendTo('body');

    $(function() {
        $('.twitcheeDragEnabled').draggable();
    });
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i]["_id"] === obj["_id"]) {
            // console.log("a", a);
            // console.log("obj", obj);
            return true;
        }
    }
    return false;
}

function remove(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i]["_id"] === obj["_id"]) {
            // console.log("ra", a);
            // console.log("robj", obj);
            a.splice(i, 1);
            return;
        }
    }
    return;
}

function rgbaTrans(r, g, b, a) {
  return 'rgba(' + [r, g, b, a].join(',') + ')';
}

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

function loadChannelsPage() {
  var header = document.getElementById('twitcheeHeader');
  var contentWindow = document.getElementById('twitcheeContentWindow');

  var searchHeader = document.createElement('div');
  searchHeader.id="twitcheeSearchHeader";

  var searchBar = document.createElement('input');
  searchBar.setAttribute("type", "search");
  searchBar.setAttribute("autocomplete", "on");
  searchBar.id="twitcheeSearchBar";

  /*
  code for executing on autocomplete search
  */

  searchBar.addEventListener('input', function() {
    var url = "https://api.twitch.tv/kraken/search/channels?limit=5&query=" + searchBar.value + "&client_id=" + clientId;

    if(pendingAction != null) {
      clearTimeout(pendingAction);
    }

    pendingAction = setTimeout(function() {
      getJSON(url, function(err, data) {
        // console.log(data["channels"].map(function(chan) {return chan["name"]}));
         $("#twitcheeSearchBar").autocomplete({
          source: data["channels"].map(function(chan) {return chan["name"]})
        });

        $("#twitcheeSearchBar").attr("autocomplete", "on");
      });
    }, 400);
  });

  var favoriteButton = document.createElement('div');
  favoriteButton.style.backgroundImage = 'url(' + chrome.extension.getURL('heart.png') + ')';
  favoriteButton.id = 'twitcheeFavoriteButtonHome';
  favoriteButton.className = 'twitcheeNaviButton';
  chrome.storage.local.get({favoriteChannels: []}, function(result) {
      var favoriteChannels = result.favoriteChannels;
      favoriteButton.channels = favoriteChannels;
  });
  favoriteButton.segueFrom = 'homePage';
  favoriteButton.addEventListener("click", loadChannels, false);

  var exitButton = document.createElement('div');
  exitButton.style.backgroundImage = 'url(' + chrome.extension.getURL('cancel.png') + ')';
  exitButton.id = 'twitcheeExitButton';
  exitButton.addEventListener("click", function() {
      document.getElementById('twitcheeExtension').outerHTML = '';
  }, false);

  searchHeader.appendChild(favoriteButton);
  searchHeader.appendChild(exitButton);
  searchHeader.appendChild(searchBar);

  var games = loadGames();

  header.innerHTML = "";
  contentWindow.innerHTML = "";
  header.appendChild(searchHeader);

  console.log("zxcvzxv");

  contentWindow.appendChild(games);
}

function loadGames() {
  var games = document.createElement('div');

  var url = "https://api.twitch.tv/kraken/games/top?limit=9&client_id=" + clientId;

  getJSON(url, function(err, data) {
    for(var i = 0; i < data["top"].length; i++) {
      var game = document.createElement('div');
      game.className = 'twitcheeGame';
      if(i > 6) {
        game.style.marginBottom = '33px';
      }
      game.style.backgroundImage = "url(" + data["top"][i]["game"]["box"]["medium"] + ")";
      game.data = data;
      game.index = i;
      game.addEventListener("click", loadChannels, false);

      games.appendChild(game);
    }

    var loader = document.getElementById('twitcheeLoader');

    if(loader != null) {
      loader.outerHTML = "";
    }
  })

  return games;
}

function returnChannelsPage(evt) {
  var twitchExtension = document.getElementById('twitcheeExtension');
  var loader = document.createElement('div');
  loader.id = 'twitcheeLoader';

  // backButton.removeEventListener("click", loadChannelsPage, false);
  // backButton.removeEventListener("click", returnChannelsPage, false);

  twitchExtension.appendChild(loader);
  loadChannelsPage();
}

function loadChannels(evt) {
  document.getElementById('twitcheeFavoriteButtonHome').style.left = '50px';

  var twitchExtension = document.getElementById('twitcheeExtension');
  var searchHeader = document.getElementById('twitcheeSearchHeader');
  document.getElementById('twitcheeFavoriteButtonHome').data = evt.target.data;
  document.getElementById('twitcheeFavoriteButtonHome').index = evt.target.index;

  if(evt.target.segueFrom == 'stream') {
      twitchExtension.innerHTML = "";
      createWindow();
      loadChannelsPage();
      searchHeader = document.getElementById('twitcheeSearchHeader');
  }

  var loader = document.createElement('div');
  loader.id = 'twitcheeLoader';

  twitchExtension.appendChild(loader);

  if(!document.getElementById('twitcheeBackButton')) {
      var backButton = document.createElement('div');
      backButton.style.backgroundImage = 'url(' + chrome.extension.getURL('back.png') + ')';
      backButton.id = 'twitcheeBackButton';
      backButton.className = 'twitcheeNaviButton';

    //   backButton.loader = loader;
        console.log("1");
      backButton.addEventListener("click", returnChannelsPage, false);
      console.log("asdfasdf");
      searchHeader.appendChild(backButton);
  }

  if(document.getElementById('twitcheeFavoriteButtonHome').style.visibility == 'collapse') {
    document.getElementById('twitcheeFavoriteButtonHome').style.visibility = 'visible';
    var backButton = document.getElementById('twitcheeBackButton');
    backButton.removeEventListener("click", loadChannels, false);

    backButton.addEventListener("click", returnChannelsPage, false);
  }

  if(evt.target.channels == null) {
    document.getElementById('twitcheeFavoriteButtonHome').segueFrom = 'channelsPage';

    var gameName = evt.target.data["top"][evt.target.index]["game"]["name"];
    var url = "https://api.twitch.tv/kraken/streams?limit=20&game=" + gameName + "&client_id=" + clientId;

    getJSON(url, function(err, data) {
      var contentWindow = document.getElementById("twitcheeContentWindow");
      contentWindow.innerHTML = "";

      var bgc = [255, 255, 255];

      for(var i = 0; i < data["streams"].length; i++) {
        var channel = document.createElement('div');
        var channelData = data["streams"][i];
        channel.className = 'twitcheeChannel';
        channel.textContent = channelData["viewers"] + " viewers / " + channelData["channel"]["display_name"] + " / " + channelData["channel"]["status"];
        channel.channelName = channelData["channel"]["display_name"];
        channel.channelData = channelData;
        channel.addEventListener("click", openStream, false);
        contentWindow.appendChild(channel);
      }

      loader.outerHTML = "";
    });
} else {
    var contentWindow = document.getElementById("twitcheeContentWindow");
    contentWindow.innerHTML = "";

    var bgc = [255, 255, 255];

    for(var i = 0; i < evt.target.channels.length; i++) {
      var channel = document.createElement('div');
      var channelData =  evt.target.channels[i];
      channel.className = 'twitcheeChannel';
      channel.textContent = channelData["viewers"] + " viewers / " + channelData["channel"]["display_name"] + " / " + channelData["channel"]["status"];
      channel.channelName = channelData["channel"]["display_name"];
      channel.channelData = channelData;
      channelData.segueFrom = "frontPage";
      channel.addEventListener("click", openStream, false);

      contentWindow.appendChild(channel);
    }

    if(evt.target.segueFrom == 'channelsPage') {
        console.log("asdfasdf");
        var backButton = document.getElementById('twitcheeBackButton');
        backButton.removeEventListener("click", returnChannelsPage, false);
        // returnChannelsPage();
        console.log(evt.target.data);
        // var newBack = backButton.cloneNode(true);
        // backButton.parentNode.replaceChild(newBack, backButton);
        // // backButton.removeEventListener();
        backButton.index = evt.target.index;
        backButton.data = evt.target.data;
        // console.log(backButton);
        backButton.addEventListener("click", loadChannels, false);
        //
        // backButton.addEventListener("click", function() {
        //     twitchExtension.appendChild(loader);
        //     loadChannelsPage();
        // }, false);
    }
    document.getElementById('twitcheeFavoriteButtonHome').style.visibility = 'collapse';
    loader.outerHTML = "";
  }
}

function openStream(evt) {

  var twitchExtension = document.getElementById('twitcheeExtension');
  var twitchStream = document.createElement('div');
  var streamOverlay = document.createElement('div');
  var backButton = document.createElement('div');
  var homeButton = document.createElement('div');
  var favoriteButton = document.createElement('div');
  var exitButton = document.createElement('div');
  var loader = document.createElement('div');

  loader.id = 'twitcheeLoader';
  loader.style.top = '50%';

  twitchExtension.appendChild(loader);

  twitchStream.id = 'twitcheeStream';
  twitchStream.style.position = 'absolute';
  twitchStream.style.top = 0;

  homeButton.style.backgroundImage = 'url(' + chrome.extension.getURL('home.png') + ')';
  homeButton.id = 'twitcheeHomeButtonStream';
  homeButton.className = 'twitcheeNaviButton';
  homeButton.style.left = '50px';
  homeButton.addEventListener("click", function() {
      // twitchExtension.innerHTML = "";
      twitchStream.outerHTML = "";
      document.getElementById('twitcheeHeader').innerHTML = "";
      // createWindow();

      setTimeout(function() {

        loadChannelsPage();
        // var twitchPlayer = document.getElementById("twitchPlayer");
        // twitchPlayer.src = "https://player.twitch.tv/?channel=dreamhackcs&muted=true"
      }, 15);
  }, false);

  favoriteButton.style.backgroundImage = 'url(' + chrome.extension.getURL('heart.png') + ')';
  favoriteButton.id = 'twitcheeFavoriteButton';
  favoriteButton.style.left = '100px';
  favoriteButton.className = 'twitcheeNaviButton';
  favoriteButton.channelData = evt.target.channelData;
  favoriteButton.addEventListener("click", addFavorite, false);

  chrome.storage.local.get({favoriteChannels: []}, function(result) {
      var favoriteChannels = result.favoriteChannels;

      console.log(favoriteChannels);

      if(!contains(favoriteChannels, evt.target.channelData)) {
          favoriteButton.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
      } else {
          favoriteButton.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
      }
  });

  backButton.style.backgroundImage = 'url(' + chrome.extension.getURL('back.png') + ')';
  backButton.id = 'twitcheeBackButton';
  backButton.className = 'twitcheeNaviButton';
  backButton.addEventListener("click", function() {
      twitchStream.outerHTML = "";
  }, false);

  exitButton.style.backgroundImage = 'url(' + chrome.extension.getURL('cancel.png') + ')';
  exitButton.id = 'twitcheeExitButton';
  exitButton.addEventListener("click", function() {
      document.getElementById('twitcheeExtension').outerHTML = '';
  }, false);

  streamOverlay.id = 'twitcheeStreamOverlay';
  streamOverlay.appendChild(backButton);
  streamOverlay.appendChild(homeButton);
  streamOverlay.appendChild(favoriteButton);
  streamOverlay.appendChild(exitButton);

  twitchStream.innerHTML = '<iframe id="twitcheePlayer" src="https://player.twitch.tv/?channel=' + evt.target.channelName +'&muted=true" height="320" width="540" frameborder="0" scrolling="no" allowfullscreen webkitallowfullscreen mozallowfullscreen> </iframe>'
  twitchStream.className = 'twitcheeDragEnabled';
  twitchStream.appendChild(streamOverlay);
  twitchExtension.appendChild(twitchStream);

  $(function() {
      $('.twitchDragEnabled').draggable();
  });

  $(function() {
      $('.player-overlay player-fullscreen-overlay js-control-fullscreen-overlay').draggable();
  });

  document.getElementById('twitcheePlayer').onload = function() {
      loader.outerHTML = "";
    //   alert(document.getElementById('twitchPlayer').readyState);
  }
}

function addFavorite(evt) {
    // console.log(evt.target.channelData);
    chrome.storage.local.get({favoriteChannels: []}, function(result) {
        var favoriteChannels = result.favoriteChannels;
        var favoriteButton = document.getElementById('twitcheeFavoriteButton');

        console.log(favoriteChannels);

        if(!contains(favoriteChannels, evt.target.channelData)) {
            favoriteChannels.push(evt.target.channelData);

            chrome.storage.local.set({favoriteChannels: favoriteChannels}, function(result) {
            });
            favoriteButton.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        } else {
            favoriteButton.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
            remove(favoriteChannels, evt.target.channelData);

            chrome.storage.local.set({favoriteChannels: favoriteChannels}, function(result) {
                //when deleted unighlight heart
            });
        }

        // console.log("channelData", evt.target.channelData);
        // console.log("favoriteChannels", favoriteChannels);
    });
}
