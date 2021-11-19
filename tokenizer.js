function tokenize(code){
  
  let parsed = []
  
  const operators = [
    "+", "-", "*", "/", "%",
    "=", "++", "--", "+=", "-=", "*=", "/=", "%=",
    "==", "!=", "===", "!==", "<", "<=", ">", ">=",
    "&", "|", "^", "~", "<<", ">>", "&=", "|=", "^=",
    "&&", "||", "??", "&&=", "||=", "??=", "!",
    "=>", "in"
  ]
  const keywords = [
    "let", "const", "var", "if", "for", "while", "do",
    "try", "catch", "break", "continue", "else", "new",
    "function", "return"
  ]
  const stringDelimiter = /["'`]/,
        variableBegin = /[a-z_@$]/,
        digitBegin = /\d/
  
  mainLoop: while(true){
    for(let index in code){
      index = parseInt(index)
      const char = code[index]
      const nextChar = code[index + 1]
      if(/["'`]/.test(char)){
        let delimiter = char
        let [string, code_rest] = parseString(code.slice(index + 1), delimiter)
        
        parsed.push(["string", string])
        code = code_rest
        continue mainLoop
      }
      if(/[a-z_@$]/i.test(char)){
        let [identifier, code_rest] = parseIdentifier(code.slice(index))
        
        parsed.push(["identifier", identifier])
        code = code_rest
        continue mainLoop
      }
      if(/\d/.test(char)){
        let [number, code_rest] = parseNumber(code.slice(index))
        
        parsed.push(["number", number])
        code = code_rest
        continue mainLoop
      }
      const twoNext = char + nextChar
      if(twoNext == "//"){
        let [comment, code_rest] = parseComment("singleline", code.slice(index + 2))
        
        parsed.push(["comment", comment])
        code = code_rest
        continue mainLoop
      }
      if(twoNext == "/*"){
        let [comment, code_rest] = parseComment("multiline", code.slice(index + 2))
        
        parsed.push(["comment", comment])
        code = code_rest
        continue mainLoop
      }
      
      let operator = operators.find(oper=>code.startsWith(oper))
      if(operator){
        parsed.push(["operator", operator])
        code = code.slice(operator.length)
        continue mainLoop
      }
      parsed.push(["punctuator", char])
    }
    break
  }
  return removeComments(parsed)
}
function parseString(code, delimiter){
  let string = ""
  let escapeNext = false
  for(let index in code){
    index = parseInt(index)
    const char = code[index]
    if(escapeNext){
      escapeNext = false
      string += char
      continue
    }
    if(char == "\\"){
      escapeNext = true
      continue
    }
    if(char == delimiter){
      return [string, code.slice(index + 1)]
    }
    string += char
  }
  throw new Error("No end string delimiter, expected: " + delimiter)
}

function parseIdentifier(code){
  let identifier = ""
  for(let index in code.slice(1)){
    index = parseInt(index)
    const char = code[index]
    
    if(!/\w/.test(char)){
      return [identifier, code.slice(index)]
    }
    identifier += char
    
  }
  // console.warn("identifier at end of file, doesn't have to be a problem")
  return [identifier, ""]
  
}

function parseNumber(code){
  let number = ""
  let hadDecimal = false
  for(let index in code){
    index = parseInt(index)
    const char = code[index]
    if(char == "." && !hadDecimal && /\d/.test(code[index + 1])){
      number += char
      hadDecimal = true
      continue
    }
    if(!/\d/.test(char)){
      return [number, code.slice(index)]
    }
    number += char
    
    
  }
  return [number, ""]
}

function parseComment(type, code){
  let comment = ""
  if(type == "singleline"){
    for(let index in code){
      index = parseInt(index)
      const char = code[index]
      if(char == "\n"){
        return [comment, code.slice(index)]
      }
      comment += char
    }
    return [comment, ""]
  }else{
    for(let index in code){
      index = parseInt(index)
      const char = code[index]
      const nextTwo = char + code[index + 1]
      if(nextTwo == "*/"){
        return [comment, code.slice(index + 2)]
      }
      comment += char
    }
    
  }
}
function removeComments(tokenized){
  return tokenized.filter(x=>x[0] != "comment")
}