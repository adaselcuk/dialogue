// unary expressions have single operand
// binary expressions have two operands
// literals have no operands

// trees enable the parser and interpreter to work together
// no associated behaviour

const { tokenEnum } = require('./tokenizer');
const { error } = require('./errors');
const { Youth } = require('./youth');
const { Stmt } = require('./Stmt.js');
const { Expr } = require('./Expr.js');

class Parser {

	#ParseError = class ParseError extends RuntimeException {}

	#tokens;
	#current = 0;

	constructor(tokens){
		this.tokens = tokens;
	}

	parse(){
		let statements = [];
		while (!this.#isAtEnd()){
			statements.push(this.#statement());
		}

		return statements;
	}

	#expression() {
		return this.#equality();
	}

	#statement() {
		if (this.#match(tokenEnum.TELL)) return this.#printStatement();
		return this.#expressionStatement();
	}

	#printStatement() {
		const value = this.#expression();
		this.#consume(tokenEnum.SEMICOLON, 'Expect ";" after value.');
		return new Stmt.Print(value);
	}

	#expressionStatement() {
		const expr = this.#expression();
		this.#consume(tokenEnum.SEMICOLON, 'Expect ";" after expression.');
		return new Stmt.Expression(expr);
	}

	#equality(){
		let expr = this.#comparison();

		while (this.#match(tokenEnum.BANG_EQUAL, tokenEnum.EQUAL_EQUAL)){
			const operator = this.#previous();
			const right = this.#comparison();
			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	#match(...types){
		for (let type of types){
			if (this.#check(type)){
				this.#advance();
				return true;
			}
		}

		return false;
	}

	#check(type){
		if (this.#isAtEnd()) return false;
		return this.#peek().type === type;
	}

	#advance(){
		if (!this.#isAtEnd()) this.#current++;
		return this.#previous();
	}

	#isAtEnd(){
		return this.#peek().type === tokenEnum.EOF;
	}

	#peek(){
		return this.#tokens[this.#current];
	}

	#previous(){
		return this.#tokens[this.#current - 1];
	}

	#comparison(){
		let expr = this.#term();

		while (this.#match(tokenEnum.GREATER, tokenEnum.GREATER_EQUAL, tokenEnum.LESS, tokenEnum.LESS_EQUAL)){
			const operator = this.#previous();
			const right = this.#term();
			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	#term(){
		let expr = this.#factor();

		while (this.#match(tokenEnum.MINUS, tokenEnum.PLUS)){
			const operator = this.#previous();
			const right = this.#factor();
			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	#factor(){
		let expr = this.#unary();

		while (this.#match(tokenEnum.SLASH, tokenEnum.STAR)){
			const operator = this.#previous();
			const right = this.#unary();
			expr = new Binary(expr, operator, right);
		}

		return expr;
	}

	#unary(){
		if (this.#match(tokenEnum.BANG, tokenEnum.MINUS)){
			const operator = this.#previous();
			const right = this.#unary();
			return new Unary(operator, right);
		}

		return this.#primary();
	}

	#primary(){
		if (this.#match(tokenEnum.FALSE)) return new Literal(false);
		if (this.#match(tokenEnum.TRUE)) return new Literal(true);
		if (this.#match(tokenEnum.NIL)) return new Literal(null);

		if (this.#match(tokenEnum.NUMBER, tokenEnum.STRING)){
			return new Literal(this.#previous().literal);
		}

		if (this.#match(tokenEnum.LEFT_PAREN)){
			const expr = this.#expression();
			this.#consume(tokenEnum.RIGHT_PAREN, 'Expect ")" after expression.');
			return new Grouping(expr);
		}

		throw this.#error(this.#peek(), 'Expect expression.');
	}

	#consume(type, message){
		if (this.#check(type)) return this.#advance();
		throw this.#error(this.#peek(), message);
	}

	#error(token, message){
		Youth.error(token, message);
		return new ParseError();
	}

	#synchronize(){
		this.#advance();

		while (!this.#isAtEnd()){
			if (this.#previous().type === tokenEnum.SEMICOLON) return;

			switch (this.#peek().type){
				case tokenEnum.TOGETHER:
					// class declaration
				case tokenEnum.IS:
					// declaration
				case tokenEnum.FOR:
				case tokenEnum.IF:
				case tokenEnum.WHILE:
				case tokenEnum.TELL:
					// print
				case tokenEnum.GIVE:
					// return
					return;
			}

			this.#advance();
		}
	}
}