'use strict';

class PanelPage extends Page {
  constructor(views) {
    super();
    this.views_ = views;
    this.maxResults_ = PanelPage.MAX_RESULTS;
    this.lastUpdateTimeStamp_ = 0;
    this.isRemoveInProgress_ = false;
  }

  get loadMoreButton() {
    return document.querySelector('#load-more');
  }

  get clearAllButton() {
    return document.querySelector('#clear-history');
  }

  get openSettingsButton() {
    return document.querySelector('#open-settings');
  }

  get rangeFilter() {
    return document.querySelector('#manager footer select');
  }

  get container() {
    return document.querySelector('#list-container');
  }

  initialize_() {
    super.initialize_();
    this.updateUI_();
    this.update();
  }

  registerHandlers_() {
    super.registerHandlers_();

    this.loadMoreButton.addEventListener('click', this.onLoadMore_.bind(this),
                                         false);
    this.clearAllButton.addEventListener('click', this.onClearAll_.bind(this),
                                         false);
    this.openSettingsButton.addEventListener('click',
                                             this.onOpenSettings_.bind(this),
                                             false);
    this.rangeFilter.addEventListener('change', this.onRangeChange_.bind(this),
                                      false);

    registerHandler('click', '.remove', this.onRemove_.bind(this));
  }

  registerListeners_() {
    super.registerListeners_();

    var update = this.update.bind(this);
    chrome.history.onVisited.addListener(update);
    chrome.history.onVisitRemoved.addListener(this.onVisitRemoved_.bind(this));
    List.Events.onChanged.addListener(update);
    Favicon.Events.onUpdated.addListener(this.onFaviconChange_.bind(this));
  }

  onSettingsChagned_(setting) {
    super.onSettingsChagned_();

    if (Page.isSettingOfGroup(setting.key, Page.SETTING_GROUP_UI)) {
      this.updateUI_();
      if (settings.key === Page.SETTING_UI_RANGE_FILTER) {
        alert('update');
        this.update();
      }
    } else {
      this.update();
    }
  }

  updateUI_() {
    this.clearAllButton.hidden =
        !settings.get(Page.SETTING_UI_CLEAR_HISTORY_BUTTON);
    this.openSettingsButton.hidden =
        !settings.get(Page.SETTING_UI_OPEN_SETTINGS_BUTTON);
    this.rangeFilter.value = settings.get(Page.SETTING_LIST_RANGE);
    this.rangeFilter.hidden = !settings.get(Page.SETTING_UI_RANGE_FILTER);
  }

  update() {
    var requestTimeStamp = this.lastUpdateTimeStamp_ = Date.now();

    var query = SearchList.query;
    var range = settings.get(Page.SETTING_LIST_RANGE);
    if (query || !settings.get(Page.SETTING_UI_RANGE_FILTER)) {
      range = 0;
    }

    var hasPagination = !range && !query &&
        settings.get(Page.SETTING_LIST_TIMELINE_GROUP_DAY);

    chrome.history.search({
      text: query,
      startTime: range == 0 ? 0 : Date.now() - range,
      maxResults: hasPagination ? this.maxResults_ : 0
    }, function(visits) {
      if (this.lastUpdateTimeStamp_ !== requestTimeStamp) {
        return;
      }
      var container = document.createElement('div');
      container.id = this.container.id;
      Promise.all(this.views_.map(function(view) {
        return view.render(container, visits);
      }.bind(this))).then(function() {
        if (!container.isEqualNode(this.container)) {
          this.container.parentElement.replaceChild(container, this.container);
        }
        var hasMoreItems = hasPagination && visits.length === this.maxResults_;
        this.loadMoreButton.hidden = !hasMoreItems;
      }.bind(this));

    }.bind(this));
  }

  onRemove_(e, target) {
    var linksToRemove = [];

    if (target.classList.contains('remove-group')) {
      var group = target.closest('.group');
      for_each(group.querySelectorAll('.item'), function(item) {
        linksToRemove.push(item.href);
      });
      group.remove();
    } else {
      var item = target.closest('.item');
      linksToRemove.push(item.href);
      item.remove();
    }

    this.isRemoveInProgress_ = true;

    linksToRemove.forEach(function(link) {
      chrome.history.deleteUrl({
        url: link
      });
    });

    setTimeout(function() {
      this.isRemoveInProgress_ = false;
      this.onVisitRemoved_();
    }.bind(this), 10);

    e.preventDefault();
  }

  onVisitRemoved_() {
    if (this.isRemoveInProgress_) {
      return;
    }
    this.update();
  }

  onLoadMore_(e) {
    this.maxResults_ += PanelPage.MAX_RESULTS;
    this.update();
    e.preventDefault();
  }

  onClearAll_(e) {
    chrome.tabs.create({
      url: 'chrome://settings/clearBrowserData',
      active: true
    });

    /*var value = settings.get('list.range');
    if (value == 0) {
      chrome.history.deleteAll(update);
    } else {
      var since = Date.now() - value;
      chrome.history.deleteRange({
        endTime: Date.now(),
        startTime: since
      }, update);
    }*/

    e.preventDefault();
  }

  onOpenSettings_(e) {
/*PEP    chrome.tabs.create({
      url: chrome.extension.getURL(chrome.app.getDetails().options_page),
      active: true
    });*/
    chrome.runtime.openOptionsPage();
    e.preventDefault();
  }

  onRangeChange_(e) {
    var value = parseInt(e.target.value, 10);
    settings.set(Page.SETTING_LIST_RANGE, value);
    e.preventDefault();
  }

  setFavicon_(value, item) {
    item.style.backgroundImage = value;
    if (item.parentElement.classList.contains('group')) {
      item.parentElement.querySelector('h4').style.backgroundImage = value;
    }
  }

  onFaviconChange_(link) {
    var items = this.container.querySelectorAll('[href="' + link + '"]');

    for_each(items, this.setFavicon_.bind(this, ''));

    setTimeout(function() {
      for_each(items, this.setFavicon_.bind(this, url(favicon.getURL(link))));
    }.bind(this), 10);
  }
};

PanelPage.MAX_RESULTS = 100;


var panelPage = new PanelPage([new TimelineList(), new SearchList()]);
