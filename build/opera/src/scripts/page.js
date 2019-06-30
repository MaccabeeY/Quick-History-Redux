'use strict';

class Page {
  constructor() {
    this.registerSettings_();
    layout.isReady.then(this.initialize_.bind(this));
  }

  static isSettingOfGroup(item, group) {
    return item.startsWith(group);
  }

  initialize_() {
    this.registerListeners_();
    this.registerHandlers_();
  }

  registerSettings_() {
    settings.register(Page.SETTING_UI_OPEN_SETTINGS_BUTTON, true);
    settings.register(Page.SETTING_UI_CLEAR_HISTORY_BUTTON, true);
    settings.register(Page.SETTING_UI_RANGE_FILTER, true);
    settings.register(Page.SETTING_LIST_RANGE, 0);
    settings.register(Page.SETTING_LIST_TYPE, 'timeline');
    settings.register(Page.SETTING_LIST_TIMELINE_GROUP_DAY, true);
    settings.register(Page.SETTING_LIST_TIMELINE_GROUP_DAY_EXPAND, true);
    settings.register(Page.SETTING_LIST_TIMELINE_GROUP_DOMAIN, true);
    settings.register(Page.SETTING_LIST_TIMELINE_GROUP_DOMAIN_EXPAND, true);
    settings.register(Page.SETTING_ITEM_FAVICON, true);
    settings.register(Page.SETTING_ITEM_HOUR, false);
  }

  registerListeners_() {
    Settings.Events.onChanged.addListener(this.onSettingsChagned_.bind(this));
  }

  registerHandlers_() {}

  onSettingsChagned_() {}
}


Page.SETTING_GROUP_UI = 'ui';
Page.SETTING_GROUP_LIST = 'list';
Page.SETTING_GROUP_ITEM = 'item';

Page.SETTING_UI_OPEN_SETTINGS_BUTTON =
    Page.SETTING_GROUP_UI + '.open_settings_button';
Page.SETTING_UI_CLEAR_HISTORY_BUTTON =
    Page.SETTING_GROUP_UI + '.clear_history_button';
Page.SETTING_UI_RANGE_FILTER =
    Page.SETTING_GROUP_UI + '.range_filter';
Page.SETTING_LIST_RANGE = Page.SETTING_GROUP_LIST + '.range';
Page.SETTING_LIST_TYPE = Page.SETTING_GROUP_LIST + '.type';
Page.SETTING_LIST_TIMELINE_GROUP_DAY =
    Page.SETTING_GROUP_LIST +'.timeline.group_day';
Page.SETTING_LIST_TIMELINE_GROUP_DAY_EXPAND =
    Page.SETTING_GROUP_LIST + '.timeline.group_day.expand';
Page.SETTING_LIST_TIMELINE_GROUP_DOMAIN =
    Page.SETTING_GROUP_LIST + '.timeline.group_domain';
Page.SETTING_LIST_TIMELINE_GROUP_DOMAIN_EXPAND =
    Page.SETTING_GROUP_LIST + '.timeline.group_domain.expand';
Page.SETTING_ITEM_FAVICON = Page.SETTING_GROUP_ITEM + '.favicon';
Page.SETTING_ITEM_HOUR = Page.SETTING_GROUP_ITEM + '.hour';
