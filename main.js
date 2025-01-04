import { MathfieldElement, convertLatexToMathMl } from "//unpkg.com/mathlive?module";

let editor = document.getElementById("main");

function insertMathFieldAtSelection() {
    let mf = new MathfieldElement({
        defaultMode: "inline-math",
    });

    function convertToMathMLNode() {
        let mathMLValue = "<math>" + convertLatexToMathMl(mf.value) + "</math>";
        let node = document.createElement("button");

        node.innerHTML = mathMLValue;

        node.onclick = node.onfocus = () => {
            node.replaceWith(mf);
            mf.focus();
        };
        mf.replaceWith(node);
    }

    mf.addEventListener('beforeinput', (ev) => {
        if (ev.inputType === 'insertLineBreak') {
            ev.preventDefault();
            convertToMathMLNode();
        };
    });
    mf.addEventListener('focusout', () => convertToMathMLNode());

    // insert the math field at the selection
    const selection = document.getSelection().getRangeAt(0);
    selection.deleteContents();
    selection.insertNode(mf);
    selection.selectNodeContents(mf);
    selection.collapse(false);

    //Set menu items to only include insertions
    mf.menuItems = mf.menuItems.filter(item => Object.hasOwn(item, "id") && item.id.startsWith("insert")).reverse();

    mf.focus();
}

editor.onbeforeinput = (event) => {
    if (event.inputType == "insertText" && event.data == "\\") {
        event.preventDefault();
        insertMathFieldAtSelection();
    }
}

editor.oninput = (event) => {
    if (event.inputType.startsWith("deleteContent")) {
        // Show placeholder when text is supposed to be empty
        if (event.target.innerText == "\n") event.target.innerHTML = "";
        //Trigger a click if you delete content in a button
        let selectionRange = window.getSelection().getRangeAt(0);
        if (selectionRange.startContainer == selectionRange.endContainer && (selectionRange.startContainer.constructor.name == "MathMLElement")) {
            let el = selectionRange.startContainer;
            while (el.nodeName != "BUTTON") {
                el = el.parentNode;
            }
            el.onclick();
        }
    };
}

editor.onpaste = (event) => {
    // Makes sure clipboard data is pasted in plain text
    event.preventDefault();
    document.execCommand('inserttext', false, event.clipboardData.getData('text/plain'));
}

// Set up shortcut and button functionality for standard text modifier buttons (bold/italic/underline)
document.querySelectorAll("[toggle]").forEach(button => {
    let toggle = button.getAttribute("toggle");

    let toggleFunction = () => { document.execCommand(toggle) };
    button.onclick = toggleFunction;
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

// Set up functionality for header button
document.getElementById("headerInputButton").onclick = () => {
    document.execCommand("formatBlock", false, "<h3>");
}