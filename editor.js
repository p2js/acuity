import { MathfieldElement } from "//unpkg.com/mathlive?module";

let editor = document.getElementById("main");

// window.onbeforeunload = function (event) {
//     event.returnValue = true;
// };

/**
 * This toggle serves to prevent an unwanted insertParagraph event when breaking out of a math-field.
 * The toggle is set to true inside the math field beforeinput event code.
 * 
 * This code really does not spark joy, so if you know another way to prevent 
 * an unwanted event firing off from pressing a key when moving out of an element, 
 * I beg you to reach out to me.
 */
editor.doNotInsertParagraph = false;
editor.addEventListener("beforeinput", (event) => {
    if (event.inputType == "insertParagraph" && editor.doNotInsertParagraph) {
        event.preventDefault();
        editor.doNotInsertParagraph = false;
    }
});

function createMathFieldAtSelection() {
    // Wrap the math-field in a non-contenteditable span to avoid conflicts with the shadow DOM
    let wrapper = document.createElement("span");
    wrapper.contentEditable = "false";
    let mf = new MathfieldElement({
        defaultMode: "inline-math",
    });
    wrapper.appendChild(mf);

    // Function to position the caret immediately after the math-field when breaking out of it
    function setCaretAfter() {
        let selection = window.getSelection();
        selection.removeAllRanges();
        let newRange = document.createRange();
        newRange.selectNode(wrapper);
        selection.addRange(newRange);
        selection.collapseToEnd();
    }

    // Remove math-field if empty when focused out of
    mf.addEventListener('focusout', () => {
        if (mf.value == "") wrapper.remove();
    });

    // Break out on tab
    mf.addEventListener("keydown", (event) => {
        if (event.key == "Tab") {
            event.preventDefault();
            setCaretAfter();
        }
    });

    //Break out on enter press
    mf.addEventListener("beforeinput", (event) => {
        if (event.inputType === 'insertLineBreak') {
            event.preventDefault();
            editor.doNotInsertParagraph = true;
            setCaretAfter();
        }
    });

    // insert the math field at the selection
    const selection = document.getSelection().getRangeAt(0);
    selection.deleteContents();
    selection.insertNode(wrapper);
    selection.selectNodeContents(mf);
    selection.collapse(false);

    //Set menu items to only include insertions
    mf.menuItems = mf.menuItems.filter(item => Object.hasOwn(item, "id") && item.id.startsWith("insert")).reverse();

    mf.focus();
}

// Show placeholder when the editor is supposed to be empty
editor.addEventListener("input", (event) => {
    if (event.inputType.startsWith("deleteContent") && event.target.innerText == "\n") {
        event.target.innerHTML = "";
    };
});

// Ensure clipboard data is pasted in plain text
editor.addEventListener("paste", (event) => {
    event.preventDefault();
    document.execCommand('inserttext', false, event.clipboardData.getData('text/plain'));
});

// Set up shortcut and button functionality for text modifiers (heading, bold, italic, underline)
document.querySelectorAll("[toggle]").forEach(button => {
    let toggle = button.getAttribute("toggle");

    let toggleFunction = () => { document.execCommand(toggle, false, "<h3>") };
    button.addEventListener("click", toggleFunction);

    //Add a shortcut if possible
    let key = button.getAttribute("shortcutKey");
    if (key == null) return;
    document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && !event.shiftKey && !event.altKey && event.key == key) {
            event.preventDefault();
            toggleFunction();
        }
    });
});

// Set up \ key functionality
editor.addEventListener("beforeinput", (event) => {
    if (event.inputType == "insertText" && event.data == "\\") {
        event.preventDefault();
        createMathFieldAtSelection();
    }
});

// Set up functionality for the equation input button
document.getElementById("equationInputButton").addEventListener("click", () => {
    let isFocusedOnEditor = editor.contains(window.getSelection().getRangeAt(0).commonAncestorContainer);
    if (isFocusedOnEditor) {
        createMathFieldAtSelection();
    }
});