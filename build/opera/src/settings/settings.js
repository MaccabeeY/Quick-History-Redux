'use strict';

class SettingsPage extends Page {
  constructor() {
    super();
  }

  initialize_() {
    super.initialize_();
    this.registerListeners_();
    this.registerHandlers_();
    this.fetch_();
  }

  registerHandlers_() {
    super.registerHandlers_();
    registerHandler('click', '#reset', this.onReset_.bind(this));
    registerHandler('change', '.setting [name]', this.onChange_.bind(this));
  }

  getSettingsForElement_(el) {
    return el.querySelectorAll('.setting [name]');
  }

  onSettingsChagned_() {
    super.onSettingsChagned_();
    this.fetch_();
  }

  fetch_() {
    for_each(this.getSettingsForElement_(document), function(item) {
      var name = item.getAttribute('name');
      if (!settings.has(name)) {
        return;
      }
      var type = item.getAttribute('type');
      var value = settings.get(name);

      var isActive = true;
      if (item.tagName === 'INPUT') {
        if (type === 'checkbox') {
          item.checked = value;
          isActive = value;
        } else if (type === 'radio') {
          item.checked = isActive = value === item.getAttribute('value');
        } else {
          item.value = value;
        }
      } else if (item.tagName === 'SELECT') {
        item.value = value;
      }

      var settingElement = item;
      while (!!settingElement &&
          !settingElement.classList.contains('setting')) {
        settingElement = settingElement.parentElement;
      }

      if (!settingElement) {
        return;
      }

      if (item.disabled) {
        isActive = false;
      }

      for_each(this.getSettingsForElement_(settingElement), function(el) {
        if (item !== el) {
          el.disabled = !isActive;
        }
      });

    }.bind(this));
  }

  onReset_() {
    localStorage.clear();
    this.registerSettings_();
    this.fetch_();
  }

  onChange_(event, target) {
    var name = target.getAttribute('name');
    if (!settings.has(name)) {
      return;
    }

    var type = target.getAttribute('type');
    var value;

    if (target.tagName === 'INPUT' && type === 'checkbox') {
      value  = target.checked;
    } else {
      value = target.value;
    }
    settings.set(name, value);
  }
};

var page = new SettingsPage();
