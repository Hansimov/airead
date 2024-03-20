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

function require_modules({ host = "127.0.0.1", port = 17777 } = {}) {
    let server = `http://${host}:${port}`;
    let module_urls = [
        `${server}/purepage/purepage.user.js`,
        `${server}/openai-js/openai.user.js`,
        `${server}/airead/airead.user.js`,
    ];
    for (let i = 0; i < module_urls.length; i++) {
        let url = module_urls[i];
        GM.xmlHttpRequest({
            method: "GET",
            url: url + `?ts=${new Date().getTime()}`,
            onload: function (response) {
                let remoteScript = document.createElement("script");
                remoteScript.innerHTML = response.responseText;
                document.body.appendChild(remoteScript);
            },
        });
    }
}

(function () {
    "use strict";
    console.log("+ App loaded: AIRead (Local)");
    require_modules();
})();
