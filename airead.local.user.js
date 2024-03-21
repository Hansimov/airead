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
// @connect      *
// @grant        GM_xmlhttpRequest
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
    return Promise.all([
        require_module(jquery_js),
        require_module(bootstrap_js),
        require_module(bootstrap_css),
        require_module(font_awesome_css),
        require_module(font_awesome_v4_css),
        // require_module(openai_user_js, false),
        require_module(pure_page_user_js, false),
    ]);
}

const LLM_ENDPOINT = "https://hansimov-hf-llm-api.hf.space/api";

async function process_stream_response(response, on_chunk) {
    const decoder = new TextDecoder("utf-8");
    function stringify_stream_bytes(bytes) {
        return decoder.decode(bytes);
    }
    function jsonize_stream_data(data) {
        var json_chunks = [];
        data = data
            .replace(/^data:\s*/gm, "")
            .replace(/\[DONE\]/gm, "")
            .split("\n")
            .filter(function (line) {
                return line.trim().length > 0;
            })
            .map(function (line) {
                try {
                    let json_chunk = JSON.parse(line.trim());
                    json_chunks.push(json_chunk);
                } catch {
                    console.log(`Failed to parse: ${line}`);
                }
            });
        return json_chunks;
    }
    let reader = response.response.getReader();
    let content = "";

    while (true) {
        let { done, value } = await reader.read();
        if (done) {
            break;
        }
        let json_chunks = jsonize_stream_data(stringify_stream_bytes(value));
        for (let json_chunk of json_chunks) {
            let chunk = json_chunk.choices[0];
            if (on_chunk) {
                content += on_chunk(chunk);
            }
        }
    }
    return content;
}

function get_llm_models({ endpoint } = {}) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: endpoint + "/v1/models",
            headers: {
                "Content-Type": "application/json",
            },
            onload: function (response) {
                let data = JSON.parse(response.responseText);
                let models = data.data.map((item) => item.id);
                resolve(models);
            },
            onerror: function (error) {
                reject(error);
            },
        });
    });
}

function chat_completions({
    messages,
    endpoint = LLM_ENDPOINT,
    model = "mixtral-8x7b",
    max_tokens = -1,
    temperature = 0.5,
    top_p = 0.95,
    stream = false,
} = {}) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "POST",
            url: endpoint + "/v1/chat/completions",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            data: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: max_tokens,
                temperature: temperature,
                top_p: top_p,
                stream: stream,
            }),
            responseType: stream ? "stream" : "json",
            onloadstart: function (response) {
                if (stream) {
                    resolve(response);
                }
            },
            onload: function (response) {
                if (!stream) {
                    let data = JSON.parse(response.responseText);
                    let content = data.choices[0].message.content;
                    resolve(content);
                }
            },
            onerror: function (error) {
                reject(error);
            },
        });
    });
}

}

(function () {
    "use strict";
    console.log("+ App loaded: AIRead (Local)");
    require_modules();
})();
