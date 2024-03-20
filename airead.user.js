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

class PureElementEquipper {
    constructor(element) {
        this.element = element;
    }
    stylize_button(button, element) {
        button.addEventListener("click", () => {
            console.log(element.textContent);
        });

        const update_button_position = () => {
            let button_left = Math.max(
                element.offsetLeft - button.offsetWidth - 2,
                5
            );
            let button_top = element.offsetTop;
            button.style.left = `${button_left}px`;
            button.style.top = `${button_top}px`;
        };
        update_button_position();
        window.addEventListener("resize", update_button_position);

        button.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
        button.style.border = "1px solid #000";
        button.style.boxShadow = "0px 0px 4px gray";
        button.style.opacity = 0.1;
    }
    add_buttons() {
        let element = this.element;
        let container = document.createElement("div");
        element.parentNode.replaceChild(container, element);
        container.appendChild(element);
        let button = document.createElement("button");
        container.appendChild(button);

        button.innerHTML = "Print";
        button.style.display = "block";
        button.style.position = "absolute";
        container.addEventListener("mouseover", () => {
            button.style.opacity = 1;
        });
        container.addEventListener("mouseout", () => {
            button.style.opacity = 0.1;
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
    pure_elements.forEach((element) => {
        let equipper = new PureElementEquipper(element);
        equipper.add_buttons();
    });
})();
