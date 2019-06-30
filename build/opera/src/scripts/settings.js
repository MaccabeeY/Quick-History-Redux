'use strict';

class Settings {
  constructor() {
    window.addEventListener('storage', function(e) {
      if (e.storageArea === localStorage && e.key) {
        Settings.Events.onChanged.dispatch({
          key: e.key,
          oldValue: JSON.parse(e.oldValue),
          newValue: JSON.parse(e.newValue)
        });
      }
    }.bind(this), false);
  }

  has(key) {
    return localStorage.getItem(key) !== null;
  }

  get(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  set(key, value) {
    let oldValue = this.get(key);

    if (value === undefined) {
      value = null;
    }

    localStorage.setItem(key, JSON.stringify(value));
    Settings.Events.onChanged.dispatch({
      key: key,
      newValue: value,
      oldValue: oldValue
    });
  }

  remove(key) {
    localStorage.removeItem(key);
  }

  register(key, defaultValue) {
    defaultValue = defaultValue !== undefined ? defaultValue : null;
    if (this.has(key)) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(defaultValue));
  }
};

Settings.Events = {
  onChanged: new chrome.Event()
};

let settings = new Settings();
