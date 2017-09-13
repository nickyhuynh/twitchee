var clientId = "3p02mzgz7bd8semst5y4s88u49ihr3";

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      if(document.getElementById('twitchExtension') == null) {
        createWindow();

        setTimeout(function() {

          loadChannelsPage();
          // var twitchPlayer = document.getElementById("twitchPlayer");
          // twitchPlayer.src = "https://player.twitch.tv/?channel=dreamhackcs&muted=true"
        }, 15);
      } else {
        document.getElementById('twitchExtension').outerHTML = '';
      }
    }
  }
);

function createWindow() {
    var header = document.createElement('div');
    header.id = 'header';

    var contentWindow = document.createElement('div');
    contentWindow.id = 'contentWindow';

    var loader = document.createElement('div');
    loader.id = 'loader';

    var twitchExtension = document.getElementById('twitchExtension');
    twitchExtension = document.createElement('div');

    twitchExtension.id = 'twitchExtension';

    twitchExtension.appendChild(header);
    twitchExtension.appendChild(contentWindow);
    twitchExtension.appendChild(loader);

    $(twitchExtension).appendTo('body');
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
  var header = document.getElementById('header');
  var contentWindow = document.getElementById('contentWindow');

  var searchHeader = document.createElement('div');
  searchHeader.id="searchHeader";

  var searchBar = document.createElement('div');
  searchBar.id="searchBar";

  var exitButton = document.createElement('div');
  exitButton.style.backgroundImage = 'url(' + chrome.extension.getURL('cancel.png') + ')';
  exitButton.id = 'exitButton';
  exitButton.style.width = '15px';
  exitButton.style.height = '15px';
  exitButton.style.backgroundSize = '15px 15px';
  exitButton.style.padding = '17.5px';
  exitButton.style.position = 'absolute';
  exitButton.style.backgroundRepeat = 'no-repeat';
  exitButton.style.backgroundPosition = 'center';
  exitButton.style.right = 0;
  exitButton.addEventListener("click", function() {
      document.getElementById('twitchExtension').outerHTML = '';
  }, false);

  searchHeader.appendChild(exitButton);
  searchHeader.appendChild(searchBar);

  var games = loadGames();

  header.innerHTML = "";
  contentWindow.innerHTML = "";
  header.appendChild(searchHeader);
  contentWindow.appendChild(games);
}

function loadGames() {
  var games = document.createElement('div');

  var url = "https://api.twitch.tv/kraken/games/top?limit=9&client_id=" + clientId;

  getJSON(url, function(err, data) {
    for(var i = 0; i < data["top"].length; i++) {
      var game = document.createElement('div');
      game.className = 'game';

      game.style.width = '136px';
      game.style.height = '190px';
      game.style.marginLeft = '33px';
      game.style.marginTop = '33px';
      if(i > 6) {
        game.style.marginBottom = '33px';
      }
      game.style.float = 'left';
      game.style.backgroundImage = "url(" + data["top"][i]["game"]["box"]["medium"] + ")";
      game.data = data;
      game.index = i;
      game.addEventListener("click", loadChannels, false);

      games.appendChild(game);
    }

    var loader = document.getElementById('loader');

    if(loader != null) {
      loader.outerHTML = "";
    }
  })

  return games;
}

