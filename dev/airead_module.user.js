// ==UserScript==
// @name         (Dev) AIRead Module
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  (Dev) Module script for AIRead
// @author       Hansimov
// @connect      *
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

// ===================== RequireModules Start ===================== //

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

function require_modules() {
    let jquery_js = "https://code.jquery.com/jquery-3.7.1.min.js";
    let bootstrap_js =
        "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js";
    let bootstrap_css =
        "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css";
    let font_awesome_css =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
    let font_awesome_v4_css =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/v4-shims.min.css";
    let showdown_js =
        "https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js";
    let showdown_katex_js =
        "https://cdn.jsdelivr.net/npm/showdown-katex@0.8.0/dist/showdown-katex.min.js";
    let leader_line_js =
        "https://cdnjs.cloudflare.com/ajax/libs/leader-line/1.0.3/leader-line.min.js";
    return Promise.all([
        require_module(jquery_js),
        require_module(bootstrap_js),
        require_module(bootstrap_css),
        require_module(font_awesome_css),
        require_module(font_awesome_v4_css),
        require_module(showdown_js),
        require_module(showdown_katex_js),
        require_module(leader_line_js),
    ]);
}

// ===================== RequireModules End ===================== //

// ===================== PurePage Start ===================== //

// Informative Tags

const HEADER_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"];
const TABLE_TAGS = ["table"];
const PRE_TAGS = ["pre"];
const BLOCKQUOTE_TAGS = ["blockquote"];
const IMG_TAGS = ["img"];
const CAPTION_TAGS = ["figcaption"];

const BODY_TAGS = ["body"];
const GROUP_TAGS = ["div", "section"];
const LIST_TAGS = ["ul", "ol"];
const DEF_TAGS = ["dl"];
const FIGURE_TAGS = ["figure"];

const P_TAGS = ["p"];
const LI_TAGS = ["li"];
const DD_TAGS = ["dt", "dd"];
const LINK_TAGS = ["a"];
const SPAN_TAGS = ["span"];
const MATH_TAGS = ["math"];
const CODE_TAGS = ["code"];

const ITEM_TAGS = ["li", "dd", "dt"];
const ENV_TAGS = ["table", "pre", "img", "math", "code", "figcaption"];
const T_TAGS = ["tbody", "tr", "th", "td"];

const ATOM_TAGS = [].concat(
    HEADER_TAGS,
    TABLE_TAGS,
    PRE_TAGS,
    // CODE_TAGS,
    BLOCKQUOTE_TAGS,
    // IMG_TAGS,
    // LINK_TAGS,
    CAPTION_TAGS
);
const PARA_TAGS = [].concat(
    BODY_TAGS,
    GROUP_TAGS,
    // SPAN_TAGS,
    LIST_TAGS,
    DEF_TAGS,
    P_TAGS,
    LI_TAGS,
    DD_TAGS
);

const NON_TEXT_TAGS = [].concat(TABLE_TAGS, IMG_TAGS, MATH_TAGS);

const CUSTOM_CSS = `
.pure-element {
    // border: 1px solid #ffcccc !important;
}

.pure-element:hover {
    // border: 1px solid azure !important;
    // background-color: azure !important;
}
`;

// Removed Elements classes and ids

const COMMON_REMOVED_CLASSES = ["(?<!flex-wrap-)footer"];
const WIKIPEDIA_REMOVED_CLASSES = [
    "mw-editsection",
    "(vector-)((user-links)|(menu-content)|(body-before-content)|(page-toolbar))",
    "(footer-)((places)|(icons))",
];
const ARXIV_REMOVED_CLASSES = ["(ltx_)(page_footer)"];

const REMOVED_CLASSES = [].concat(
    COMMON_REMOVED_CLASSES,
    WIKIPEDIA_REMOVED_CLASSES,
    ARXIV_REMOVED_CLASSES
);

// Excluded Elements classes and ids

const COMMON_EXCLUDED_CLASSES = [
    "(?<!has-?)sidebar",
    "related",
    // "comment",
    "topbar",
    "offcanvas",
    "navbar",
    "sf-hidden",
    "noprint",
    "is-hidden-mobile",
];
const WIKIPEDIA_EXCLUDED_CLASSES = [
    "(mw-)((jump-link)|(valign-text-top))",
    "language-list",
    "p-lang-btn",
    "(vector-)((header)|(column)|(sticky-pinned)|(dropdown-content)|(page-toolbar)|(body-before-content)|(settings))",
    "navbox",
    "catlinks",
    "side-box",
    "contentSub",
    "siteNotice",
];
const STACKOVERFLOW_EXCLUDED_CLASSES = [
    "bottom-notice",
    "form-submit",
    "(comments?-)((form)|(flagging)|(link.*)|(score)|(voting))",
    "s-popover",
    "(js-)((suggest-edit-post)|(flag-post-link))",
    "your-answer-header",
];
const ARXIV_EXCLUDED_CLASSES = [
    "(ltx_)((flex_break)|(pagination))",
    "extra-services",
];
const DOCS_PYTHON_EXCLUDED_CLASSES = ["clearer"];
const AMINER_EXCLUDED_CLASSES = ["dropcontent", "LayoutsHeaderPlaceholder"];
const WEIBO_EXCLUDED_CLASSES = ["nav_main", "index_box"];

const EXCLUDED_CLASSES = [].concat(
    REMOVED_CLASSES,
    COMMON_EXCLUDED_CLASSES,
    WIKIPEDIA_EXCLUDED_CLASSES,
    STACKOVERFLOW_EXCLUDED_CLASSES,
    ARXIV_EXCLUDED_CLASSES,
    DOCS_PYTHON_EXCLUDED_CLASSES,
    AMINER_EXCLUDED_CLASSES,
    WEIBO_EXCLUDED_CLASSES
);

// Helper Functions

function get_tag(element) {
    if (element.nodeType === Node.TEXT_NODE) {
        return "text_node";
    } else if (element.nodeType === Node.COMMENT_NODE) {
        return "comment_node";
    } else {
        try {
            return element.tagName.toLowerCase();
        } catch (error) {
            return "unknown";
        }
    }
}
function is_text_node(element) {
    return get_tag(element) === "text_node";
}
function is_element_node(element) {
    return get_tag(element) !== "text_node";
}
function is_element_only_consist_of_text_and_code_nodes(element) {
    return Array.from(element.childNodes).every((node) => {
        return is_text_node(node) || get_tag(node) === "code";
    });
}
function is_text_element(element) {
    return is_element_node(element) && is_element_in_tags(element, ["span", "code", "a"]) && is_element_only_consist_of_text_and_code_nodes(element);
}
function get_all_text_nodes(element) {
    let text_nodes = [];
    for (let node of element.childNodes) {
        if (is_text_node(node)) {
            text_nodes.push(node);
        } else {
            text_nodes = text_nodes.concat(get_all_text_nodes(node));
        }
    }
    return text_nodes;
}
function get_descendants(element) {
    return Array.from(element.querySelectorAll("*"));
}
function get_parents(element) {
    var parents = [];
    var parent = element.parentElement;
    while (parent) {
        parents.push(parent);
        parent = parent.parentElement;
    }
    return parents;
}

function is_elements_has_tags(elements, tags) {
    return elements.some((element) => tags.includes(get_tag(element)));
}
function is_element_in_tags(element, tags) {
    return tags.includes(get_tag(element));
}
function is_all_elements_in_tags(elements, tags) {
    return elements.every((element) => tags.includes(get_tag(element)));
}
function is_siblings_has_tags(element, tags) {
    let siblings = Array.from(element.parentElement.childNodes);
    // exclude element itself
    siblings = siblings.filter((sibling) => sibling !== element);
    return siblings.some((sibling) => tags.includes(get_tag(sibling)));
}
function unwrap_para_of_element(element) {
    let nodes = [];
    for (let node of element.childNodes) {
        if (is_element_only_consist_of_text_and_code_nodes(node)
            || is_element_in_tags(node, ATOM_TAGS)
        ) {
            nodes.push(node);
        } else {
            if (is_element_in_tags(node, [...PARA_TAGS, ...SPAN_TAGS])) {
                nodes = nodes.concat(unwrap_para_of_element(node));
            } else {
                nodes.push(node);
            }
        }
    }
    return nodes;
}

