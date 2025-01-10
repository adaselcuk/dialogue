const Error = require('./errors.js').error;
const noop = () => {}

const tokenType = `
	COLON,
	COMMA,
	DOT,
	LEFT_PAREN,
	RIGHT_PAREN,
	EM_DASH, // negate a number for now - change when figure out what to do with it

	// might change these later on:
	MINUS, PLUS, SLASH, STAR, SEMICOLON,

	EQUAL, EQUAL_EQUAL,
	BANG, BANG_EQUAL,
	LESS, LESS_EQUAL,
	GREATER, GREATER_EQUAL,

	IDENTIFIER,
	STRING,
	NUMBER,

	AND, OR,
	IS, // assignment 
	AM, // equality
	TOGETHER, // class declaration
	IF, ELSE, FOR, WHILE,
	LISTEN, // function declaration
	TELL, // print
	GIVE, // return
	SURELY, // true
	IMPOSSIBLE, // false
	EMPTINESS, // null
	NOT,
	NEW, // new line
	EOF// end of file
	
`.split(',').map(token => token.trim());

let tokenEnum = {};
tokenType.forEach((token, i) => tokenEnum[token] = i);

const keywords = {
	and: tokenEnum.AND,
	or: tokenEnum.OR,
	is: tokenEnum.IS,
	am: tokenEnum.AM,
	together: tokenEnum.TOGETHER,
	if: tokenEnum.IF,
	else: tokenEnum.ELSE,
	for: tokenEnum.FOR,
	while: tokenEnum.WHILE,
	listen: tokenEnum.LISTEN,
	tell: tokenEnum.TELL,
	give: tokenEnum.GIVE,
	surely: tokenEnum.SURELY,
	impossible: tokenEnum.IMPOSSIBLE,
	emptiness: tokenEnum.EMPTINESS,
	not: tokenEnum.NOT,
	new: tokenEnum.NEW,
	eof: tokenEnum.EOF
}

const tokenMap = {
    ':': scanner => scanner.addToken(tokenEnum.COLON),
    ',': scanner => scanner.addToken(tokenEnum.COMMA),
    '.': scanner => scanner.addToken(tokenEnum.DOT),
    '(': scanner => scanner.addToken(tokenEnum.LEFT_PAREN),
    ')': scanner => scanner.addToken(tokenEnum.RIGHT_PAREN),
    '—': scanner => scanner.addToken(tokenEnum.EM_DASH),
	'+': scanner => scanner.addToken(tokenEnum.PLUS),
	'-': scanner => scanner.addToken(tokenEnum.MINUS),
	'*': scanner => scanner.addToken(tokenEnum.STAR),
	'/': scanner => scanner.addToken(tokenEnum.SLASH),
	';': scanner => scanner.addToken(tokenEnum.SEMICOLON),
    '=': scanner => scanner.addToken(tokenEnum.EQUAL),
    '==': scanner => scanner.addToken(tokenEnum.EQUAL_EQUAL),
    '!': scanner => scanner.addToken(tokenEnum.BANG),
    '!=': scanner => scanner.addToken(tokenEnum.BANG_EQUAL),
    '<': scanner => scanner.addToken(tokenEnum.LESS),
    '<=': scanner => scanner.addToken(tokenEnum.LESS_EQUAL),
    '>': scanner => scanner.addToken(tokenEnum.GREATER),
    '>=': scanner => scanner.addToken(tokenEnum.GREATER_EQUAL),
    'aside': scanner => {
        while (scanner.peek() !== '\n' && !scanner.isAtEnd()) scanner.advance();
    },
    ' ': noop,
    '\r': noop,
    '\t': noop,
    '\n': scanner => {
        scanner.addToken(tokenEnum.NEW);
        scanner.newline();
    },
    '"': scanner => scanner.handleStringLiterals(),
}

const isDigit = str => /\d/.test(str);
const isAlpha = str => /[a-zA-Z_]/.test(str);
const isAlphaNumeric = str => isAlpha(str) || isDigit(str);

class Token {
	constructor (type, lexeme, literal, line) {
		this.type = type;
		this.lexeme = lexeme;
		this.literal = literal;
		this.line = line;
	}

	toString () {
		return `${this.type} ${this.lexeme} ${this.literal}`;
	}
}

class Scanner {
	// private fields
	#source;
	#tokens;
	#start;
	#current;
	#line;
	#length;

