// unary expressions have single operand
// binary expressions have two operands
// literals have no operands

// trees enable the parser and interpreter to work together
// no associated behaviour

const { tokenEnum } = require('./tokenizer');
const { error } = require('./errors');
const { Youth } = require('./youth');
const { Stmt, Visitor } = require('./Stmt.js');
const { Expr, Visitor} = require('./Expr.js');

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
			statements.push(this.#declaration());
		}

		return statements;
	}

	#declaration(){
		try {
			if (this.#match(tokenEnum.LISTEN)) return this.#function("function");
			if (this.#match(typeEnum.IS)) return this.#varDeclaration();

			return this.#statement;
		} catch (error) {
			this.#synchronize();
			return null;
		}
	}

	#varDeclaration(){
		const name = this.#consume(tokenEnum.IDENTIFIER, "Expect identifier name");

		let initializer = null;
		// TODO : CHECK IF THERE IS TOKENENUM EQUAL IN BOOK??
		if (this.#match(tokenEnum.EQUAL)) {
			initializer = this.#expression();
		}

		this.#consume(tokenEnum.SEMICOLON, "Expect semicolon (';') after declaration");
		return new Stmt.Var(name, initializer);
	}

	#expression() {
		return this.#assignment();
	}

	#statement() {
		if (this.#match(tokenEnum.TELL)) return this.#printStatement();
		if (this.#match(tokenEnum.RETURN)) return this.#returnStatement();
		if (this.#match(tokenEnum.IF)) return this.#ifStatement();
		if (this.#match(tokenEnum.WHILE)) return this.#whileStatement();

		// IN BOOK THEY USE LEFT BRACE
		if (this.#match(tokenEnum.LEFT_PAREN)) return new Stmt.Block(this.#block());
		return this.#expressionStatement();
	}

	#forStatement() {
		this.#consume(tokenEnum.LEFT_PAREN, 'Expect "(" after "for".');

		let initializer; 
		if (this.#match(tokenEnum.SEMICOLON)) {
			initializer = null;
		} else if (this.#match(tokenEnum.IS)) {
			initializer = this.#varDeclaration();
		} else {
			initializer = this.#expressionStatement();
		}

		let condition = null;
		if (!this.#check(tokenEnum.SEMICOLON)) {
			condition = this.#expression();
		}
		this.#consume(tokenEnum.SEMICOLON, 'Expect ";" after loop condition.');

		let increment = null;
		if (!this.#check(tokenEnum.RIGHT_PAREN)) {
			increment = this.#expression();
		}
		this.#consume(tokenEnum.RIGHT_PAREN, 'Expect ")" after for clauses.');
		let body = this.#statement();
		if (increment !== null) {
			body = new Stmt.Block([body, new Stmt.Expression(increment)]);
		}

		if (condition === null) condition = new Expr.Literal(true);
		body = new Stmt.While(condition, body);
		
		if (initializer !== null) {
			body = new Stmt.Block([initializer, body]);
		}


		return body;
	}

	#ifStatement() {
		this.#consume(tokenEnum.LEFT_PAREN, 'Expect "(" after "if".');
		const condition = this.#expression();
		this.#consume(tokenEnum.RIGHT_PAREN, 'Expect ")" after if condition.');

		const thenBranch = this.#statement();
		let elseBranch = null;
		if (this.#match(tokenEnum.ELSE)) {
			elseBranch = this.#statement();
		}

		return new Stmt.If(condition, thenBranch, elseBranch);
	}

	#printStatement() {
		const value = this.#expression();
		this.#consume(tokenEnum.SEMICOLON, 'Expect ";" after value.');
		return new Stmt.Print(value);
	}

	#returnStatement() {
		const keyword = this.#previous();
		let value = null;

		if (!this.#check(tokenEnum.SEMICOLON)){
			value = this.#expression();
		}

		this.#consume(tokenEnum.SEMICOLON, 'Expect ";" after return value.');
		return new Stmt.Return(keyword, value);
	}

	#expressionStatement() {
		const expr = this.#expression();
		this.#consume(tokenEnum.SEMICOLON, 'Expect ";" after expression.');
		return new Stmt.Expression(expr);
	}

	#function(kind){
		const name = this.#consume(tokenEnum.IDENTIFIER, `Expect ${kind} name.`);
		this.#consume(tokenEnum.LEFT_PAREN, `Expect "(" after ${kind} name.`);
		const parameters = [];

		if (!this.#check(tokenEnum.RIGHT_PAREN)){
			do {
				if (parameters.length >= 255){
					this.#error(this.#peek(), 'Cannot have more than 255 parameters.');
				}

				parameters.push(this.#consume(tokenEnum.IDENTIFIER, 'Expect parameter name.'));
			} while (this.#match(tokenEnum.COMMA));
		}

		this.#consume(tokenEnum.RIGHT_PAREN, 'Expect ")" after parameters.');

		// DO NOT HAVE LEFT BRACE IN YOUTH LANGUAGE - FIX THIS LATER
		this.#consume(tokenEnum.LEFT_BRACE, `Expect "{" before ${kind} body.`);
		const body = this.#block();
		return new Stmt.Function(name, parameters, body);
	}

	#whileStatement() {
		this.#consume(tokenEnum.LEFT_PAREN, 'Expect "(" after "while".');
		const condition = this.#expression();
		this.#consume(tokenEnum.RIGHT_PAREN, 'Expect ")" after condition.');
		const body = this.#statement();

		return new Stmt.While(condition, body);
	}

	#block() {
		const statements = [];

		// IN BOOK RIGHT BRACE NOT RIGHT PAREN
		while (!this.#check(tokenEnum.RIGHT_PAREN) && !this.#isAtEnd()){
			statements.push(this.#declaration());
		}

		// IN BOOK THEY USE RIGHT BRACE
		this.#consume(tokenEnum.RIGHT_PAREN, 'Expect ")" after block.');
		return statements;
	}

	#assignment() {
		let expr = this.#or();

		if (this.#match(tokenEnum.EQUAL)) {
			const equals = this.#previous();
			const value = this.#assignment();

			if (expr instanceof Expr.Variable){
				const name = expr.name;
				return new Expr.Assign(name, value);
			}

			this.#error(equals, 'Invalid assignment target.');
		}

		return expr;
	}

	#or(){
		let expr = this.#and();

		while (this.#match(tokenEnum.OR)){
			const operator = this.#previous();
			const right = this.#and();
			expr = new Expr.Logical(expr, operator, right);
		}

		return expr;
	}

	#and(){
		let expr = this.#equality();

		while (this.#match(tokenEnum.AND)){
			const operator = this.#previous();
			const right = this.#equality();
			expr = new Expr.Logical(expr, operator, right);
		}

		return expr;
	}

	#equality(){
		let expr = this.#comparison();

		while (this.#match(tokenEnum.BANG_EQUAL, tokenEnum.EQUAL_EQUAL)){
			const operator = this.#previous();
			const right = this.#comparison();
			expr = new Expr.Binary(expr, operator, right);
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
			expr = new Expr.Binary(expr, operator, right);
		}

		return expr;
	}

	#term(){
		let expr = this.#factor();

		while (this.#match(tokenEnum.MINUS, tokenEnum.PLUS)){
			const operator = this.#previous();
			const right = this.#factor();
			expr = new Expr.Binary(expr, operator, right);
		}

		return expr;
	}

	#factor(){
		let expr = this.#unary();

		while (this.#match(tokenEnum.SLASH, tokenEnum.STAR)){
			const operator = this.#previous();
			const right = this.#unary();
			expr = new Expr.Binary(expr, operator, right);
		}

		return expr;
	}

	#unary(){
		if (this.#match(tokenEnum.BANG, tokenEnum.MINUS)){
			const operator = this.#previous();
			const right = this.#unary();
			return new Expr.Unary(operator, right);
		}

		return this.#call();
	}

	#finishCall(callee){
		const args = [];

		if (!this.#check(tokenEnum.RIGHT_PAREN)){
			do {
				// only need this for part 3 simplification though:
				if (args.length >= 255){
					this.#error(this.#peek(), 'Cannot have more than 255 arguments.');
				}
				args.push(this.#expression());
			} while (this.#match(tokenEnum.COMMA));
		}

		const paren = this.#consume(tokenEnum.RIGHT_PAREN, 'Expect ")" after arguments.');

		return new Expr.Call(callee, paren, args);
	}

	#call(){
		let expr = this.#primary();

		while (true){
			if (this.#match(tokenEnum.LEFT_PAREN)){
				expr = this.#finishCall(expr);
			} else {
				break;
			}
		}

		return expr;
	}

	#primary(){
		if (this.#match(tokenEnum.FALSE)) return new Expr.Literal(false);
		if (this.#match(tokenEnum.TRUE)) return new Expr.Literal(true);
		if (this.#match(tokenEnum.NIL)) return new Expr.Literal(null);

		if (this.#match(tokenEnum.NUMBER, tokenEnum.STRING)){
			return new Expr.Literal(this.#previous().literal);
		}

		if (this.#match(tokenEnum.IDENTIFIER)) {
			return new Expr.Variable(this.#previous());
		}

		if (this.#match(tokenEnum.LEFT_PAREN)){
			const expr = this.#expression();
			this.#consume(tokenEnum.RIGHT_PAREN, 'Expect ")" after expression.');
			return new Expr.Grouping(expr);
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