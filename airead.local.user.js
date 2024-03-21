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
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

function require_module(url, cache = true) {
    return new Promise(function (resolve, reject) {
        if (!cache) {
            url = url + `?ts=${new Date().getTime()}`;
        }
        GM.xmlHttpRequest({
            method: "GET",
            url: url,
            onload: function (response) {
                let module_element;
                if (url.endsWith(".css")) {
                    module_element = document.createElement("style");
                } else {
                    module_element = document.createElement("script");
                }
                module_element.innerHTML = response.responseText;
                document.head.appendChild(module_element);
                resolve();
            },
            onerror: function (error) {
                reject(error);
            },
        });
    });
}

function require_modules({ host = "127.0.0.1", port = 17777 } = {}) {
    let jquery_js = "https://code.jquery.com/jquery-3.7.1.min.js";
    let bootstrap_js =
        "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js";
    let bootstrap_css =
        "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css";
    let font_awesome_css =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
    let font_awesome_v4_css =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/v4-shims.min.css";
    let server = `http://${host}:${port}`;
    let openai_user_js = `${server}/openai-js/openai.user.js`;
    let pure_page_user_js = `${server}/purepage/purepage.user.js`;
    let airead_user_js = `${server}/airead/airead.user.js`;
    Promise.all([
        require_module(jquery_js),
        require_module(bootstrap_js),
        require_module(bootstrap_css),
        require_module(font_awesome_css),
        require_module(font_awesome_v4_css),
        require_module(openai_user_js, false),
        require_module(pure_page_user_js, false),
    ])
        .then(function () {
            require_module(airead_user_js, false);
        })
        .catch(function (error) {
            console.error(error);
        });
}

(function () {
    "use strict";
    console.log("+ App loaded: AIRead (Local)");
    require_modules();
})();