	constructor (source) {
		this.source = source;
		this.tokens = [];
		this.start = 0; // offsets that index to string - first char in lexeme
		this.current = 0; // cur char being considered
		this.line = 1; // what source line we are on
		this.length = source.length;
	}

	scanTokens() {
		while (!this.isAtEnd()) {
			// beginning of the next lexeme
			this.start = this.current;
			this.scanTokenAt(this.current);
		}

		// appends final EOF token
		// not necessary but good practice
		this.tokenMap.push(new Token(EOF, '', null, this.line));
		return this.tokens;
	}

	#isAtEnd() {
		// if we have consumed all chars
		return this.current >= this.length;
	}

	#scanToken() {
		// recognizing lexemes
		let c = this.#advance();
		switch (c) {
			case '(': this.addToken(LEFT_PAREN); break;
			case ')': this.addToken(RIGHT_PAREN); break;
			case ':': this.addToken(COLON); break;
			case ',': this.addToken(COMMA); break;
			case '.': this.addToken(DOT); break;
			case '—': this.addToken(EM_DASH); break;

			// operators
			case '!': this.addToken(this.#match('=') ? BANG_EQUAL : BANG); break;
			case '=': this.addToken(this.#match('=') ? EQUAL_EQUAL : EQUAL); break;
			case '<': this.addToken(this.#match('=') ? LESS_EQUAL : LESS); break;
			case '>': this.addToken(this.#match('=') ? GREATER_EQUAL : GREATER); break;

			// whitespace
			case ' ':
			case '\r':
			case '\t':
				// ignore whitespace
				break;
			case '\n':
				this.line++;
				break;
			
			// string literals
			case '"': this.#handleStringLiterals(); break;


			default:
				if (this.#isAlpha(c)){
					this.#identifier();
				} else if (this.#isDigit(c)){
					this.#handleNumberLiterals();
				}
				else {
					Youth.error(this.line, 'I cannot understand this.');
				}
				// lexical error
				// not stuck in an error loop because consumed by advance
				break;
		}
	}

	#advance() {
		// consumes next char in source and returns it
		return this.source[this.current++];
	}

	#addToken(type, literal = null) {
		// grabs text of current lexeme and creates new token for it
		let text = this.source.substring(this.start, this.current);
		this.tokens.push(new Token(type, text, literal, this.line));
	}

	#match(expected){
		// conditional advance
		// if next char is expected, consume it and return true
		if (!this.#isAtEnd()) return false;
		if (this.source[this.current] !== expected) return false;

		this.current++;
		return true;
	}

	#identifier() {
		while (this.#isAlphaNumeric(this.#peek())) this.#advance();
		const text = this.source.substring(this.start, this.current);
		if (text == 'aside:') {
			// comment
			while (this.#peek() !== '\n' && !this.#isAtEnd()) this.#advance();
			return; 
		} else {
			const type = keywords[text] || tokenEnum.IDENTIFIER;
			this.addToken(type);
		}
	}

	#peek() {
		// like advance but does not consume character
		// lookahead
		// returns next char in source
		if (this.#isAtEnd()) return '\0';
		return this.source[this.current];
	}

	#peekNext() {
		// need this to look past decimal point
		// dont want to consume . until sure there is digit after it
		if (this.current + 1 >= this.length) return '\0';
		return this.source[this.current + 1]; 
	}

	#handleStringLiterals() {
		// allows for multi-line strings
		while (this.#peek() != '"' && !this.#isAtEnd()){
			if (this.#peek() == '\n') this.line++;
			this.#advance();
		}

		if (this.#isAtEnd()){
			Youth.error(this.line, 'this string keeps going onnnn and onnnn.');
			return;
		}

		this.#advance();
		const value = this.source.substring(this.start + 1, this.current - 1); // strips off quotes
		this.addToken(STRING, value);
	}

	#handleNumberLiterals() {
		while (this.#isDigit(this.#peek())) this.#advance();
		if (this.#peek() == '.' && this.#isDigit(this.#peekNext())){
			// consume the '.'
			this.#advance();
			while (this.#isDigit(this.#peek())) this.#advance();
		}
		// need parse to convert string to number
		this.#addToken(NUMBER, parseFloat(this.source.substring(this.start, this.current)));

	}

	#isDigit (str) {
		return /\d/.test(str);
	}
	#isAlpha (str) {
		return /[a-zA-Z_]/.test(str);
	} 
	#isAlphaNumeric (str) {
		return this.#isAlpha(str) || this.#isDigit(str);
	}

}

module.exports = { tokenEnum, Token, Scanner };