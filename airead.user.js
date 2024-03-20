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
.airead-button {
    display: block;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.5);
    box-shadow: 0px 0px 4px gray;
    opacity: 0;
    z-index: 1000;
}
.airead-container:hover {
    box-shadow: 0px 0px 4px gray !important;
    background-color: azure !important;
}
`;

class PureElementsEquipper {
    constructor() {}
    stylize() {
        let style_element = document.createElement("style");
        style_element.textContent = AIREAD_CSS;
        document.head.appendChild(style_element);
    }
    stylize_button(button, element) {
        button.classList.add("airead-button");
        const update_button_position = () => {
            let button_left = Math.max(
                element.offsetLeft - button.offsetWidth - 4,
                5
            );
            let button_top = element.offsetTop;
            button.style.left = `${button_left}px`;
            button.style.top = `${button_top}px`;
        };
        update_button_position();
        window.addEventListener("resize", update_button_position);
    }
    add_button(element) {
        let container = document.createElement("div");
        element.parentNode.replaceChild(container, element);
        container.appendChild(element);
        let button = document.createElement("button");
        container.appendChild(button);
        container.classList.add("airead-container");

        button.innerHTML = "Print";
        button.addEventListener("click", () => {
            console.log(element.textContent);
        });
        container.addEventListener("mouseover", () => {
            button.style.opacity = 1;
        });
        container.addEventListener("mouseout", () => {
            button.style.opacity = 0;
        });
        this.stylize_button(button, element);
    }
}

(function () {
    "use strict";
    console.log("+ Plugin loaded: AIRead");
    let selector = new PureElementsSelector();
    let pure_elements = selector.select();
    selector.stylize();
    let equipper = new PureElementsEquipper();
    equipper.stylize();
    pure_elements.forEach((element) => {
        equipper.add_button(element);
    });
})();
