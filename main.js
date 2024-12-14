let editor = document.getElementById("main");

editor.onbeforeinput = (event) => {
    console.log(event);
    if (event.inputType == "insertText" && event.data == "\\") {
        event.preventDefault();
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


document.querySelectorAll("[toggle]").forEach(button => {
    let toggle = button.getAttribute("toggle");
    button.onclick = () => {
        button.setAttribute("enabled", (+!+button.getAttribute("enabled")));
    }
});