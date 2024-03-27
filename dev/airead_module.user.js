// ==UserScript==
// @name         (Dev) AIRead Module
// @namespace    http://tampermonkey.net/
// @version      0.0
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
    return Promise.all([
        require_module(jquery_js),
        require_module(bootstrap_js),
        require_module(bootstrap_css),
        require_module(font_awesome_css),
        require_module(font_awesome_v4_css),
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

const ATOM_TAGS = [].concat(
    HEADER_TAGS,
    TABLE_TAGS,
    PRE_TAGS,
    BLOCKQUOTE_TAGS,
    IMG_TAGS,
    CAPTION_TAGS
);
const PARA_TAGS = [].concat(
    GROUP_TAGS,
    // SPAN_TAGS,
    LIST_TAGS,
    DEF_TAGS,
    P_TAGS,
    LI_TAGS,
    DD_TAGS
);

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
    ARXIV_EXCLUDED_CLASSES,
    DOCS_PYTHON_EXCLUDED_CLASSES,
    AMINER_EXCLUDED_CLASSES,
    WEIBO_EXCLUDED_CLASSES
);

// Helper Functions

function get_tag(element) {
    return element.tagName.toLowerCase();
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

function calc_width_of_descendants(element) {
    // width of descendants means: max count of child elements per level
    let max_count = element.childElementCount;
    let descendants = get_descendants(element);
    for (let i = 0; i < descendants.length; i++) {
        let count = descendants[i].childElementCount;
        if (count > max_count) {
            max_count = count;
        }
    }
    return max_count;
}

// Main Classes

class PureElementsSelector {
    constructor() {}
    is_atomized(element) {
        const tag = get_tag(element);
        const descendants = get_descendants(element);
        const parents = get_parents(element);

        if (ATOM_TAGS.includes(tag)) {
            return !is_elements_has_tags(parents, ATOM_TAGS);
        }
        if (PARA_TAGS.includes(tag)) {
            const is_parent_has_atom = is_elements_has_tags(parents, ATOM_TAGS);
            const is_descendant_has_para = is_elements_has_tags(
                descendants,
                PARA_TAGS
            );
            // if descendant has atom, and descendant width is 1, then it is not atomized
            const is_descendant_has_only_atom =
                calc_width_of_descendants(element) == 1 &&
                is_elements_has_tags(descendants, ATOM_TAGS);

            return !(
                is_parent_has_atom ||
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
                if (
                    is_class_id_match_pattern(
                        output_elements[j],
                        REMOVED_CLASSES[i]
                    )
                ) {
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
                (element) =>
                    !is_class_id_match_pattern(element, EXCLUDED_CLASSES[i])
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
    numbering_elements(elements) {
        console.log("Pure elements count:", elements.length);
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.add("pure-element");
            elements[i].classList.add(`pure-element-id-${i}`);
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
        pure_elements = this.numbering_elements(pure_elements);
        this.pure_elements = pure_elements;
        return this.pure_elements;
    }
}

const LATEX_FORMAT_MAP = {
    "\\\\math((bf)|(bb))": "",
    "\\\\operatorname": "",
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
                for (let regex in LATEX_FORMAT_MAP) {
                    let re = new RegExp(regex, "gm");
                    latex_text = latex_text.replace(
                        re,
                        LATEX_FORMAT_MAP[regex]
                    );
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
    }
    replace_ref_with_content({ element = null, is_replace = false } = {}) {
        if (!element) {
            element = this.element;
        }
        let refs = element.querySelectorAll("a[href^='#']");
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
    remove_whitespaces(text) {
        for (let regex in WHITESPACE_MAP) {
            let re = new RegExp(regex, "gm");
            text = text.replace(re, WHITESPACE_MAP[regex]);
        }
        return text;
    }
    get_text({ with_refs = true } = {}) {
        let element_copy = this.element.cloneNode(true);
        this.replace_math_with_latex({
            element: element_copy,
            is_replace: true,
        });
        let ref_contents = this.replace_ref_with_content({
            element: element_copy,
            is_replace: true,
        });

        let text = element_copy.textContent;
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

const LLM_ENDPOINT = "https://hansimov-hf-llm-api.hf.space/api";
const LLM_API_KEY = "sk-xxxx";

async function process_stream_response(response, update_element, on_chunk) {
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
                update_element.textContent = content;
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

// ===================== OpenAI End ===================== //

// ===================== AIRead Start ===================== //

const AIREAD_CSS = `
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
}
.airead-button:hover {
    background-color: rgba(128, 255, 128, 0.5);
}

.airead-element-hover {
    border-radius: 4px;
    box-shadow: 0px 0px 4px gray !important;
    background-color: azure !important;
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
.airead-chat-user-input-option-select-para,
.airead-chat-user-input-option-select-level {
    padding: 0px 2px 0px 2px;
    margin: 0;
    border-radius: 2px;
    box-shadow: 0px 0px 3px gray;
}
.airead-chat-user-input-option-select-para {
    width: 100px;
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
    return element.tagName.match(/H[1-6]/i);
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
    if (depth > 0) {
        console.log("depth_of_li", element, depth);
    }
    return depth;
}

function compare_element_level(element1, element2) {
    // Less level means closer to root.
    // -1: level of element1 < element2
    // +1: level of element1 < element2
    //  0: level of element1 = element2
    let para_tags = ["p", "table", "pre", "img", "blockquote", "math", "code"];
    let item_tags = ["li", "dd", "dt"];
    let tag_ranks = [...HEADER_TAGS, para_tags, item_tags];

    let tag1 = get_tag(element1);
    let tag2 = get_tag(element2);

    let rank1 = tag_ranks.findIndex((tags) => tags.includes(tag1));
    let rank2 = tag_ranks.findIndex((tags) => tags.includes(tag2));

    let depth1 = depth_of_li(element1);
    let depth2 = depth_of_li(element2);

    rank1 = rank1 + depth1;
    rank2 = rank2 + depth2;

    // if index is -1, set to HEADER_TAGS.length, which means
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
        console.log("Level of", element, level);
        prev_level = level;
        prev_element = element;
    }
}
function get_parents_by_level_diff(element, element_list, abs_level_diff = 0) {
    // abs_level_diff = -1: return []
    // abs_level_diff =  0: return siblings with same level
    // abs_level_diff >  0: return elements with diff of levels < abs_level_diff
    let parents = [];
    let element_index = element_list.indexOf(element);
    if (abs_level_diff >= 0) {
        for (let i = element_index - 1; i >= 0; i--) {
            let sibling = element_list[i];
            let sibling_level = sibling.getAttribute("airead-level");
            let element_level = element.getAttribute("airead-level");
            // example:
            // if element_level is 6, and abs_level_diff is 1
            // then sibling_level should be 5 or 6
            // and since this function is to get parents,
            // sibling_level must <= element_level
            if (
                element_level >= sibling_level &&
                element_level - sibling_level <= abs_level_diff
            ) {
                parents.push(sibling);
            } else {
                break;
            }
        }
    }
    console.log(
        "Element",
        element,
        `parents under level ${abs_level_diff}`,
        parents
    );
    return parents;
}

class ChatUserInput {
    constructor() {}
    construct_html() {
        let html = `
            <div class="my-2 row no-gutters airead-chat-user-input-group">
                <div class="airead-chat-user-input-options">
                    <div class="col px-0 pb-2 d-flex align-items-left">
                        <select class="form-control airead-chat-user-input-option-select-para" title="Select more paragraphs as context">
                            <option value="only_this_para">only this para</option>
                            <option value="more_paras_auto" selected="selected">(auto) more paras</option>
                            <option value="more_paras_manual">(manual) more paras</option>
                        </select>
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
    on_chunk(chunk) {
        let delta = chunk.delta;
        if (delta.role) {
            // console.log("role:", delta.role);
        }
        if (delta.content) {
            return delta.content;
        }
        if (chunk.finish_reason === "stop") {
            console.log("[Finished]");
        }
        return "";
    }
    bind_options() {
        function add_option_html(para_options_select) {
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
            if (para_options_select.value === "more_paras_manual") {
                para_options_select.insertAdjacentHTML(
                    "afterend",
                    more_para_select_option_html
                );
            } else {
                remove_siblings(para_options_select);
            }
        }
        let para_options_select = this.user_input_group.querySelector("select");
        para_options_select.addEventListener("change", function () {
            console.log("Option select:", this.value);
            add_option_html(this);
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
                let user_chat_message = new UserChatMessageElement({
                    role: "user",
                    content: user_input.value,
                });
                self.user_chat_message_element =
                    user_chat_message.spawn(parent_element);

                user_input.style.height = "auto";
                let prompt = user_input.value;
                user_input.value = "";

                let assistant_chat_message = new AssistantChatMessageElement({
                    role: "assistant",
                    content: "",
                });
                assistant_chat_message.spawn(parent_element);
                let last_assistant_chat_message_element =
                    self.get_last_assistant_chat_message_element();

                let context = get_element_text(this.get_current_pure_element());
                context = context.replace(/\s+/g, " ");
                chat_completions({
                    messages: [
                        {
                            role: "user",
                            content: `Please response according to following context:\n
                            \`\`\`${context}\`\`\`\n`,
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    model: "nous-mixtral-8x7b",
                    stream: true,
                }).then((response) => {
                    console.log(context);
                    console.log(prompt);
                    process_stream_response(
                        response,
                        last_assistant_chat_message_element,
                        self.on_chunk
                    ).then((content) => {
                        console.log(content);
                    });
                });
            }
        });
    }
    spawn(parent_element) {
        this.user_input_group = document.createElement("div");
        this.user_input_group.innerHTML = this.construct_html().trim();
        this.user_input_group = this.user_input_group.firstChild;
        parent_element.parentNode.appendChild(this.user_input_group);
        this.bind_user_input(parent_element);
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
    let container = document.createElement("div");
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
    container.addEventListener("mouseleave", (event) => {});
    return container;
}

class NoteElement {
    constructor() {}
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
        this.chat_button = this.create_button("Chat", () => {});
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
            element.parentNode.insertBefore(
                this.button_group,
                element.nextSibling
            );
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
            if (chat_button_text === "chat") {
                // create new ChatUserInput if last sibling of element is not user_input
                let last_child = element.parentNode.lastChild;
                let no_user_input_exists = !last_child.classList.contains(
                    "airead-chat-user-input-group"
                );
                if (no_user_input_exists) {
                    let chat_user_input_instance = new ChatUserInput();
                    let chat_user_group =
                        chat_user_input_instance.spawn(element);
                }
                element.parentNode.lastChild.style.display = "block";
                let chat_messages = element.parentNode.querySelectorAll(
                    "[class^='airead-chat-message']"
                );
                for (let chat_message of chat_messages) {
                    chat_message.style.display = "block";
                }
                this.chat_button.innerHTML = "Hide";
            } else if (chat_button_text === "hide") {
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
                this.chat_button.innerHTML = "Chat";
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
    constructor({ id = "settings" } = {}) {
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
        let temperature_widget_parent = this.widget.find(
            `#${this.temperature_id}`
        );
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
            label_text: "Max Output Tokens <code>(-1: auto)</code>",
            default_val: -1,
            min_val: -1,
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
    set_endpoint_and_api_key() {
        // get endpoint and api_key with GM.getValue
        Promise.all([
            GM.getValue("airead_llm_endpoint", LLM_ENDPOINT).then(
                (endpoint) => {
                    $(`#${this.endpoint_id}`).val(endpoint);
                }
            ),
            GM.getValue("airead_llm_api_key", LLM_API_KEY).then((api_key) => {
                $(`#${this.api_key_id}`).val(api_key);
            }),
        ]).then(() => {
            this.set_models_select();
        });
    }
    save_endpoint_and_api_key() {
        let endpoint = $(`#${this.endpoint_id}`).val();
        let api_key = $(`#${this.api_key_id}`).val();
        return Promise.all([
            GM.setValue("airead_llm_endpoint", endpoint),
            GM.setValue("airead_llm_api_key", api_key),
        ]);
    }
    set_models_select() {
        let endpoint = $(`#${this.endpoint_id}`).val();
        let api_key = $(`#${this.api_key_id}`).val();
        if (endpoint) {
            get_llm_models({ endpoint: endpoint }).then((models) => {
                let models_select = $(`#${this.models_id}`);
                models_select.empty();
                for (let model of models) {
                    let option = new Option(model, model);
                    models_select.append(option);
                }
                console.log(`Get models from ${endpoint}:`, models);
            });
        }
    }
    bind_buttons() {
        let self = this;
        this.widget.find(`#${this.save_button_id}`).on("click", function () {
            self.save_endpoint_and_api_key().then(() => {
                self.set_models_select();
            });
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
        this.set_endpoint_and_api_key();
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
        this.panel_button = this.panel.querySelector(
            ".airead-tool-panel-button"
        );
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
        get_parents_by_level_diff(
            window.pure_elements[12],
            window.pure_elements,
            0
        );
    });
})();
