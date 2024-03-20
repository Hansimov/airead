// ==UserScript==
// @name         AIRead
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  An AI-assisted reading script in browsers.
// @author       Hansimov
// @match        https://*.wikipedia.org/wiki/*
// @match        https://ar5iv.labs.arxiv.org/html/*
// @icon         https://raw.githubusercontent.com/Hansimov/openai-js/main/penrose.png
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    "use strict";
    console.log("+ Plugin loaded: AIRead");
    purepage();
})();