function is_class_id_match_pattern(element, pattern_str) {
    let pattern = new RegExp(pattern_str, "i");
    let parents = get_parents(element);
    let is_match =
        pattern.test(element.className) ||
        pattern.test(element.id) ||
        parents.some((parent) => pattern.test(parent.className)) ||
        parents.some((parent) => pattern.test(parent.id));
    return is_match;
}

function get_width_of_child_nodes(element) {
    // width of first level child nodes, including text nodes
    return element.childNodes.length;
}
function get_max_width_of_descendants(element) {
    // max width of descendants means: max count of child elements per level
    let max_width = get_width_of_child_nodes(element);
    let descendants = get_descendants(element);
    for (let i = 0; i < descendants.length; i++) {
        let width = get_width_of_child_nodes(descendants[i]);
        if (width > max_width) {
            max_width = width;
        }
    }
    return max_width;
}
function get_deepest_single_child_node(element) {
    // dive deeper until width of child nodes is not 1,
    // then return the last child which has width of 1
    let child = element;
    while (get_width_of_child_nodes(child) === 1) {
        child = child.childNodes[0];
    }
    return child;
}

// Main Classes

class PureElementsSelector {
    constructor() { }
    is_atomized(element) {
        // this is meant to find the min-max unit of element
        const tag = get_tag(element);
        const descendants = get_descendants(element);
        const parents = get_parents(element);

        // if any ancient is atomized, then this element is not atomized,
        // as atom should be maximized
        const is_any_ancient_atomized = is_elements_has_tags(parents, ATOM_TAGS);
        if (ATOM_TAGS.includes(tag)) {
            return !is_any_ancient_atomized;
        }

        if ([...PARA_TAGS, ...SPAN_TAGS].includes(tag)) {
            // if all unwrapped nodes are text nodes or elements, then this element is atomized
            let unwrapped_nodes = unwrap_para_of_element(element);
            const is_unwrapped_nodes_all_text = unwrapped_nodes.every((node) => is_element_only_consist_of_text_and_code_nodes(node));
            if (is_unwrapped_nodes_all_text) {
                return true;
            }

            // if any descendant is para-type (except consist only text and codes), then this element is not atomized
            const is_descendant_has_para = is_elements_has_tags(
                descendants, PARA_TAGS
            );

            // if descendant has atom, and descendant width is 1, then this element is not atomized
            // as atom should be minimized
            const is_descendant_has_only_atom =
                get_max_width_of_descendants(element) == 1 &&
                is_elements_has_tags(descendants, ATOM_TAGS);

            return !(
                is_descendant_has_para ||
                is_descendant_has_only_atom
            );
        }
        return false;
    }
    filter_removed_elements(elements) {
        let output_elements = elements;
        // if class+id of element+parents match any pattern in REMOVED_CLASSES, then remove it
        for (let i = 0; i < REMOVED_CLASSES.length; i++) {
            for (let j = 0; j < output_elements.length; j++) {
                if (is_class_id_match_pattern(output_elements[j], REMOVED_CLASSES[i])) {
                    // remove element from DOM
                    output_elements[j].remove();
                    // remove element from output_elements
                    output_elements.splice(j, 1);
                }
            }
        }
        return output_elements;
    }
    filter_excluded_elements(elements) {
        let output_elements = elements;
        // if class+id of element+parents match any pattern in EXCLUDED_CLASSES, then exclude it
        for (let i = 0; i < EXCLUDED_CLASSES.length; i++) {
            output_elements = output_elements.filter(
                (element) => !is_class_id_match_pattern(element, EXCLUDED_CLASSES[i])
            );
        }
        return output_elements;
    }
    filter_atom_elements(elements) {
        let output_elements = [];
        for (let i = 0; i < elements.length; i++) {
            if (this.is_atomized(elements[i])) {
                output_elements.push(elements[i]);
            }
        }
        return output_elements;
    }
    filter_no_text_elements(elements) {
        let output_elements = [];
        for (let i = 0; i < elements.length; i++) {
            if (
                elements[i].textContent ||
                NON_TEXT_TAGS.includes(get_tag(elements[i]))
            ) {
                output_elements.push(elements[i]);
            }
        }
        return output_elements;
    }
    filter_overlapped_elements(elements) {
        // remove elements which are children of other elements in elements
        let output_elements = [...elements];
        for (let element of elements) {
            let parents = get_parents(element);
            for (let parent of parents) {
                if (output_elements.includes(parent)) {
                    output_elements = output_elements.filter(
                        (item) => item !== element
                    );
                }
            }
        }
        return output_elements;
    }
    numbering_elements(elements) {
        console.log("Pure elements count:", elements.length);
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.add("pure-element");
            elements[i].classList.add(`pure-element-id-${i}`);
            elements[i].dataset.idx = i;
            elements[i].dataset.highlightByElementIdxs = JSON.stringify([]);
        }
        return elements;
    }
    stylize() {
        let style_element = document.createElement("style");
        style_element.textContent = CUSTOM_CSS;
        document.head.appendChild(style_element);
        for (let element of this.pure_elements) {
            // if element in h1~h6, and it has no color set, then make it blue
            if (element.tagName.match(/h[1-6]/i)) {
                if (!element.style.color) {
                    element.style.color = "blue";
                }
            }
        }
    }
    select() {
        let pure_elements = get_descendants(document.body);
        this.filter_removed_elements(pure_elements);
        pure_elements = this.filter_excluded_elements(pure_elements);
        pure_elements = this.filter_atom_elements(pure_elements);
        pure_elements = this.filter_no_text_elements(pure_elements);
        pure_elements = this.filter_overlapped_elements(pure_elements);
        pure_elements = this.numbering_elements(pure_elements);
        this.pure_elements = pure_elements;
        return this.pure_elements;
    }
}

const LATEX_FORMAT_MAP = {
    "\\\\math((bf)|(bb))": "",
    "\\\\textsc": "\\text",
    // "\\\\operatorname": "",
};
const WHITESPACE_MAP = {
    "\\s+": " ",
    "\\n{3,}": "\\n\\n",
};

class ElementContentConverter {
    constructor(element) {
        this.element = element;
    }
    replace_math_with_latex({
        element = null,
        is_replace = false,
        keep_format = false,
    } = {}) {
        if (!element) {
            element = this.element;
        }
        // find math tags in math_element
        let math_tags = element.querySelectorAll("math");
        // extract latex from math tags, and replace math element with latex
        for (let math_tag of math_tags) {
            let latex_text = math_tag.getAttribute("alttext");
            latex_text = latex_text.replace("\\displaystyle", "");

            if (!keep_format) {
                let re;
                for (let regex in LATEX_FORMAT_MAP) {
                    re = new RegExp(regex, "gm");
                    latex_text = latex_text.replace(re, LATEX_FORMAT_MAP[regex]);
                }
            }

            let is_inline = math_tag.getAttribute("display") === "inline";
            if (is_inline) {
                latex_text = `$${latex_text}$`;
            } else {
                latex_text = `$$${latex_text}$$`;
            }

            if (is_replace) {
                let latex_element = document.createElement("span");
                latex_element.textContent = latex_text;
                math_tag.replaceWith(latex_element);
            }
        }
        return element;
    }
    replace_ref_with_content({ element = null, is_replace = false } = {}) {
        if (!element) {
            element = this.element;
        }
        let refs = element.querySelectorAll("a[href^='#bib']");
        let ref_contents = {};
        for (let ref of refs) {
            let ref_id = ref.getAttribute("href").slice(1);
            let ref_element = document.querySelector(`[id='${ref_id}']`);
            if (ref_element) {
                let ref_element_copy = ref_element.cloneNode(true);
                this.replace_math_with_latex({
                    element: ref_element_copy,
                    is_replace: true,
                });
                let ref_text = ref_element_copy.textContent;
                ref_contents[ref_id] = ref_text;
                if (is_replace) {
                    ref.textContent += `<sup>#${ref_id}</sup>`;
                }
            }
        }
        return ref_contents;
    }
    refs_to_str(ref_contents) {
        // ref_contents to list like `- [ref_id]: ref_content`
        let ref_contents_list = Object.keys(ref_contents).map(
            (ref_id) => `- [#${ref_id}]: ${ref_contents[ref_id]}`
        );
        let ref_contents_text =
            "\n\nReferences:\n\n" + ref_contents_list.join("\n\n");
        return ref_contents_text;
    }
    table_to_str(element = null) {
        if (!element) {
            element = this.element;
        }
        while (element.attributes.length > 0) {
            element.removeAttribute(element.attributes[0].name);
        }
        let cells = element.querySelectorAll("*");
        cells.forEach((cell) => {
            while (cell.attributes.length > 0) {
                cell.removeAttribute(cell.attributes[0].name);
            }
            if (!T_TAGS.includes(get_tag(cell))) {
                let text = cell.textContent;
                cell.replaceWith(document.createTextNode(text));
            }
        });
        return element.outerHTML;
    }
    remove_whitespaces(text) {
        let re;
        for (let regex in WHITESPACE_MAP) {
            re = new RegExp(regex, "gm");
            text = text.replace(re, WHITESPACE_MAP[regex]);
        }
        return text;
    }
    get_text({ with_refs = true, keep_table_tag = true } = {}) {
        let element_copy = this.element.cloneNode(true);
        element_copy = this.replace_math_with_latex({
            element: element_copy,
            is_replace: true,
        });
        let ref_contents = this.replace_ref_with_content({
            element: element_copy,
            is_replace: true,
        });

        let text;
        if (get_tag(element_copy) === "table" && keep_table_tag) {
            text = this.table_to_str(element_copy);
        } else {
            text = element_copy.textContent;
        }

        // if ref_contents is not empty, then append ref_contents_text to text
        if (with_refs && Object.keys(ref_contents).length > 0) {
            text = text + this.refs_to_str(ref_contents);
        }
        text = this.remove_whitespaces(text);

        return text;
    }
}

