// ==UserScript==
// @name         AIRead Module
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Module script for AIRead
// @author       Hansimov
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
    let pure_page_user_js =
        "https://github.com/Hansimov/purepage/raw/39b132bb4c67c0c471a2e3ca9a8d5286d19b21e0/purepage.user.js";
    return Promise.all([
        require_module(jquery_js),
        require_module(bootstrap_js),
        require_module(bootstrap_css),
        require_module(font_awesome_css),
        require_module(font_awesome_v4_css),
        require_module(pure_page_user_js, false),
    ]);
}

const LLM_ENDPOINT = "https://hansimov-hf-llm-api.hf.space/api";

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

const AIREAD_CSS = `
.pure-element {
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
}
.airead-button:hover {
    background-color: rgba(128, 255, 128, 0.5);
}

.airead-element-hover {
    box-shadow: 0px 0px 4px gray !important;
    background-color: azure !important;
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
    box-shadow: 0px 0px 4px gray;
    border-radius: 10px;
    max-height: 300px;
    overflow-y: auto;
}
.airead-chat-user-input {
    resize: none;
}
.airead-chat-message-user {
    background-color: rgba(128, 255, 128, 0.1);
    text-align: left;
}

.airead-note {
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 4px gray;
    position: absolute;
    z-index: 1000;
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

class ChatUserInput {
    constructor() {}
    construct_html() {
        let html = `
            <div class="col-auto px-0">
                <textarea class="form-control airead-chat-user-input" rows="1"
                    placeholder="Ask about this paragraph ..."></textarea>
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
    spawn(parent_element) {
        this.user_input_group = document.createElement("div");
        this.user_input_group.innerHTML = this.construct_html();
        parent_element.parentNode.appendChild(this.user_input_group);
        this.user_input_group.classList.add(
            "my-2",
            "row",
            "no-gutters",
            "airead-chat-user-input-group"
        );
        let user_input = this.user_input_group.querySelector("textarea");
        user_input.addEventListener(
            "input",
            function () {
                this.style.height = 0;
                this.style.height = this.scrollHeight + 3 + "px";
            },
            false
        );
        let self = this;
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

                let context = this.get_current_pure_element().textContent;
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
                    console.log("User:", prompt);
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
        this.copy_button = this.create_button("Copy", () => {});
        this.parent_button = this.create_button("Parent", () => {});

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
        this.copy_button.onclick = () => {
            console.log("Copy:", element.textContent);
        };

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
        this.parent_button.onclick = () => {
            let pure_parent = get_pure_parent(element);
            // focus on the parent
            pure_parent.focus();
            pure_parent.scrollIntoView({ behavior: "smooth", block: "start" });
            pure_parent.classList.add("airead-element-focus");
            setTimeout(() => {
                pure_parent.classList.remove("airead-element-focus");
            }, 1500);
            console.log("Goto Parent:", pure_parent, "of:", element);
        };
    }
    attach_to_element(element = null) {
        if (element) {
            this.stylize_button_group(element);
            this.bind_buttons_func_to_element(element);
        }
    }
}

(function () {
    "use strict";
    console.log("+ App loaded: AIRead (Local)");
    require_modules().then(() => {
        console.log("+ Plugin loaded: AIRead");
        let selector = new PureElementsSelector();
        window.pure_elements = selector.select();
        selector.stylize();
        apply_css();
        let tool_button_group = new ToolButtonGroup();
        for (let element of window.pure_elements) {
            add_container_to_element(element, tool_button_group);
        }
    });
})();
