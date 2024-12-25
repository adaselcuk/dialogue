const Error = require('./errors.js').error;

const tokens = `
	COLON,
	COMMA,
	DOT,
	LEFT_PAREN,
	RIGHT_PAREN,
	DASH,

	EQUAL, EQUAL_EQUAL,
	BANG, BANG_EQUAL,
	LESS, LESS_EQUAL,
	GREATER, GREATER_EQUAL,

	IDENTIFIER,
	STRING,

	AND, OR,
	IS, AM, ARE,
	IF, ELSE, FOR, WHILE,
	LISTEN, // assigning variables

	TELL, // print
	SURELY, // true
	IMPOSSIBLE, // false
	EMPTINESS, // null
	NOT,
	NEW, // new line
	END// end of file
	
`.split(',').map(token => token.trim());

let tokenEnum = {};
tokens.forEach((token, i) => tokenEnum[token] = i);

const keywords = {
	and: tokenEnum.AND,
	or: tokenEnum.OR,
	is: tokenEnum.IS,
	am: tokenEnum.AM,
	are: tokenEnum.ARE,
	if: tokenEnum.IF,
	else: tokenEnum.ELSE,
	for: tokenEnum.FOR,
	while: tokenEnum.WHILE,
	listen: tokenEnum.LISTEN,
	tell: tokenEnum.TELL,
	surely: tokenEnum.SURELY,
	impossible: tokenEnum.IMPOSSIBLE,
	emptiness: tokenEnum.EMPTINESS,
	not: tokenEnum.NOT,
	new: tokenEnum.NEW,
	end: tokenEnum.END
}

const noop = () => {};

const tokenMap = {
	':': tokenizer => tokenizer.addToken(tokenEnum.COLON),
	',': tokenizer => tokenizer.addToken(tokenEnum.COMMA),
	'.': tokenizer => tokenizer.addToken(tokenEnum.DOT),
	'(': tokenizer => tokenizer.addToken(tokenEnum.LEFT_PAREN),
	')': tokenizer => tokenizer.addToken(tokenEnum.RIGHT_PAREN),
	'-': tokenizer => tokenizer.addToken(tokenEnum.DASH),
	'=': tokenizer => tokenizer.addToken(tokenEnum.EQUAL),
	'==': tokenizer => tokenizer.addToken(tokenEnum.EQUAL_EQUAL),
	'!': tokenizer => tokenizer.addToken(tokenEnum.BANG),
	'!=': tokenizer => tokenizer.addToken(tokenEnum.BANG_EQUAL),
	'<': tokenizer => tokenizer.addToken(tokenEnum.LESS),
	'<=': tokenizer => tokenizer.addToken(tokenEnum.LESS_EQUAL),
	'>': tokenizer => tokenizer.addToken(tokenEnum.GREATER),
	'>=': tokenizer => tokenizer.addToken(tokenEnum.GREATER_EQUAL),
	'aside': tokenizer => {
		while (tokenizer.peek() !== '\n' && !tokenizer.isAtEnd()) tokenizer.advance();
	},
	' ': noop,
	'\r': noop,
	'\t': noop,
	'\n': tokenizer => {
		tokenizer.addToken(tokenEnum.NEW);
		tokenizer.newline();
	},

	'"': tokenizer => tokenizer.handleStringLiterals(),
}

const isDigit = str => /\d/.test(str);
const isAlpha = str => /[a-zA-Z_]/.test(str);
const isAlphaNumeric = str => isAlpha(str) || isDigit(str);