// Export function

function purepage() {
    const selector = new PureElementsSelector();
    let pure_elements = selector.select();
    selector.stylize();
    return pure_elements;
}

function get_element_text(element) {
    let converter = new ElementContentConverter(element);
    return converter.get_text();
}

// ===================== PurePage End ===================== //

// ===================== OpenAI Start ===================== //

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
            let chunk;
            try {
                chunk = json_chunk.choices[0];
            } catch (error) {
                console.log("Failed to parse choices:", error);
                console.log("json_chunk:", json_chunk);
                let error_message = json_chunk.error.message || "Please check console log for details.";
                chunk = {
                    delta: { content: `<mark>API Error: <code>${error_message}</code></mark>` }
                }
            }
            if (on_chunk) {
                content += on_chunk(chunk);
            }
        }
    }
    return content;
}

function get_llm_endpoint() {
    let endpoint_widget = document.getElementById("settings-modal-endpoint");
    return endpoint_widget.value;
}
function get_llm_api_key() {
    let api_key_widget = document.getElementById("settings-modal-api-key");
    return api_key_widget.value;
}
function get_llm_model() {
    let model_widget = document.getElementById("settings-modal-models");
    return model_widget.value;
}

function get_llm_models({ endpoint, api_key } = {}) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: endpoint + "/models",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${api_key}`,
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
    endpoint = get_llm_endpoint(),
    api_key = get_llm_api_key(),
    model = get_llm_model(),
    max_tokens = 4096,
    temperature = 0.5,
    top_p = 0.95,
    stream = true,
} = {}) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "POST",
            url: endpoint + "/chat/completions",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${api_key}`,
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

// ===================== OpenAI End ===================== //

// ===================== AIRead Start ===================== //

const AIREAD_CSS = `
.pure-element img {
    all: initial;
}

.airead-tool-button-group {
    display: block;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.5);
    border: none;
    text-align: right;
    z-index: 1000;
}
.airead-button {
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(128, 128, 128, 0.5);
    box-shadow: 0px 0px 4px gray;
    margin: 0px 0px 4px 0px;
    z-index: 1000;
    font-size: 16px;
}
.airead-button:hover {
    background-color: rgba(128, 255, 128, 0.5);
}

.airead-element-hover {
    border-radius: 4px;
    box-shadow: 0px 0px 4px gray !important;
    background-color: Azure !important;
}
.airead-element-selected {
    border-radius: 4px;
    box-shadow: 0px 0px 4px gray !important;
    background-color: AliceBlue !important;
}
.airead-element-sibling-selected {
    border-radius: 4px;
    box-shadow: 0px 0px 4px gray !important;
    background-color: Bisque !important;
}
.airead-element-group-hover {
    box-shadow: 0px 0px 4px gray !important;
    background-color: Cornsilk !important;
}
@keyframes airead-element-focus {
    0% { background-color: initial; }
    50% { background-color: rgba(128, 255, 128, 0.8); }
    100% { background-color: initial; }
}
.airead-element-focus {
    animation: airead-element-focus 1s ease-in-out 1;
}

.airead-chat-user-input-group {
}

.airead-chat-user-input {
    resize: none;
    border-radius: 4px;
    box-shadow: 0px 0px 4px gray;
    max-height: 300px;
    overflow-y: auto;
}
.airead-chat-user-input-options {
}
.airead-chat-message-assistant {
    th, td {
        padding: 4px;
    }
}
.btn:hover {
    background-color: rgba(64, 128, 64, 0.5);
    scale: 1.1;
}
.airead-chat-user-input-new-chat-btn,
.airead-chat-user-input-hide-btn,
.airead-chat-user-input-summarize-btn,
.airead-chat-user-input-translate-btn,
.airead-chat-user-input-keypoints-btn,
.airead-chat-user-input-option-select-para,
.airead-chat-user-input-option-select-level {
    padding: 0px 4px 0px 4px;
    margin: 0px 8px 0px 0px;
    border-radius: 2px;
    box-shadow: 0px 0px 3px gray;
    font-size: small;
}
.airead-chat-user-input-new-chat-btn,
.airead-chat-user-input-hide-btn {
    border-color: FireBrick;
}
.airead-chat-user-input-option-select-para {
    border-color: teal;
}
.airead-chat-user-input-summarize-btn,
.airead-chat-user-input-translate-btn,
.airead-chat-user-input-keypoints-btn {
    border-color: DodgerBlue;
}
.airead-chat-user-input-option-select-para {
    width: 110px;
}
.airead-chat-user-input-option-select-level {
    width: auto;
    box-shadow: none;
}
.airead-chat-user-input-option-input-short,
.airead-chat-user-input-option-input {
    padding: 0px 0px 0px 0px;
    margin: 0px 4px 0px 4px;
    border-radius: 12px;
    text-align: right;
    font-size: small;
}
.airead-chat-user-input-option-input {
    max-width: 40px;
}
.airead-chat-user-input-option-input-short {
    max-width: 30px;
}
.airead-chat-message-user {
    background-color: rgba(128, 255, 128, 0.1);
    text-align: left;
}
.airead-chat-message-assistant {
    background-color: rgba(180, 180, 255, 0.1);
    text-align: left;
}

.airead-note {
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 4px gray;
    position: absolute;
    z-index: 1000;
}

.airead-tool-panel {
    border: none;
    position: fixed;
    bottom: 50px;
    right: 50px;
    z-index: 1000;
    opacity: 0;
}
.airead-tool-panel:hover {
    opacity: 1;
}
.airead-tool-panel-button {
    border: none;
    background-color: transparent;
    font-size: 32px;
}

.leader-line {
    z-index: 950;
    background-color: transparent;
}

[aria-hidden="true"] {
    display: none;
}

.katex-mathml {
    color: DodgerBlue !important;
}

table, th, td {
    border: 1px solid LightGray;
    border-collapse: collapse;
}
`;

function apply_css() {
    let style_element = document.createElement("style");
    style_element.textContent = AIREAD_CSS;
    document.head.appendChild(style_element);
}

function get_pure_parent(element) {
    let parent = element;
    // get index of element in window.pure_elements
    let element_index = window.pure_elements.indexOf(element);
    // loop the window.pure_elements back from element,
    // until find tag h1~h6(use regex to match), and the tag number should be smaller than element's tag number
    let element_tag = element.tagName;
    for (let i = element_index - 1; i >= 0; i--) {
        let element_i = window.pure_elements[i];
        let element_i_tag = element_i.tagName;
        if (!element_i_tag.match(/H[1-6]/)) continue;
        if (!element_tag.match(/H[1-6]/)) {
            parent = element_i;
            break;
        } else {
            let element_i_tag_number = parseInt(element_i_tag.slice(1));
            let element_tag_number = parseInt(element_tag.slice(1));
            if (element_i_tag_number < element_tag_number) {
                parent = element_i;
                break;
            }
        }
    }
    return parent;
}

