'use strict';

class List {
  constructor() {
    this.isActive_ = false;
    layout.isReady.then(this.initialize_.bind(this));
  }

  initialize_() {
    this.registerListeners_();
    this.registerHandlers_();
  }

  get Templates() {
    return this.constructor.Templates;
  }

  get isActive() {
    return this.isActive_;
  }

  set isActive(value) {
    this.isActive_ = value;
  }

  registerListeners_() {}

  registerHandlers_() {}

  fetch_(data) {
    return Promise.resolve([]);
  }

  render(list, visits) {
    return this.fetch_(visits);
  }
};

List.Events = {
  onChanged: new chrome.Event()
};

List.Templates = class {
  static removeItem() {
    var item = document.createElement('span');
    item.classList.add('remove');
    item.setAttribute('tabindex', '0');
    item.title = i18n.get('removeItemButton');
    return item;
  }

  static removeGroup() {
    var item = this.removeItem();
    item.classList.add('remove-group');
    item.title = i18n.get('removeGroupButton');
    return item;
  }

  static item(data) {
    var item = document.createElement('a');
    item.setAttribute('tabindex', '0');
    item.href= data.url;
    item.classList.add('item');
    item.textContent = data.title || data.url;
    item.title = data.url;
    item.target = "_blank";
    item.style.backgroundImage = url(favicon.getURL(data.url));

    item.appendChild(this.removeItem());

    return item;
  }

  static listMessage(message) {
    var element = document.createElement('p');
    element.textContent = message;
    return element;
  }

  static groupHeader(name, size, favicon) {
    var header = document.createElement('h4');
    header.textContent = i18n.get('groupTitle', [size, name]);
    header.style.backgroundImage = url(favicon);
    header.appendChild(this.removeGroup());
    return header;
  }

  static group(name, favicon, items) {
    var group = document.createElement('div');
    if (name && items.length > 1) {
      group.classList.add('group');
      group.appendChild(this.groupHeader(name, items.length, favicon));
    }

    items.forEach(function(item) {
      group.appendChild(item);
    });

    return group;
  }

  static dayHeader(name) {
    var header = document.createElement('h3');
    header.textContent = name;
    return header;
  }

  static day(name, items) {
    var day = document.createElement('div');
    if (name) {
      day.classList.add('day');
      day.appendChild(this.dayHeader(name));
    }

    items.forEach(function(item) {
      day.appendChild(item);
    });

    return day;
  }
}
