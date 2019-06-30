var for_each = Function.prototype.call.bind(Array.prototype.forEach);
var map = Function.prototype.call.bind(Array.prototype.map);
var contains = Function.prototype.call.bind(function(element) {
var indexOf = Function.prototype.call.bind(Array.prototype.indexOf);
  return Array.prototype.indexOf.call(this, element) !== -1;
});

function getSupportedScaleFactors() {
  var supportedScaleFactors = [];
  if (navigator.appVersion.indexOf("Mac")) {
    supportedScaleFactors.push(1);
    supportedScaleFactors.push(2);
  } else {
    supportedScaleFactors.push(window.devicePixelRatio);
  }
  return supportedScaleFactors;
}

function url(s) {
  var s2 = s.replace(/(\(|\)|\,|\s|\'|\"|\\)/g, '\\$1');
  if (/\\\\$/.test(s2)) {
    s2 += ' ';
  }
  return 'url("' + s2 + '")';
}

function imageset(path) {
  var supportedScaleFactors = getSupportedScaleFactors();

  var replaceStartIndex = path.indexOf('scalefactor');
  if (replaceStartIndex < 0)
    return url(path);

  var s = '';
  for (var i = 0; i < supportedScaleFactors.length; ++i) {
    var scaleFactor = supportedScaleFactors[i];
    var pathWithScaleFactor = path.substr(0, replaceStartIndex) + scaleFactor +
      path.substr(replaceStartIndex + 'scalefactor'.length);

    s += url(pathWithScaleFactor) + ' ' + scaleFactor + 'x';

    if (i != supportedScaleFactors.length - 1)
      s += ', ';
  }
  return '-webkit-image-set(' + s + ')';
}

function registerHandler(type, query, callback) {
  document.addEventListener(type, function(e) {
    if (contains(document.querySelectorAll(query), e.target)) {
      callback(e, e.target);
    }
  }, false);
}

function doNothing() {}