function remove_siblings(element) {
    let sibling = element.nextSibling;
    while (sibling) {
        let next_sibling = sibling.nextSibling;
        sibling.remove();
        sibling = next_sibling;
    }
}

function is_header(element) {
    return get_tag(element).match(/H[1-6]/i);
}
function is_item(element) {
    return ITEM_TAGS.includes(get_tag(element));
}
function is_env(element) {
    return ENV_TAGS.includes(get_tag(element));
}
function get_header_level(element) {
    return parseInt(element.tagName.slice(1));
}
function depth_of_li(element) {
    let tag = get_tag(element);
    let depth = 0;
    if (LI_TAGS.includes(tag)) {
        let parents = get_parents(element);
        depth = parents.filter((parent) =>
            LIST_TAGS.includes(get_tag(parent))
        ).length;
    }
    if (DD_TAGS.includes(tag)) {
        let parents = get_parents(element);
        depth = parents.filter((parent) =>
            DEF_TAGS.includes(get_tag(parent))
        ).length;
    }
    return depth;
}

function compare_element_level(element1, element2) {
    // Less level means closer to root.
    // -1: level of element1 < element2
    // +1: level of element1 < element2
    //  0: level of element1 = element2
    let para_tags = ["p", "blockquote"];
    let tag_ranks = [...HEADER_TAGS, para_tags, ENV_TAGS, ITEM_TAGS];

    let tag1 = get_tag(element1);
    let tag2 = get_tag(element2);

    let rank1 = tag_ranks.findIndex((tags) => tags.includes(tag1));
    let rank2 = tag_ranks.findIndex((tags) => tags.includes(tag2));

    // add extra depth for item tags
    if (is_item(element1)) {
        let depth1 = depth_of_li(element1);
        rank1 = rank1 + depth1 - 1;
    }
    if (is_item(element2)) {
        let depth2 = depth_of_li(element2);
        rank2 = rank2 + depth2 - 1;
    }

    // if index is -1, set to HEADER_TAGS.length, which means treat as para_tags
    rank1 = rank1 === -1 ? HEADER_TAGS.length : rank1;
    rank2 = rank2 === -1 ? HEADER_TAGS.length : rank2;
    return rank1 - rank2;
}
function set_pure_element_levels() {
    let level;
    let prev_level;
    let prev_element = null;
    for (let element of window.pure_elements) {
        if (!prev_element) {
            if (is_header(element)) {
                level = get_header_level(element) - 1;
            } else {
                level = 1;
            }
        } else {
            if (is_header(element)) {
                level = get_header_level(element) - 1;
                if (level < prev_level) {
                    level = Math.min(prev_level + 1, level);
                }
            } else {
                let level_diff = compare_element_level(element, prev_element);
                level = level + level_diff;
            }
        }
        element.setAttribute("airead-level", level);
        prev_level = level;
        prev_element = element;
    }
}
function set_pure_element_rel_levels() {
    let element;
    let prev_element;
    let level = 0;
    for (let i = 0; i < window.pure_elements.length; i++) {
        element = window.pure_elements[i];
        if (is_header(element)) {
            level = get_header_level(element) - 1;

            // Following codes are handling the case
            //   that the diff of adjacent increasing headers is greater than 1
            // for example, in ar5iv.org,
            //   tag of `Abstract` is `h6`, but it is directly after title (`h1`) (level=0)
            //   so the "correct" rel level of `Abstract` should be 1.5
            // The additional 0.5 is to distinguish `Abstract` from normal `h2` headers\
            //   (such as `Introduction` or `Background`)
            let prev_header_element = null;
            for (let j = i - 1; j >= 0; j--) {
                prev_header_element = window.pure_elements[j];
                if (is_header(prev_header_element)) {
                    break;
                }
            }
            if (prev_header_element) {
                let pre_header_rel_level = parseFloat(
                    prev_header_element.getAttribute("airead-level-rel")
                );
                let pre_header_abs_level = parseFloat(
                    prev_header_element.getAttribute("airead-level")
                );
                if (level - pre_header_abs_level > 1) {
                    level = pre_header_rel_level + 1.5;
                } else if (level < pre_header_abs_level) {
                } else {
                    level = pre_header_rel_level + level - pre_header_abs_level;
                }
            }
        } else {
            if (i === 0) {
                level = 1;
            } else {
                prev_element = window.pure_elements[i - 1];
                if (is_header(prev_element)) {
                    level =
                        parseFloat(prev_element.getAttribute("airead-level-rel")) + 0.5;
                    if (is_item(element) || is_env(element)) {
                        level += 1;
                    }
                } else {
                    let level_diff = compare_element_level(element, prev_element);
                    level += Math.sign(level_diff);
                }
            }
        }
        element.setAttribute("airead-level-rel", level);
    }
}

function get_parents_by_depth({
    element,
    element_list = window.pure_elements,
    depth = 0,
    stop_at_first_non_li_for_li = true,
    stop_when_deeper = true,
    stop_at_first_top_parent = true,
    tolerant_depth = 1,
} = {}) {
    let parents = [];
    let element_index = element_list.indexOf(element);
    let element_rel_level = parseFloat(element.getAttribute("airead-level-rel"));
    let tag = get_tag(element);
    for (let i = element_index - 1; i >= 0; i--) {
        let sibling = element_list[i];
        let sibling_rel_level = parseFloat(
            sibling.getAttribute("airead-level-rel")
        );
        // Example:
        //   if element_level is 6, and depth is 1,
        //   then sibling_level should be 5 or 6.
        // Since this function is to get parents,
        //   this is required by default: element_level >= sibling_level;
        // and if stop_at_first_non_li_for_li is true
        //   then it would stop at first non-li parent for li element,
        //   this is to make the result cleaner
        let level_diff = element_rel_level - sibling_rel_level;
        if (level_diff > depth) {
            // this parent is too high, stop
            break;
        } else if (level_diff + tolerant_depth < 0) {
            // this sibling is too deep, but still not reach the top parent, continue
            // tolerant_depth means allowed depth diff that sibling is greater than element
            if (stop_when_deeper) {
                break;
            } else {
                continue;
            }
        } else {
            parents.push(sibling);

            if (stop_at_first_top_parent && level_diff === depth) {
                break;
            }

            if (
                stop_at_first_non_li_for_li &&
                is_item(element) &&
                !is_item(sibling) &&
                level_diff === depth
            ) {
                break;
            }
        }
    }
    parents.reverse();
    // console.log(`depth ${depth} parents:`, parents.length);
    return parents;
}

function get_children_by_depth({
    element,
    element_list = window.pure_elements,
    depth = 0,
    include_same_depth = true,
} = {}) {
    let children = [];
    let element_index = element_list.indexOf(element);
    let element_rel_level = parseFloat(element.getAttribute("airead-level-rel"));
    for (let i = element_index + 1; i < element_list.length; i++) {
        let sibling = element_list[i];
        let sibling_rel_level = parseFloat(
            sibling.getAttribute("airead-level-rel")
        );

        // Example:
        //   if element_level is 6, and depth is 1,
        //   then sibling_level should be in [5,6]
        // Since this function is to get children,
        //   this is required by default: sibling_rel_level >= element_rel_level
        // and if include_same_depth is false,
        //   then must be: sibling_rel_level > element_rel_level
        let level_diff = sibling_rel_level - element_rel_level;

        if (level_diff < 0 || (level_diff === 0 && !include_same_depth)) {
            break;
        } else if (level_diff > depth) {
            continue;
        } else {
            children.push(sibling);
        }
    }

    // console.log(`depth ${depth} children:`, children.length);
    return children;
}

function get_all_airead_elements() {
    let elements = document.querySelectorAll(".pure-element");
    return elements;
}

function get_auto_more_siblings({
    element,
    depth = 1.5,
    return_parts = false,
} = {}) {
    let siblings = [];

    let parent_depth;
    if (is_item(element) || is_env(element)) {
        parent_depth = 1.5;
    } else if (is_header(element)) {
        parent_depth = 1;
    } else {
        parent_depth = 0.5;
    }
    let parent_siblings = get_parents_by_depth({
        element: element,
        depth: parent_depth,
        stop_at_first_non_li_for_li: true,
        tolerant_depth: 1,
    });

    let children_siblings;

    if (is_header(element)) {
        children_siblings = get_children_by_depth({
            element: element,
            depth: depth,
            include_same_depth: false,
        });
    } else {
        children_siblings = get_children_by_depth({
            element: element,
            depth: depth,
            include_same_depth: true,
        });
    }
    if (return_parts) {
        return [parent_siblings, children_siblings];
    } else {
        siblings = [...parent_siblings, ...children_siblings];
        return siblings;
    }
}

