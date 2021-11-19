const textArea = document.getElementById("codearea")
const stdout = document.getElementById("stdout")
const stderr = document.getElementById("stderr")

var r

function escapeHtml(unsafe){
    // return unsafe
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

let f = () => {
    
    // return textArea.innerHTML = escapeHtml(textArea.innerText.replace(/(["'])(\\\\|\\.|(?!\1).*)\1/gs, m => `<span style="color:#2f3">${m}</span>`))
    // stderr.innerText = JSON.stringify(tokenize(textArea.innerText))
    let tokenized = tokenize(textArea.innerText)
    let htmlString = tokenized.map(setColor).join("") + '<span style="color:#fff"></span>'
    console.log(tokenized)
    console.log(htmlString)
    textArea.innerHTML = htmlString
}

const colorize = (text, color) => `<span style="color:${color}">${escapeHtml(text)}</span>`

const setColor = ([type, value]) => {

    let colorTable = {
        "identifier": "#fff",
        "punctuator": "#49f",
        "string": "#2f2",
        "number": "#35f"
    }
    let color = colorTable[type] || "#f0f"
    return colorize(tokenToString([type, value]), color)
}

const tokenToString = ([type, value]) => {
    switch(type){
        case "identifier": return value.toString()
        case "string": return `"${value}"`
        case "number": return value.toString()
        default: return value?.toString() ?? "'idk'"
    }
}


const codeResponse = (json) => {
    if(!json?.run) return
    console.log(json)
    stdout.innerText = json?.run?.stdout ?? ""
    stderr.innerText = json?.run?.stderr ?? ""
    r = json
    f()
}

const runCode = () => {
    let request = new XMLHttpRequest()
    request.addEventListener("load", codeResponse)
    request.onload = () => {
        codeResponse(JSON.parse(request.responseText))
    }
    request.open("POST", "https://emkc.org/api/v2/piston/execute")
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(
        {
            "language": "ruby",
            "version": "3.0.1",
            "files": [
                {
                    "content": textArea.innerText
                }
            ]
        }
    ))
}








document.onkeypress = event => {
    if(event.code == "Enter" && event.ctrlKey){
        runCode()
        return
    }
    // console.log(event)


}
