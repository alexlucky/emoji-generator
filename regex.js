/**
 * Created by chenzhuokai on 16/6/3.
 */
(function () {
  'use strict';
  const fs = require('fs-extra');
  const _ = require('lodash');

  let emojiList = fs.readJsonSync(__dirname + '/emoji.json');
  const fromCharCode = String.fromCharCode;
  const unicodeToJsEscape = require('unicode-escape');

  let unicodeList = emojiList.map(function (emoji) {
    emoji.converted = emoji.unicode.replace(/U\+/g, '').replace(/\s/g, '-');
    return emoji;
  });

  unicodeList = _.sortBy(unicodeList, function (unicode) {
    return -(unicodeToJsEscape(unicode.converted).length);
  });

  unicodeList = unicodeList.map(function (unicode) {
    unicode.converted = unicodeToJsEscape(unicode.converted.split('-').map(fromCodePoint).join(''));
    return unicode;
  });

  console.log('Exporting regex-es5.txt');
  fs.outputFileSync(__dirname + '/regex-es5.txt', unicodeList.map((u)=> {
    return u.converted;
  }).join('|'));

  console.log('Exporting regex-es6.txt');
  fs.outputFileSync(__dirname + '/regex-es6.txt', unicodeList.map((u)=> {
    return u.unicode.replace(/\s/g, '').replace(/U\+([0-9A-F]+)/ig, '\\u{$1}').toLocaleLowerCase();
  }).join('|'));

  console.log('Exporting regex-python.txt');
  fs.outputFileSync(__dirname + '/regex-python.txt', unicodeList.map((u)=> {
    return u.unicode.replace(/\s/g, '').replace(/U\+/g, '\\U000');
  }).join('|'));

  fs.outputJson(__dirname + '/unicode.json', unicodeList);

  function fromCodePoint(codepoint) {
    let code = typeof codepoint === 'string' ?
      parseInt(codepoint, 16) : codepoint;
    if (code < 0x10000) {
      return fromCharCode(code);
    }
    code -= 0x10000;
    return fromCharCode(
      0xD800 + (code >> 10),
      0xDC00 + (code & 0x3FF)
    );
  }
})();