function get_more_siblings({
    element,
    para_options = "auto_more_paras",
    return_parts = false,
} = {}) {
    if (para_options === "auto_more_paras") {
        return get_auto_more_siblings({
            element: element,
            return_parts: return_parts,
        });
    } else {
        if (return_parts) {
            return [[], []];
        } else {
            return [];
        }
    }
}

function draw_leader_line(element1, element2) {
    let leader_line = new LeaderLine(element1, element2, {
        startSocket: "right",
        endSocket: "right",
        path: "grid",
        size: 3,
        color: "LightSalmon",
    });
    return leader_line;
}
function remove_leader_lines() {
    let lines = document.querySelectorAll("svg.leader-line");
    for (let line of lines) {
        line.remove();
    }
}
function add_element_idx_to_sibling_highlight_idxs(element, sibling) {
    let highlight_idxs = JSON.parse(sibling.dataset.highlightByElementIdxs);
    highlight_idxs.push(element.dataset.idx);
    sibling.dataset.highlightByElementIdxs = JSON.stringify(highlight_idxs);
}
function remove_element_idx_from_sibling_highlight_idxs(element, sibling) {
    let highlight_idxs = JSON.parse(sibling.dataset.highlightByElementIdxs);
    highlight_idxs = highlight_idxs.filter((idx) => idx !== element.dataset.idx);
    sibling.dataset.highlightByElementIdxs = JSON.stringify(highlight_idxs);
}
function length_of_sibling_highlight_idxs(sibling) {
    return JSON.parse(sibling.dataset.highlightByElementIdxs).length;
}
function highlight_siblings({ element, siblings = [] } = {}) {
    for (let sibling of siblings) {
        sibling.classList.add("airead-element-sibling-selected");
        add_element_idx_to_sibling_highlight_idxs(element, sibling);
    }
    try {
        draw_leader_line(element, siblings[0]);
        draw_leader_line(element, siblings[siblings.length - 1]);
    } catch (error) {
        console.warn(error);
    }
    element.classList.add("airead-element-selected");
}
function de_highlight_siblings({ element, siblings = [] } = {}) {
    for (let sibling of siblings) {
        remove_element_idx_from_sibling_highlight_idxs(element, sibling);
        if (length_of_sibling_highlight_idxs(sibling) === 0) {
            sibling.classList.remove("airead-element-sibling-selected");
        }
    }
    element.classList.remove("airead-element-selected");
    remove_leader_lines();
}
function de_highlight_all_siblings({ element } = {}) {
    let highlighted_siblings = document.querySelectorAll(".airead-element-sibling-selected");
    for (let sibling of highlighted_siblings) {
        remove_element_idx_from_sibling_highlight_idxs(element, sibling);
        if (length_of_sibling_highlight_idxs(sibling) === 0) {
            sibling.classList.remove("airead-element-sibling-selected");
        }
    }
    remove_leader_lines();
}

function hide_chat_user_input_group({ element, chat_button = null } = {}) {
    // hide chat_user_input_group
    let chat_user_input_group = element.parentNode.querySelector(
        ".airead-chat-user-input-group"
    );
    chat_user_input_group.style.display = "none";
    // hide all elements with class starts with "airead-chat-message"
    let chat_messages = element.parentNode.querySelectorAll(
        "[class^='airead-chat-message']"
    );
    for (let chat_message of chat_messages) {
        chat_message.style.display = "none";
    }
    chat_button.innerHTML = "Chat";
    de_highlight_all_siblings({ element: element });
}

function md2html(text) {
    let converted_text;
    try {
        let converter = new showdown.Converter({
            simpleLineBreaks: false,
            tables: true,
            underline: true,
            extensions: [
                showdownKatex({
                    displayMode: false,
                    delimiters: [
                        { left: "$", right: "$", display: false },
                        { left: "$$", right: "$$", display: true },
                    ],
                }),
            ],
        });
        converter.setFlavor("github");
        converted_text = converter.makeHtml(text);
    } catch (error) {
        console.warn(error);
        converted_text = text;
    }
    return converted_text;
}

