'use strict';

class SearchList extends List {
  constructor() {
    super();
    this.linksToRemove_ = [];
  }

  get isActive() {
    return super.isActive;
  }

  set isActive(value) {
    super.isActive = value;
    document.documentElement.classList.toggle(SearchList.ID, this.isActive);
  }

  get searchField() {
    return document.querySelector('#manager header input');
  }

  get removeFoundItemsButton() {
    return document.querySelector('#clear-search-results');
  }

  static get query() {
    return sessionStorage.getItem(SearchList.SETTING_QUERY) || '';
  }

  static set query(value) {
    sessionStorage.setItem(SearchList.SETTING_QUERY, value);
  }

  initialize_() {
    super.initialize_();
    this.searchField.value = SearchList.query;
  }

  registerHandlers_() {
    this.searchField.addEventListener('search', this.onSearch_.bind(this),
                                      false);
    this.removeFoundItemsButton.addEventListener('click',
                                                 this.onRemove_.bind(this),
                                                 false);
  }

  fetch_(data) {
    return Promise.resolve(data.map(function(item) {
      return {
        url: item.url,
        title: item.title,
        visitTime: item.lastVisitTime
      };
    }));
  }

  onSearch_() {
    var value = this.searchField.value.trim();
    value = value.length < 3 ? '' : value;

    if (value !== SearchList.query) {
      SearchList.query = value;
      List.Events.onChanged.dispatch(this);
    }
  }

  onRemove_() {
    this.linksToRemove_.forEach(function(url) {
      chrome.history.deleteUrl({
        url: url
      });
    });
  }

  render(list, visits) {
    if (!SearchList.query) {
      this.isActive = false;
      return Promise.resolve();
    } else {
      this.isActive = true;
      list.textContent = '';
      var headerText = i18n.get('searchResultHeader', [visits.length])
      var header = this.Templates.dayHeader(headerText);
      list.appendChild(header);

      this.removeFoundItemsButton.hidden = !visits.length;

      if (!visits.length) {
        var message = this.Templates.listMessage(i18n.get('noSearchHistory'));
        list.appendChild(message);
        return Promise.resolve();
      } else {
        return super.render(list, visits).then(function(data) {
          return new Promise(function(resolve, reject) {
            this.linksToRemove_ = data.map(function(item) {
              return item.url;
            });

            data.forEach(function(element) {
              list.appendChild(this.Templates.item(element));
            }.bind(this));

            resolve();
          }.bind(this));
        }.bind(this));
      }
    }
  }
};

SearchList.Templates = class extends List.Templates {};

SearchList.ID = 'search-view';
SearchList.SETTING_QUERY = 'search_query';
