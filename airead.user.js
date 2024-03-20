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
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

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
.airead-element-hover {
    box-shadow: 0px 0px 4px gray !important;
    background-color: azure !important;
}
.airead-note {
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 4px gray;
    position: absolute;
    z-index: 1000;
}
html {
    scroll-behavior: smooth;
}
`;

function apply_css() {
    let style_element = document.createElement("style");
    style_element.textContent = AIREAD_CSS;
    document.head.appendChild(style_element);
}

function get_offset_top(element) {
    let offset_top = 0;
    while (element) {
        offset_top += element.offsetTop;
        element = element.offsetParent;
    }
    return offset_top;
}

window.hovering_element = null;
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
            console.log("Enter element:", element);
        }
    });
    container.addEventListener("mouseleave", (event) => {});
    return container;
}

class NoteElement {
    constructor() {}
    spawn(container) {
        this.element = document.createElement("div");
        container.appendChild(this.element);
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
        this.copy_button = this.create_button("Copy", () => {});
        this.translate_button = this.create_button("Translate", () => {});
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
            element.parentNode.appendChild(this.button_group);
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
        this.translate_button.onclick = () => {
            console.log("Translate:", element.textContent);
        };
        this.parent_button.onclick = () => {
            element.parentNode.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            console.log("Parent of:", element.textContent);
        };
    }
    attach_to_element(element = null) {
        if (element) {
            console.log(
                "Attach tool_button_group",
                this.button_group,
                "to element",
                element
            );
            this.stylize_button_group(element);
            this.bind_buttons_func_to_element(element);
        }
    }
}

(function () {
    "use strict";
    console.log("+ Plugin loaded: AIRead");
    let selector = new PureElementsSelector();
    let pure_elements = selector.select();
    selector.stylize();
    apply_css();
    let tool_button_group = new ToolButtonGroup();
    for (let element of pure_elements) {
        add_container_to_element(element, tool_button_group);
    }
})();