class ChatUserInput {
    constructor() {
        this.last_assistant_chat_message_element = null;
        this.on_chunk = this.on_chunk.bind(this);
    }
    construct_html() {
        let html = `
            <div class="my-2 row no-gutters airead-chat-user-input-group">
                <div class="airead-chat-user-input-options">
                    <div class="col px-0 pb-2 d-flex align-items-left">
                        <button class="btn airead-chat-user-input-summarize-btn">总结</button>
                        <button class="btn airead-chat-user-input-translate-btn">翻译</button>
                        <button class="btn airead-chat-user-input-keypoints-btn">要点</button>
                        <span><select class="form-control airead-chat-user-input-option-select-para" title="Select specific paragraphs as context">
                            <option value="auto_more_paras" selected="selected">自动选取上下文</option>
                            <option value="only_this_para">仅选取当前段落</option>
                            <option value="all_paras">全选</option>
                        </select></span>
                        <button class="btn airead-chat-user-input-new-chat-btn">清空对话</button>
                        <button class="btn airead-chat-user-input-hide-btn">隐藏</button>
                    </div>
                </div>
                <div class="col-auto px-0">
                    <textarea class="form-control airead-chat-user-input" rows="1"
                        placeholder="Ask about this paragraph ..."></textarea>
                </div>
            </div>
        `;
        return html;
    }
    get_current_pure_element() {
        let current_pure_element =
            this.user_input_group.parentNode.querySelector(".pure-element");
        return current_pure_element;
    }
    get_last_assistant_chat_message_element() {
        let last_assistant_chat_message_element = null;
        let chat_messages = this.user_input_group.parentNode.querySelectorAll(
            ".airead-chat-message-assistant"
        );
        if (chat_messages.length > 0) {
            last_assistant_chat_message_element =
                chat_messages[chat_messages.length - 1];
        }
        return last_assistant_chat_message_element;
    }
    get_history_chat_messages() {
        let chat_message_elements = this.user_input_group.parentNode.querySelectorAll(
            ".airead-chat-message-user, .airead-chat-message-assistant"
        );
        let chat_messages = [];
        for (let chat_message_element of chat_message_elements) {
            let role = chat_message_element.classList.contains(
                "airead-chat-message-user"
            )
                ? "user"
                : "assistant";
            let content = chat_message_element.dataset.content || "";
            if (content) {
                chat_messages.push({ role: role, content: content });
            }
        }
        return chat_messages;
    }
    update_last_assistant_chat_message_element(delta_content) {
        let element = this.last_assistant_chat_message_element;
        let last_content = element.dataset.content || "";
        element.dataset.content = last_content + delta_content;
        element.innerHTML = md2html(element.dataset.content);
    }
    on_chunk(chunk) {
        let delta = chunk.delta;
        if (delta.role) {
            // console.log("role:", delta.role);
        }
        if (delta.content) {
            this.update_last_assistant_chat_message_element(delta.content);
            return delta.content;
        }
        if (chunk.finish_reason === "stop") {
            console.log("[Finished]");
        }
        return "";
    }
    get_selected_elements_context() {
        let element = this.get_current_pure_element();
        let para_options_select = this.user_input_group.querySelector("select");
        let selected_elements;
        if (para_options_select.value === "all_paras") {
            selected_elements = get_all_airead_elements();
        } else {
            let parents_and_children_siblings = get_more_siblings({
                element: this.get_current_pure_element(),
                para_options: para_options_select.value,
                return_parts: true,
            });
            let parent_siblings = parents_and_children_siblings[0];
            let children_siblings = parents_and_children_siblings[1];
            selected_elements = [...parent_siblings, element, ...children_siblings];
        }
        let context = "";
        for (let selected_element of selected_elements) {
            let element_text = get_element_text(selected_element);
            context += element_text + "\n\n";
        }
        return context;
    }
    bind_new_chat_btn() {
        let self = this;
        let new_chat_button = this.user_input_group.querySelector(
            ".airead-chat-user-input-new-chat-btn"
        );
        new_chat_button.addEventListener("click", function () {
            // remove all previous user and assistant chat messages
            let chat_messages = self.user_input_group.parentNode.querySelectorAll(
                ".airead-chat-message-user, .airead-chat-message-assistant"
            );
            for (let chat_message of chat_messages) {
                chat_message.remove();
            }
        });
    }
    bind_hide_btn() {
        let self = this;
        let hide_button = this.user_input_group.querySelector(
            ".airead-chat-user-input-hide-btn"
        );
        let chat_button = this.user_input_group.parentNode.querySelector(
            ".airead-button"
        );
        hide_button.addEventListener("click", function () {
            hide_chat_user_input_group({
                element: self.get_current_pure_element(),
                chat_button: chat_button
            });
        });
    }
    bind_options() {
        let self = this;
        let element = self.get_current_pure_element();
        function add_option_html(para_options_select) {
            if (para_options_select.value === "manual_paras") {
                let more_para_select_option_html = `&nbsp;:&nbsp;
                <select class="form-control airead-chat-user-input-option-select-level" title="Select paragraphs by previous count or parent level">
                    <option value="parent_level">parent level</option>
                    <option value="prev_num">prev count</option>
                </select>
                <input type="number" class="form-control airead-chat-user-input-option-input" min="-1" max="10" step="1" value="-1">
                <select class="form-control airead-chat-user-input-option-select-level" title="Select paragraphs by next count or child level">
                <option value="children_level">child level</option>
                <option value="next_num">next count</option>
                </select>
                <input type="number" class="form-control airead-chat-user-input-option-input" min="-1" max="10" step="1" value="-1">;`;
                para_options_select.insertAdjacentHTML(
                    "afterend",
                    more_para_select_option_html
                );
            } else if (para_options_select.value === "all_paras") {
                remove_siblings(para_options_select);
                remove_leader_lines();
                let siblings = get_all_airead_elements();
                highlight_siblings({
                    element: element,
                    siblings: siblings,
                });
            } else if (para_options_select.value === "auto_more_paras") {
                remove_siblings(para_options_select);
                de_highlight_all_siblings({
                    element: element
                });
                let siblings = get_more_siblings({
                    element: element,
                    para_options: "auto_more_paras",
                });
                highlight_siblings({
                    element: element,
                    siblings: siblings,
                });
            } else if (para_options_select.value === "only_this_para") {
                remove_siblings(para_options_select);
                de_highlight_all_siblings({
                    element: element
                });
            } else {
                remove_siblings(para_options_select);
            }
        }
        let para_options_select = self.user_input_group.querySelector("select");
        add_option_html(para_options_select);
        para_options_select.addEventListener("change", function () {
            add_option_html(this);
        });
    }
    submit_user_input({
        user_input_content = "",
        user_input = null,
        trigger = "user_input",
        parent_element = null
    } = {}) {
        let self = this;
        let user_chat_message = new UserChatMessageElement({
            role: "user",
            content: user_input_content,
        });
        self.user_chat_message_element =
            user_chat_message.spawn(parent_element);

        if (trigger === "user_input") {
            user_input.style.height = "auto";
            // let prompt = user_input.value;
            user_input.value = "";
        }

        let assistant_chat_message = new AssistantChatMessageElement({
            role: "assistant",
            content: "",
        });
        self.last_assistant_chat_message_element =
            assistant_chat_message.spawn(parent_element);
        let context = self.get_selected_elements_context();
        let context_message = {
            role: "user",
            content: `请根据下面的文本，回答用户的问题或指令:\n=====\n${context}\n=====\n`,
        };
        let messages = [
            context_message,
            ...self.get_history_chat_messages(),
        ];
        console.log(messages);
        console.log(self.last_assistant_chat_message_element);
        chat_completions({
            messages: messages,
            model: get_llm_model(),
            stream: true,
        }).then((response) => {
            process_stream_response(response, self.on_chunk).then((content) => {
                console.log(content);
            });
        });
    }
    bind_user_input(parent_element) {
        let self = this;
        let user_input = this.user_input_group.querySelector("textarea");
        user_input.addEventListener(
            "input",
            function () {
                this.style.height = 0;
                this.style.height = this.scrollHeight + 3 + "px";
            },
            false
        );
        user_input.addEventListener("keypress", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                self.submit_user_input({
                    user_input_content: user_input.value,
                    user_input: user_input,
                    trigger: "user_input",
                    parent_element: parent_element,
                });
            }
        });
    }
    bind_preprompt_buttons(parent_element) {
        let self = this;
        let button_configs = [
            {
                "name": "translate",
                "class": "airead-chat-user-input-translate-btn",
                "prompt": "翻译"
            },
            {
                "name": "summarize",
                "class": "airead-chat-user-input-summarize-btn",
                "prompt": "总结"
            },
            {
                "name": "keypoints",
                "class": "airead-chat-user-input-keypoints-btn",
                "prompt": "提炼要点"
            },
        ]
        for (let button_config of button_configs) {
            let button = this.user_input_group.querySelector(
                `.${button_config.class}`
            );
            button.addEventListener("click", function () {
                self.submit_user_input({
                    user_input_content: button_config.prompt,
                    trigger: button_config.name,
                    parent_element: parent_element,
                });
            });
        }
    }
    spawn(parent_element) {
        this.user_input_group = document.createElement("div");
        this.user_input_group.innerHTML = this.construct_html().trim();
        this.user_input_group = this.user_input_group.firstChild;
        parent_element.parentNode.appendChild(this.user_input_group);
        this.bind_new_chat_btn();
        this.bind_hide_btn();
        this.bind_user_input(parent_element);
        this.bind_preprompt_buttons(parent_element);
        this.bind_options();
        return this.user_input_group;
    }
}

class UserChatMessageElement {
    constructor({ role = "user", content = "" } = {}) {
        this.role = role;
        this.content = content;
    }
    construct_html() {
        let html = `<p></p>`;
        return html;
    }
    spawn(parent_element) {
        this.message_element = document.createElement("p");
        let user_input_group = parent_element.parentNode.querySelector(
            ".airead-chat-user-input-group"
        );
        parent_element.parentNode.insertBefore(
            this.message_element,
            user_input_group
        );
        this.message_element.classList.add(`airead-chat-message-${this.role}`);
        this.message_element.textContent = this.content;
        this.message_element.dataset.content = this.content;
        return this.message_element;
    }
}

class AssistantChatMessageElement {
    constructor({ role = "assistant", content = "" } = {}) {
        this.role = role;
        this.content = content;
    }
    construct_html() {
        let html = `<p></p>`;
        return html;
    }
    spawn(parent_element) {
        this.message_element = document.createElement("p");
        let user_input_group = parent_element.parentNode.querySelector(
            ".airead-chat-user-input-group"
        );
        parent_element.parentNode.insertBefore(
            this.message_element,
            user_input_group
        );
        this.message_element.classList.add(`airead-chat-message-${this.role}`);
        this.message_element.textContent = this.content;
        return this.message_element;
    }
}

window.hovering_element = null;
window.hovering_chat_user_input_group = null;
function add_container_to_element(element, tool_button_group) {
    let container = document.createElement("airead-container");
    element.parentNode.replaceChild(container, element);
    container.appendChild(element);
    container.addEventListener("mouseenter", (event) => {
        if (window.hovering_element !== element) {
            window.hovering_element?.classList.remove("airead-element-hover");
            window.hovering_element = element;
            element.classList.add("airead-element-hover");
            tool_button_group.attach_to_element(element);
        }
    });
    container.addEventListener("mouseleave", (event) => { });
    return container;
}

class NoteElement {
    constructor() { }
    spawn(element) {
        let note_element = document.createElement("div");
        element.parentNode.appendChild(note_element);
        this.element.classList.add("airead-note");
    }
    stylize_note() {
        let note_left = element.offsetLeft - button.offsetWidth + 4;
        let note_top = element.offsetTop;
        this.element.style.right = `${note_left}px`;
        this.element.style.top = `${note_top}px`;
    }
}

