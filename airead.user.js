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
.airead-button-group {
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
.airead-container:hover {
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

class PureElementsEquipper {
    constructor() {}
    apply_css() {
        let style_element = document.createElement("style");
        style_element.textContent = AIREAD_CSS;
        document.head.appendChild(style_element);
    }
    stylize_button_group(button_group, element) {
        button_group.classList.add("airead-button-group");
        button_group.style.maxHeight = `${element.offsetHeight}px`;
        // get max width of children buttons in button_group
        let max_width = 0;
        for (let i = 0; i < button_group.children.length; i++) {
            let button = button_group.children[i];
            if (button.offsetWidth > max_width) {
                max_width = button.offsetWidth;
            }
        }
        const update_button_group_position = () => {
            let button_group_left = element.offsetLeft - max_width - 4;
            let button_group_top = element.offsetTop;
            button_group.style.left = `${button_group_left}px`;
            button_group.style.top = `${button_group_top}px`;
            button_group.style.height = `${element.offsetHeight}px`;
        };
        update_button_group_position();
        window.addEventListener("resize", update_button_group_position);
        button_group.style.opacity = 0;
    }
    add_buttons(element) {
        let container = document.createElement("div");
        element.parentNode.replaceChild(container, element);
        container.appendChild(element);
        container.classList.add("airead-container");
        let button_group = document.createElement("div");
        button_group.classList.add("airead-button-group");
        container.appendChild(button_group);
        this.add_button(button_group, "Copy", () => {
            console.log("Copy:", element.textContent);
        });
        this.add_button(button_group, "Translate", () => {
            console.log("Translate:", element.textContent);
        });
        this.add_button(button_group, "Parent", () => {
            console.log(
                "Goto parent:",
                element.parentNode.scrollIntoView({
                    block: "center",
                })
            );
        });

        function get_offset_top(element) {
            let offset_top = 0;
            while (element) {
                offset_top += element.offsetTop;
                element = element.offsetParent;
            }
            return offset_top;
        }
        function calc_cursor_vertical_distance_with_button_group(
            button_group,
            event
        ) {
            if (!button_group) {
                return 1000;
            }
            let cursor_y = window.scrollY + event.clientY;
            // get first button in button_group
            let top_button = button_group.children[0];
            // get last button in button_group
            let bottom_button =
                button_group.children[button_group.children.length - 2];
            let button_group_top = get_offset_top(top_button);
            let button_group_bottom =
                get_offset_top(bottom_button) + bottom_button.offsetHeight;
            console.log(
                "cursor_y:",
                cursor_y,
                "button_group_top:",
                button_group_top,
                "button_group_bottom:",
                button_group_bottom,
                "button_group:",
                button_group
            );

            if (cursor_y > button_group_top && cursor_y < button_group_bottom) {
                return 0;
            }
            let cursor_and_button_group_top_distance = Math.abs(
                cursor_y - button_group_top
            );
            let cursor_and_button_group_bottom_distance = Math.abs(
                cursor_y - button_group_bottom
            );
            let cursor_and_button_group_y_distance = Math.min(
                cursor_and_button_group_top_distance,
                cursor_and_button_group_bottom_distance
            );
            return cursor_and_button_group_y_distance;
        }
        container.addEventListener("mouseenter", (event) => {
            let cursor_and_button_group_y_distance =
                calc_cursor_vertical_distance_with_button_group(
                    window.hovering_button_group,
                    event
                );
            if (
                cursor_and_button_group_y_distance > 0 ||
                window.hovering_button_group === button_group
            ) {
                button_group.style.opacity = 1;
                console.log(
                    "hovering_button_group:",
                    window.hovering_button_group
                );
            }
        });
        container.addEventListener("mouseleave", (event) => {
            let cursor_and_button_group_y_distance =
                calc_cursor_vertical_distance_with_button_group(
                    window.hovering_button_group,
                    event
                );
            if (cursor_and_button_group_y_distance > 0) {
                button_group.style.opacity = 0;
                window.hovering_button_group = button_group;
                console.log(
                    "hovering_button_group:",
                    window.hovering_button_group
                );
            }
        });
        this.stylize_button_group(button_group, element);
        window.hovering_button_group = null;
    }
    add_button(button_group, button_text, on_click_func) {
        let button = document.createElement("button");
        button.innerHTML = button_text;
        button.classList.add("airead-button");
        button_group.appendChild(button);
        button_group.appendChild(document.createElement("br"));
        button.addEventListener("click", on_click_func);
    }
}

(function () {
    "use strict";
    console.log("+ Plugin loaded: AIRead");
    let selector = new PureElementsSelector();
    let pure_elements = selector.select();
    selector.stylize();
    let equipper = new PureElementsEquipper();
    equipper.apply_css();
    pure_elements.forEach((element) => {
        equipper.add_buttons(element);
    });
})();
