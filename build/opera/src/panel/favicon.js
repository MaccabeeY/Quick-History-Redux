'use strict';

class Favicon {
  constructor() {
    this.registerListeners_();
  }

  registerListeners_() {
    chrome.tabs.onUpdated.addListener(this.onUpdated_.bind(this));
  }

  getURL(url) {
    return Favicon.HOST + url;
  }

  isInUse() {
    return document.querySelector('a[href="'+ tab.url +'"]');
  }

  onUpdated_(tabId, changeInfo, tab) {
    if (!changeInfo.favIconUrl || !this.isInUse) {
      return;
    }

    var url = tab.url;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.getURL(url), true);
    xhr.onload = function() {
      Favicon.Events.onUpdated.dispatch(url);
    }.bind(this);

    xhr.send(Date.now());
  }
};

Favicon.HOST = 'chrome://favicon/';

Favicon.Events = {
  onUpdated: new chrome.Event()
};

var favicon = new Favicon();
