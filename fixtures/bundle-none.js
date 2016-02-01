'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var q = function (a) {
  if (a === 42) {
    return true;
  }
};

var q$1 = function (a) {
  /* istanbul ignore if */
  if (a === 42) {
    return true;
  }
};

var i = function () {
  return 42;
};

var t = function () {
  throw new Error('Thrown by source-map-fixtures');
};

exports.branching = q;
exports.istanbulIgnore = q$1;
exports.simple = i;
exports.throws = t;
