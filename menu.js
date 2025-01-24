import { convertLatexToMathMl } from "//unpkg.com/mathlive?module";
import { createMathFieldAtSelection } from "./editor.js";

let editor = document.getElementById("main");
let editorTitle = document.getElementById("documentTitle");

const HTML_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": '&#39;',
};
// Convert the children of a node to a HTML string, 
// converting any math-fields into their content's MathML Representation.
function nodeContentToString(node) {
    let nodeContent = "";
    for (let childNode of node.childNodes) {
        if (childNode.nodeType == Node.TEXT_NODE) {
            // Sanitise the content of the text nodes
            nodeContent += childNode.nodeValue.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
            continue;
        }
        if (childNode.nodeType != Node.ELEMENT_NODE) continue;
        if (childNode.tagName == "SPAN") {
            let mathfield = childNode.firstChild;
            if (mathfield != null && mathfield.tagName == "MATH-FIELD") {
                nodeContent += "<math ltx='" + mathfield.value + "'>" + convertLatexToMathMl(mathfield.value) + "</math>";
            }
            continue;
        }
        let tagName = childNode.tagName.toLowerCase();
        nodeContent += "<" + tagName + ">" + nodeContentToString(childNode) + "</" + tagName + ">";
    }
    return nodeContent;
}
// Function to save editor contents as a HTML document
function saveDocument() {
    let title = editorTitle.value;
    if (!title) {
        alert("Unable to save; Document has no title!");
        return;
    }
    let bodyContent = nodeContentToString(editor);
    if (!bodyContent) {
        alert("Unable to save; Document is empty!");
        return;
    }
    let htmldoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body>
<h1>${title}</h1><div id="main">${bodyContent}</div>
<style>@font-face{font-family:"Segoe UI";src:local("Segoe UI"),local("SegoeUI-Regular");font-weight:400;font-style:normal;}@font-face{font-family:"Segoe UI";src:local("Segoe UI Semibold"),local("SegoeUI-Semibold");font-weight:600;font-style:normal;}@font-face{font-family:"Segoe UI";src:local("Segoe UI Bold"),local("SegoeUI-Bold");font-weight:700;font-style:normal;}:root{background-color:#eee;}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:black;margin-left:auto;margin-right:auto;margin-top:0;margin-bottom:0;padding:3em;max-width:70em;}h1{line-height:40px;font-size:2em;margin-top:0;padding-bottom:0.75em;border-bottom:2px solid grey;}h1,h3{font-weight:600;}#main{font-size:1.2em;}#main>div{margin-bottom:0.75em;}math{font-family:'Cambria Math','Times New Roman',serif}</style>
</body>
</html>`;
    let anchor = document.createElement("a");
    anchor.href = "data:application/xml;charset=utf-8," + encodeURIComponent(htmldoc);
    anchor.download = title + ".html";
    anchor.click();
}
// Function to load a html file into the editor
function loadDocument() {
    if ((editor.innerHTML != "" || editorTitle.value != "") && !confirm("Are you sure you want to open another document? Any unsaved work will be lost.")) return;
    // Set up a file input to load the file
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = false;
    fileInput.accept = ".html";
    fileInput.onchange = () => {
        // Read the file and convert it into a DOM
        let file = fileInput.files[0];
        let reader = new FileReader();
        reader.onloadend = () => {
            let loadedDocument;
            try {
                loadedDocument = new DOMParser().parseFromString(reader.result, "text/html");
            } catch (error) {
                alert("Unable to load document");
                console.error(error);
                return;
            }
            // Get the title and main content
            let loadedTitle = loadedDocument.title;
            let loadedContent = loadedDocument.getElementById("main")?.innerHTML;
            if (!loadedTitle) {
                alert("Unable to load document; Invalid title");
                return;
            }
            if (!loadedContent) {
                alert("Unable to load document; Invalid content");
                return;
            }
            // Load the HTML into the editor
            editorTitle.value = loadedTitle;
            editor.innerHTML = loadedContent;
            // Convert the MathML elements into math-fields using their ltx attribute
            let selection = window.getSelection();
            editor.querySelectorAll("math").forEach((mathNode) => {
                selection.removeAllRanges();
                console.log(mathNode.getAttribute("ltx"));
                // Select each node then insert a math field at the selections
                let range = document.createRange();
                range.selectNode(mathNode);
                selection.addRange(range);
                createMathFieldAtSelection(mathNode.getAttribute("ltx"));
            });
            editor.focus();
        };
        reader.readAsText(file);
    }
    fileInput.click();
}
// Set up open button and shortcut
document.getElementById("menuOpen").addEventListener("click", loadDocument);
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && !event.shiftKey && !event.altKey && event.key == "o") {
        event.preventDefault();
        loadDocument();
    }
});
// Set up save button and shorcut
document.getElementById("menuSave").addEventListener("click", saveDocument);
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && !event.shiftKey && !event.altKey && event.key == "s") {
        event.preventDefault();
        saveDocument();
    }
});
// Set up menu button functionality
document.getElementById("menuButton").addEventListener("click", () => {
    document.getElementById("menuContent").classList.toggle("show");
});
// Set the menu to auto-close when anything is clicked
window.addEventListener("click", (event) => {
    if (!document.getElementById("menuButton").contains(event.target)) {
        document.getElementById("menuContent").classList.remove("show");
    }
});
// Set up new document button
document.getElementById("menuNew").addEventListener("click", () => {
    if ((editorTitle.value != "" || editor.innerHTML != "") && confirm("Are you sure you want to create a new document? Any unsaved work will be lost.")) {
        editorTitle.value = "";
        editor.innerHTML = "";
    }
});
// Set up about button
document.getElementById("menuAbout").addEventListener("click", () => {
    document.getElementById("about").showModal();
});
// Make sure the website warns on reload
if (location.hostname != "localhost") {
    window.addEventListener("beforeunload", (event) => {
        if (editor.innerHTML != "" || editorTitle.value != "") {
            event.returnValue = true;
        }
    });
}