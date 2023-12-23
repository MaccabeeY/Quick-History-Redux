'use strict';

class Favicon {
  constructor() {
    this.registerListeners_();
  }

  registerListeners_() {
//PEP    chrome.tabs.onUpdated.addListener(this.onUpdated_.bind(this));
  }

  getURL(url) {
//PEP    return Favicon.HOST + url;
return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=16`;
/*PEP for when opera gets around to support the new chrome standard
    const icon = new URL(chrome.runtime.getURL('/_favicon/'));
    icon.searchParams.set('pageUrl', url);
    icon.searchParams.set('size', '16');
    return icon.toString();*/
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
//PEP  onUpdated: new chrome.Event()
//PEP2  onUpdated: chrome.runtime.onMessage.constructor()
  onUpdated: chrome.runtime.onMessage
};

var favicon = new Favicon();
