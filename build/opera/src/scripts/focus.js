'use strict';

class FocusOutline {
  constructor() {
    this.isVisible_ = false;
    this.focusRoot_ = document.documentElement;

    this.focusRoot_.classList.add(FocusOutline.FOCUS_MANAGED_CLASS);
    this.registerListeners_();
  }

  registerListeners_() {
    document.addEventListener('keydown', this.onKeyChange_.bind(this), false);
    document.addEventListener('mousedown', this.onMouseDown_.bind(this), true);
  }

  set isVisible(value) {
    this.isVisible_ = value;
    this.focusRoot_.classList.toggle(FocusOutline.OUTLINE_VISIBLE_CLASS,
                                     this.isVisible_);
  }

  get isVisible() {
    return this.isVisible_;
  }

  onKeyChange_(e) {
    if (e.keyCode === FocusOutline.KEY_CODE_TAB) {
      this.isVisible = true;
    } else if (e.keyCode === FocusOutline.KEY_CODE_ESC) {
      this.isVisible = false;
    }
  }

  onMouseDown_() {
    this.isVisible = false;
  }
};

FocusOutline.OUTLINE_VISIBLE_CLASS = 'focus-outline-visible';
FocusOutline.FOCUS_MANAGED_CLASS = 'focus-managed';

FocusOutline.KEY_CODE_TAB = 9;
FocusOutline.KEY_CODE_ESC = 27;


var focusOutline = new FocusOutline();
