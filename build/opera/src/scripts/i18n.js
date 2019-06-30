'use strict';

class I18n {
  get dir() {
    return i18n.get('@@bidi_dir');
  }

  get lang() {
    return chrome.i18n.getUILanguage();
  }

  process(node) {
    var attr = 'i18n-content';
    for_each(node.querySelectorAll('[' + attr + ']'), function (item) {
      var value = item.getAttribute(attr);
      item.textContent = i18n.get(value);
    });

    attr = 'i18n-values';
    for_each(node.querySelectorAll('[' + attr + ']'), function (item) {
      var value = item.getAttribute(attr);
      for_each(value.split(';'), function (def) {
        def = def.split(':');
        var key = def[0];
        var value = i18n.get(def[1]);

        if (key.indexOf('.') === 0) {
          key = key.substring(1);
          item[key] = value;
        } else {
          item.setAttribute(key, value);
        }
      });
    });
  }

  get(value, placeholders) {
    return chrome.i18n.getMessage(value, placeholders);
  }
};

var i18n = new I18n();
