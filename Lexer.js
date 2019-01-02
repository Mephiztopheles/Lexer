const IDENTIFIER = /^[a-zA-Z$_][a-zA-Z0-9$_]*/;
const NUMBER = /^-?[0-9]+(\.[0-9]+)?/;
const COMMENT = /^\/\/.*/;
const WHITESPACE = /^[^\n\S]+/;
const INDENT = /^(?:\n[^\n\S]*)+/;
const OPTABLE = {
    "+": "PLUS",
    "-": "MINUS",
    "*": "MULTIPLY",
    ".": "DOT",
    "\\": "BACKSLASH",
    ":": "COLON",
    "%": "PERCENT",
    "|": "PIPE",
    "!": "EXCLAMATION",
    "?": "QUESTION",
    "#": "POUND",
    "&": "AMPERSAND",
    ";": "SEMI",
    ",": "COMMA",
    "(": "L_PARENTHESIS",
    ")": "R_PARENTHESIS",
    "<": "L_ANG",
    ">": "R_ANG",
    "{": "L_BRACE",
    "}": "R_BRACE",
    "[": "L_BRACKET",
    "]": "R_BRACKET",
    "=": "EQUALS"
};
export default class Lexer {
    constructor(source) {
        this.tokens = [];
        this.tokenize(source);
    }
    identifier() {
        const token = IDENTIFIER.exec(this.chunk);
        if (token) {
            this.tokens.push(new LexerEntry(Lexer.IDENTIFIER, token[0], this.index));
            return token[0].length;
        }
        return 0;
    }
    number() {
        const token = NUMBER.exec(this.chunk);
        if (token) {
            this.tokens.push(new LexerEntry(Lexer.NUMBER, parseFloat(token[0]), this.index));
            return token[0].length;
        }
        return 0;
    }
    string() {
        let firstChar = this.chunk.charAt(0), quoted = false, nextChar;
        if (firstChar == "\"" || firstChar == "'") {
            for (let i = 1; i < this.chunk.length; i++) {
                if (!quoted) {
                    nextChar = this.chunk.charAt(i);
                    if (nextChar == "\\") {
                        quoted = true;
                    }
                    else if (nextChar == firstChar) {
                        this.tokens.push(new LexerEntry(Lexer.STRING, this.chunk.substring(0, i + 1), this.index));
                        return i + 1;
                    }
                }
                else {
                    quoted = false;
                }
            }
        }
        return 0;
    }
    comment() {
        const token = COMMENT.exec(this.chunk);
        if (token) {
            this.tokens.push(new LexerEntry(Lexer.COMMENT, token[0], this.index));
            return token[0].length;
        }
        return 0;
    }
    whitespace() {
        const token = WHITESPACE.exec(this.chunk);
        if (token)
            return token[0].length;
        return 0;
    }
    line() {
        const token = INDENT.exec(this.chunk);
        if (token) {
            const lastNewline = token[0].lastIndexOf("\n") + 1;
            const size = token[0].length - lastNewline;
            if (size > this.indent) {
                this.tokens.push({ key: "INDENT", value: size - this.indent, index: this.index });
            }
            else {
                if (size < this.indent)
                    this.tokens.push(new LexerEntry(Lexer.OUTDENT, this.indent - size, this.index));
                this.tokens.push(new LexerEntry(Lexer.TERMINATOR, token[0].substring(0, lastNewline), this.index));
            }
            this.indent = size;
            return token[0].length;
        }
        return 0;
    }
    literal() {
        const tag = this.chunk.slice(0, 1);
        if (OPTABLE[tag]) {
            this.tokens.push(new LexerEntry(OPTABLE[tag], tag, this.index));
            return 1;
        }
        return 0;
    }
    tokenize(source) {
        this.index = 0;
        let i = 0;
        while (this.chunk = source.slice(i)) {
            const diff = this.identifier() || this.number() || this.string() || this.comment() || this.whitespace() || this.line() || this.literal();
            if (!diff) {
                console.error(`Couldn't tokenise: ${this.chunk} near "${source.slice(Math.max(0, i - 15), i + 15)}"`);
                return;
            }
            i += diff;
            this.index = i;
        }
    }
}
Lexer.TERMINATOR = "TERMINATOR";
Lexer.OUTDENT = "OUTDENT";
Lexer.IDENTIFIER = "IDENTIFIER";
Lexer.NUMBER = "NUMBER";
Lexer.STRING = "STRING";
Lexer.COMMENT = "COMMENT";
export class LexerEntry {
    constructor(key, value, index) {
        this.key = key;
        this.value = value;
        this.index = index;
    }
}
//# sourceMappingURL=Lexer.js.map