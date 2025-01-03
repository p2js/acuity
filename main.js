let editor = document.getElementById("main");

editor.onbeforeinput = (event) => {
    if (event.inputType == "insertText" && event.data == "\\") {
        event.preventDefault();

        let selection = window.getSelection();
        let selectionRange = selection.getRangeAt(0);
        console.log(selectionRange);
    }
}

editor.oninput = (event) => {
    // Show placeholder when text is supposed to be empty
    if (event.inputType.startsWith("deleteContent")) {
        if (event.target.innerText == "\n") event.target.innerHTML = "";
    };

    // debug
    document.getElementById("debug").value = event.target.innerHTML.trim();
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