class ToolButtonGroup {
    constructor() {
        this.create_button_group();
    }
    create_button(button_text, on_click_func) {
        let button = document.createElement("button");
        button.innerHTML = button_text;
        button.classList.add("airead-button");
        this.button_group.appendChild(button);
        this.button_group.appendChild(document.createElement("br"));
        button.addEventListener("click", on_click_func);
        return button;
    }
    create_button_group() {
        this.button_group = document.createElement("div");
        this.button_group.id = "airead-tool-button-group";
        this.button_group.classList.add("airead-tool-button-group");
        this.chat_button = this.create_button("Chat", () => { });
        // this.copy_button = this.create_button("Print", () => {});
        // this.parent_button = this.create_button("Parent", () => {});

        document.body.prepend(this.button_group);

        let max_width = 0;
        for (let i = 0; i < this.button_group.children.length; i++) {
            let button = this.button_group.children[i];
            if (button.offsetWidth > max_width) {
                max_width = button.offsetWidth;
            }
        }
        this.button_group.style.width = `${max_width}px`;
    }
    stylize_button_group(element) {
        // extract from body if button_group is child of body, then append to element.parentNode
        if (this.button_group.parentNode !== element.parentNode) {
            this.button_group.parentNode.removeChild(this.button_group);
            // insert this.button_group just after element
            element.parentNode.insertBefore(this.button_group, element.nextSibling);
        }
        const update_button_group_position = () => {
            let button_group_left =
                element.offsetLeft - this.button_group.offsetWidth - 4;
            let button_group_top = element.offsetTop;
            this.button_group.style.left = `${button_group_left}px`;
            this.button_group.style.top = `${button_group_top}px`;
        };
        update_button_group_position();
        window.addEventListener("resize", update_button_group_position);
    }
    bind_buttons_func_to_element(element) {
        // find in children of element.parentNode,
        // if any chat_user_input_group and display not "none", set chat_button text to "Hide"
        // else set to "Chat"
        let chat_user_input_groups = element.parentNode.querySelectorAll(
            ".airead-chat-user-input-group"
        );
        let chat_button_text = "Chat";
        for (let chat_user_input_group of chat_user_input_groups) {
            if (chat_user_input_group.style.display !== "none") {
                chat_button_text = "Hide";
                break;
            }
        }
        this.chat_button.innerHTML = chat_button_text;

        this.chat_button.onclick = () => {
            let chat_button_text = this.chat_button.innerHTML.toLowerCase();
            let para_options_select = element.parentNode.querySelector(
                ".airead-chat-user-input-option-select-para"
            );
            if (chat_button_text === "chat") {
                // create new ChatUserInput if last sibling of element is not user_input
                let last_child = element.parentNode.lastChild;
                let no_user_input_exists = !last_child.classList.contains(
                    "airead-chat-user-input-group"
                );
                if (no_user_input_exists) {
                    let chat_user_input_instance = new ChatUserInput();
                    let chat_user_group = chat_user_input_instance.spawn(element);
                }
                element.parentNode.lastChild.style.display = "block";
                let chat_messages = element.parentNode.querySelectorAll(
                    "[class^='airead-chat-message']"
                );
                for (let chat_message of chat_messages) {
                    chat_message.style.display = "block";
                }
                this.chat_button.innerHTML = "Hide";
                if (para_options_select) {
                    let siblings = get_more_siblings({
                        element: element,
                        para_options: "auto_more_paras",
                    });
                    highlight_siblings({
                        element: element,
                        siblings: siblings,
                    });
                }
            } else if (chat_button_text === "hide") {
                hide_chat_user_input_group({ element: element, chat_button: this.chat_button });
            } else {
            }
        };
        // this.copy_button.onclick = () => {
        //     console.log("Print:", get_element_text(element));
        // };
        // this.parent_button.onclick = () => {
        //     let pure_parent = get_pure_parent(element);
        //     // focus on the parent
        //     pure_parent.focus();
        //     pure_parent.scrollIntoView({ behavior: "smooth", block: "start" });
        //     pure_parent.classList.add("airead-element-focus");
        //     setTimeout(() => {
        //         pure_parent.classList.remove("airead-element-focus");
        //     }, 1500);
        //     console.log("Goto Parent:", pure_parent, "of:", element);
        // };
    }
    attach_to_element(element = null) {
        if (element) {
            this.stylize_button_group(element);
            this.bind_buttons_func_to_element(element);
        }
    }
}

// ===================== AIRead End ===================== //

// ===================== Widgets Start ===================== //

class RangeNumberWidget {
    constructor({
        id = null,
        label_text = null,
        default_val = null,
        min_val = null,
        max_val = null,
        step_val = null,
        range_col = 8,
        number_col = 4,
    } = {}) {
        this.id = id;
        this.label_text = label_text;
        this.default_val = default_val;
        this.min_val = min_val;
        this.max_val = max_val;
        this.step_val = step_val;
        this.range_col = range_col;
        this.number_col = number_col;
    }
    spawn_in_parent(parent) {
        this.create_widget();
        this.bind_update_functions();
        this.append_to_parent(parent);
    }
    remove() {
        this.widget.remove();
    }
    create_widget() {
        this.widget_html = `
        <label class="col-form-label">${this.label_text}</label>
            <div class="col-sm-${this.range_col} d-flex align-items-center">
                <input id="${this.id}-range"
                    type="range" value="${this.default_val}"
                    min="${this.min_val}" max="${this.max_val}" step="${this.step_val}"
                    class="form-range"
                />
            </div>
            <div class="col-sm-${this.number_col}">
                <input id="${this.id}-number"
                    type="number" value="${this.default_val}"
                    min="${this.min_val}" max="${this.max_val}" step="${this.step_val}"
                    class="form-control"
            />
        </div>`;
        this.widget = $(this.widget_html);
    }
    update_number_widget_value(value) {
        $(`#${this.id}-number`).val(value);
    }
    update_range_widget_value(value) {
        $(`#${this.id}-range`).val(value);
    }
    bind_update_functions() {
        let self = this;
        this.widget.find(`#${this.id}-range`).on("input", function () {
            self.update_number_widget_value($(this).val());
        });
        this.widget.find(`#${this.id}-number`).on("input", function () {
            self.update_range_widget_value($(this).val());
        });
    }
    append_to_parent(parent) {
        parent.append(this.widget);
    }
}

