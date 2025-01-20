import { convertLatexToMathMl } from "//unpkg.com/mathlive?module";
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
    let title = document.getElementById("documentTitle").value;
    if (!title) {
        alert("Unable to save; Document has no title!");
        return;
    }
    let bodyContent = nodeContentToString(document.getElementById("main"));
    if (!bodyContent) {
        alert("Unable to save; Document is empty!");
    }
    let htmldoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body>
<h1>${title}</h1><div id="main">${bodyContent}</div>
<style>@font-face{font-family:"Segoe UI";src:local("Segoe UI"),local("SegoeUI-Regular");font-weight:400;font-style:normal;}@font-face{font-family:"Segoe UI";src:local("Segoe UI Semibold"),local("SegoeUI-Semibold");font-weight:600;font-style:normal;}@font-face{font-family:"Segoe UI";src:local("Segoe UI Bold"),local("SegoeUI-Bold");font-weight:700;font-style:normal;}:root{background-color:#eee;}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:black;margin:auto;padding:3em;max-width:70em;}h1{line-height:40px;font-size:2em;margin-top:0;padding-bottom:0.75em;border-bottom:2px solid grey;}h1,h3{font-weight:600;}#main{font-size:1.2em;}#main>div{margin-bottom:0.75em;}math{font-family:'Cambria Math','Times New Roman',serif}</style>
</body>
</html>`;
    let anchor = document.createElement("a");
    anchor.href = "data:application/xml;charset=utf-8," + encodeURIComponent(htmldoc);
    anchor.download = title + ".html";
    anchor.click();
}

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
    location.reload();
});
// Set up about button
document.getElementById("menuAbout").addEventListener("click", () => {
    document.getElementById("about").showModal();
});