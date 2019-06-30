'use strict';

class Layout {
  constructor() {
    this.waitFor = [];

    this.isReady_ = new Promise(function(resolve, reject) {
      document.addEventListener('DOMContentLoaded',
                                this.onReady_.bind(this, resolve), false);
    }.bind(this)).catch(doNothing);

    this.isShown_ = new Promise(function(resolve, reject) {
      document.addEventListener('DOMContentLoaded', function() {
        Promise.all(this.waitFor).then(this.onLoaded_.bind(this, resolve));
      }.bind(this), false);
    }.bind(this)).catch(doNothing);
  }

  get isReady() {
    return this.isReady_;
  }

  get isShown() {
    return this.isShown_;
  }

  onReady_(cb) {
    i18n.process(document.documentElement);
    cb();
  }

  onLoaded_(cb) {
    document.documentElement.classList.remove(Layout.LOADING_CLASS);
    cb();
  }
};

Layout.LOADING_CLASS = 'loading';

var layout = new Layout();