class SettingsModal {
    constructor({ id = "settings-modal" } = {}) {
        this.id = id;
        this.endpoint_id = `${this.id}-endpoint`;
        this.api_key_id = `${this.id}-api-key`;
        this.models_id = `${this.id}-models`;
        this.temperature_id = `${this.id}-temperature`;
        this.top_p_id = `${this.id}-top-p`;
        this.max_output_tokens_id = `${this.id}-max-output-tokens`;
        this.system_prompt_id = `${this.id}-system-prompt`;
        this.save_button_id = `${this.id}-save-button`;
        this.default_button_id = `${this.id}-default-button`;
        this.close_button_id = `${this.id}-close-button`;
    }
    spawn() {
        this.create_widget();
        this.append_to_body();
    }
    show() {
        $(`#${this.id}`).modal("show");
    }
    remove() {
        this.widget.remove();
    }
    create_temperature_widget() {
        this.temperature_widget = new RangeNumberWidget({
            id: this.temperature_id,
            label_text: "Temperature",
            default_val: 0.5,
            min_val: 0,
            max_val: 1,
            step_val: 0.1,
        });
        let temperature_widget_parent = this.widget.find(`#${this.temperature_id}`);
        this.temperature_widget.spawn_in_parent(temperature_widget_parent);
    }
    create_top_p_widget() {
        this.top_p_widget = new RangeNumberWidget({
            id: this.top_p_id,
            label_text: "Top P",
            default_val: 0.9,
            min_val: 0.0,
            max_val: 1.0,
            step_val: 0.01,
        });
        let top_p_widget_parent = this.widget.find(`#${this.top_p_id}`);
        this.top_p_widget.spawn_in_parent(top_p_widget_parent);
    }
    create_max_output_tokens_widget() {
        this.max_output_tokens_widget = new RangeNumberWidget({
            id: this.max_output_tokens_id,
            label_text: "Max Output Tokens",
            default_val: 4096,
            min_val: 1,
            max_val: 32768,
            step_val: 1,
        });
        let max_output_tokens_widget_parent = this.widget.find(
            `#${this.max_output_tokens_id}`
        );
        this.max_output_tokens_widget.spawn_in_parent(
            max_output_tokens_widget_parent
        );
    }
    init_endpoint_and_api_key() {
        Promise.all([
            GM.getValue("airead_llm_endpoint", "").then((endpoint) => {
                if (!endpoint) {
                    this.show();
                }
                $(`#${this.endpoint_id}`).val(endpoint);
            }),
            GM.getValue("airead_llm_api_key", "").then((api_key) => {
                if (!api_key) {
                    this.show();
                }
                $(`#${this.api_key_id}`).val(api_key);
            }),
        ]).then(() => {
            this.init_models_select();
        });
    }
    init_models_select() {
        let endpoint = $(`#${this.endpoint_id}`).val();
        let api_key = $(`#${this.api_key_id}`).val();
        let self = this;
        if (endpoint) {
            get_llm_models({ endpoint: endpoint, api_key: api_key }).then(
                (models) => {
                    let models_select = $(`#${this.models_id}`);
                    models_select.empty();
                    for (let model of models) {
                        let option = new Option(model, model);
                        models_select.append(option);
                    }
                    GM.getValue("airead_llm_model", "").then((gm_model) => {
                        self.set_model_select(gm_model);
                        console.log(`init airead_llm_model: ${models_select.val()}`);
                    });
                }
            );
        }
    }
    set_model_select(model_val = null) {
        let models_select = $(`#${this.models_id}`);
        let models = models_select.children().map(function () {
            return $(this).val();
        });

        if (Array.from(models).includes(model_val)) {
            models_select.val(model_val);
        } else {
            models_select.val(models[0]);
        }
    }
    reset_endpoint_and_api_key() {
        GM.setValue("airead_llm_endpoint", "").then(() => {
            $(`#${this.endpoint_id}`).val("");
            console.log(`reset airead_llm_endpoint :${""}`);
        });
        GM.setValue("airead_llm_api_key", "").then(() => {
            $(`#${this.api_key_id}`).val("");
            console.log(`reset airead_llm_api_key :${""}`);
        });
    }
    reset_model_select() {
        GM.setValue("airead_llm_model", "").then(() => {
            this.set_model_select("");
            console.log(`reset airead_llm_model :${""}`);
        });
    }
    save_endpoint_and_api_key() {
        let endpoint = $(`#${this.endpoint_id}`).val();
        let api_key = $(`#${this.api_key_id}`).val();
        Promise.all([
            GM.setValue("airead_llm_endpoint", endpoint),
            console.log(`save airead_llm_endpoint :${endpoint}`),
            GM.setValue("airead_llm_api_key", api_key),
            console.log(`save airead_llm_api_key :${api_key}`),
        ]).then(() => { });
    }
    save_model() {
        let model = $(`#${this.models_id}`).val();
        if (!model) {
            get_llm_models(
                {
                    endpoint: $(`#${this.endpoint_id}`).val(),
                    api_key: $(`#${this.api_key_id}`).val(),
                }
            ).then((models) => {
                model = models[0];
                GM.setValue("airead_llm_model", model).then(() => {
                    console.log(`save airead_llm_model :${model}`);
                });
                this.init_models_select();
            });
        }
        GM.setValue("airead_llm_model", model).then(() => {
            console.log(`save airead_llm_model :${model}`);
        });
    }
    bind_buttons() {
        let self = this;
        let default_button = this.widget.find(`#${this.default_button_id}`);
        default_button.on("click", function () {
            self.reset_endpoint_and_api_key();
            self.reset_model_select();
        });
        let save_button = this.widget.find(`#${this.save_button_id}`);
        save_button.on("click", function () {
            self.save_endpoint_and_api_key();
            self.save_model();
        });
    }
    create_widget() {
        this.widget_html = `
        <div id="${this.id}" data-bs-backdrop="static" class="modal" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Settings</h5>
                        <button class="btn" data-bs-dismiss="modal">❌</button>
                    </div>
                    <div class="modal-body">
                        <!-- Endpoint -->
                        <div class="form-floating mb-2">
                            <input id="${this.endpoint_id}" class="form-control" type="text"/>
                            <label class="form-label">Endpoint</label>
                        </div>
                        <!-- API Key -->
                        <div class="form-floating mb-2">
                            <input id="${this.api_key_id}" class="form-control" type="text"/>
                            <label class="form-label">API Key</label>
                        </div>
                        <!-- Models -->
                        <div class="form-floating mb-2">
                            <select class="form-select" id="${this.models_id}"></select>
                            <label class="form-label">Models</label>
                        </div>
                        <!-- system prompt -->
                        <div class="form-floating mb-2">
                            <textarea id="${this.system_prompt_id}" class="form-control" rows="3"></textarea>
                            <label>System Prompt</label>
                        </div>
                        <a class="btn mx-0 px-0" data-bs-toggle="collapse" href="#new-agent-advanced-settings">
                            <b>Advanced Settings ↓</b>
                        </a>
                        <div class="collapse" id="new-agent-advanced-settings">
                            <!-- temperature -->
                            <div id="${this.temperature_id}" class="row mb-0"">
                            </div>
                            <!-- top_p -->
                            <div id="${this.top_p_id}" class="row mb-0"">
                            </div>
                            <!-- max output tokens -->
                            <div id="${this.max_output_tokens_id}" class="row mb-2">
                            </div>
                            <!-- max history messages token -->
                        </div>
                    </div>
                    <div class="modal-footer justify-content-end">
                        <button id="${this.save_button_id}" class="btn btn-success">Save</button>
                        <button id="${this.default_button_id}" class="btn btn-primary">Default</button>
                        <button id="${this.close_button_id}" class="btn btn-secondary"
                            data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        this.widget = $(this.widget_html);
        this.create_temperature_widget();
        this.create_top_p_widget();
        this.create_max_output_tokens_widget();
        this.init_endpoint_and_api_key();
        this.bind_buttons();
    }
    append_to_body() {
        $("body").append(this.widget);
        document.getElementById(`${this.system_prompt_id}`).addEventListener(
            "input",
            function () {
                this.style.height = 0;
                this.style.height = this.scrollHeight + 3 + "px";
            },
            false
        );
        $(`#${this.system_prompt_id}`)
            .css("resize", "none")
            .css("max-height", "200px");
    }
}

class ToolPanel {
    constructor() {
        this.create_panel();
        this.create_modal();
    }
    construct_html() {
        let html = `
            <div class="airead-tool-panel">
                <button class="airead-tool-panel-button">⚙️</button>
            </div>
        `;
        return html;
    }
    create_panel() {
        // create a panel which is sticky to the right bottom of the window
        // the icon of the panel is a chat icon
        this.panel = document.createElement("div");
        this.panel.innerHTML = this.construct_html().trim();
        this.panel = this.panel.firstChild;
        document.body.appendChild(this.panel);
        // bind function to panel button
        this.panel_button = this.panel.querySelector(".airead-tool-panel-button");
        let self = this;
        this.panel_button.onclick = () => {
            $(`#${self.settings_modal_id}`).modal("show");
        };
    }
    construct_endpoint_and_api_key_item_html() {
        let html = `
            <div class="row mt-2 no-gutters">
                <div class="col pl-0">
                    <input class="form-control endpoint-input" rows="1"
                        placeholder="Input Endpoint URL, don't add /v1"
                    ></input>
                </div>
                <div class="col pl-0">
                    <input class="form-control api-key-input" rows="1"
                        placeholder="Input API Key, then click ✔️"
                    ></input>
                </div>
                <div class="col-auto px-0">
                    <button class="btn submit-endpoint-button">✔️</button>
                </div>
            </div>
        `;
        return html;
    }
    create_modal() {
        this.settings_modal_id = "settings-modal";
        let settings_modal_parent = $(`#${this.settings_modal_id}`);
        if (settings_modal_parent.length <= 0) {
            let settings_modal = new SettingsModal({
                id: this.settings_modal_id,
            });
            settings_modal.spawn();
            settings_modal_parent = $(`#${this.settings_modal_id}`);
        }
    }
}

// ===================== Widgets End ===================== //

(function () {
    "use strict";
    console.log("+ App loaded: AIRead (Local)");
    require_modules().then(() => {
        console.log("+ Plugin loaded: AIRead");
        let selector = new PureElementsSelector();
        window.pure_elements = selector.select();
        selector.stylize();
        apply_css();
        let tool_panel = new ToolPanel();
        let tool_button_group = new ToolButtonGroup();
        for (let element of window.pure_elements) {
            add_container_to_element(element, tool_button_group);
        }
        set_pure_element_levels();
        set_pure_element_rel_levels();
    });
})();