function loadChannels(evt) {
  var twitchExtension = document.getElementById('twitchExtension');

  var searchHeader = document.getElementById('searchHeader');

  if(evt.target.segueFrom == 'stream') {
      var twitchExtension = document.getElementById('twitchExtension');
      twitchExtension.innerHTML = "";
      createWindow();
      loadChannelsPage();
      searchHeader = document.getElementById('searchHeader');
  }

  var loader = document.createElement('div');
  loader.id = 'loader';

  twitchExtension.appendChild(loader);

  var backButton = document.createElement('div');
  backButton.style.backgroundImage = 'url(' + chrome.extension.getURL('back.png') + ')';
  backButton.id = 'backButton';
  backButton.style.width = '20px';
  backButton.style.height = '20px';
  backButton.style.backgroundSize = '20px 20px';
  backButton.style.padding = '15px';
  backButton.style.position = 'absolute';
  backButton.style.backgroundRepeat = 'no-repeat';
  backButton.style.backgroundPosition = 'center';
  backButton.style.float = 'left';
  backButton.addEventListener("click", function() {
      twitchExtension.appendChild(loader);
      loadChannelsPage();
  }, false);

  searchHeader.appendChild(backButton);

  if(evt.channels == null) {
    var gameName = evt.target.data["top"][evt.target.index]["game"]["name"];
    var url = "https://api.twitch.tv/kraken/streams?limit=20&game=" + gameName + "&client_id=" + clientId;
    getJSON(url, function(err, data) {
      var contentWindow = document.getElementById("contentWindow");
      contentWindow.innerHTML = "";

      var bgc = [255, 255, 255];

      for(var i = 0; i < data["streams"].length; i++) {
        var channel = document.createElement('div');
        var channelData = data["streams"][i];
        channel.className = 'channel';
        channel.style.backgroundColor = 'rgba(' + [bgc[0],bgc[1],bgc[2],0.4].join(',') + ')';
        channel.style.borderBottom = '1px solid rgba(' + [0, 0, 0, 0.3].join(',') + ')';
        channel.style.height = '30px';
        channel.style.width = '504px';
        channel.textContent = channelData["viewers"] + " viewers / " + channelData["channel"]["display_name"] + " / " + channelData["channel"]["status"];
        channel.style.color = rgbaTrans(0, 0, 0, 0.7);
        channel.style.lineHeight = '30px';
        channel.style.textAlign = 'left';
        channel.style.paddingLeft = '15px';
        channel.style.paddingRight = '15px';
        channel.style.overflow = 'hidden';
        channel.channelName = channelData["channel"]["display_name"];
        channel.addEventListener("click", openStream, false);

        contentWindow.appendChild(channel);
      }

      loader.outerHTML = "";
    });
  } else {
    //means that i need to load some user saved data instead
  }
}

function openStream(evt) {
  var twitchExtension = document.getElementById('twitchExtension');
  var twitchStream = document.createElement('div');
  var streamOverlay = document.createElement('div');
  var backButton = document.createElement('div');
  var exitButton = document.createElement('div');
  var loader = document.createElement('div');

  loader.id = 'loader';
  loader.style.top = '50%';

  twitchExtension.appendChild(loader);

  twitchStream.id = 'twitchStream';
  twitchStream.style.position = 'absolute';
  twitchStream.style.top = 0;

  backButton.style.backgroundImage = 'url(' + chrome.extension.getURL('back.png') + ')';
  backButton.id = 'backButton';
  backButton.style.width = '20px';
  backButton.style.height = '20px';
  backButton.style.backgroundSize = '20px 20px';
  backButton.style.padding = '15px';
  backButton.style.position = 'absolute';
  backButton.style.backgroundRepeat = 'no-repeat';
  backButton.style.backgroundPosition = 'center';
  backButton.style.float = 'left';
  backButton.addEventListener("click", function() {
      twitchStream.outerHTML = "";
  }, false);

  exitButton.style.backgroundImage = 'url(' + chrome.extension.getURL('cancel.png') + ')';
  exitButton.id = 'exitButton';
  exitButton.style.width = '15px';
  exitButton.style.height = '15px';
  exitButton.style.backgroundSize = '15px 15px';
  exitButton.style.padding = '17.5px';
  exitButton.style.position = 'absolute';
  exitButton.style.backgroundRepeat = 'no-repeat';
  exitButton.style.backgroundPosition = 'center';
  exitButton.style.right = 0;
  exitButton.addEventListener("click", function() {
      document.getElementById('twitchExtension').outerHTML = '';
  }, false);

  streamOverlay.id = 'streamOverlay';
  streamOverlay.appendChild(backButton);
  streamOverlay.appendChild(exitButton);

  twitchStream.innerHTML = '<iframe id="twitchPlayer" src="https://player.twitch.tv/?channel=' + evt.target.channelName +'&muted=true" height="320" width="540" frameborder="0" scrolling="no" allowfullscreen webkitallowfullscreen mozallowfullscreen> </iframe>'
  twitchStream.appendChild(streamOverlay);
  twitchExtension.appendChild(twitchStream);

  document.getElementById('twitchPlayer').onload = function() {
      loader.outerHTML = "";
    //   alert(document.getElementById('twitchPlayer').readyState);
  }
}
