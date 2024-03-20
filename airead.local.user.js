// ==UserScript==
// @name         AIRead - Local
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  (Local) An AI-assisted reading script in browsers.
// @author       Hansimov
// @match        https://*.wikipedia.org/wiki/*
// @match        https://ar5iv.labs.arxiv.org/html/*
// @match        http://127.0.0.1:17777/*.html
// @icon         https://raw.githubusercontent.com/Hansimov/openai-js/main/penrose.png
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function require_module(url, callback = null) {
    GM.xmlHttpRequest({
        method: "GET",
        url: url + `?ts=${new Date().getTime()}`,
        onload: function (response) {
            let script_element = document.createElement("script");
            script_element.innerHTML = response.responseText;
            document.body.appendChild(script_element);
            if (callback) callback();
        },
    });
}

function require_modules({ host = "127.0.0.1", port = 17777 } = {}) {
    let server = `http://${host}:${port}`;
    require_module(`${server}/openai-js/openai.user.js`);
    require_module(`${server}/purepage/purepage.user.js`, function () {
        require_module(`${server}/airead/airead.user.js`);
    });
}

(function () {
    "use strict";
    console.log("+ App loaded: AIRead (Local)");
    require_modules();
})();
