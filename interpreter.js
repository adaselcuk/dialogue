const { Visitor } = require('./Expr.js');
const { tokenEnum } = require('./tokenizer.js');

class Interpreter extends Visitor {
	// need to define visit methods for all expression types
	constructor() {
		super();
	} 

	visitLiteralExpr(expr){
		// a literal is a bit of syntax that produces a value
		// literal comes from parser's domain
		return expr.value;
	}

	visitGroupingExpr(expr){
		// grouping - the node you get when you have a parenthesized expression
		return this.#evaluate(expr.expression);
		// repeatedly evaluate the expression until you get a value
	}

	#evaluate(expr){
		return expr.accept(this);
	}

	visitUnaryExpr(expr){
		// unary expressions have a single subexpression that must be evaluated first
		const right = this.#evaluate(expr.right);

		switch (expr.operator.type){
			case tokenEnum.MINUS:
				// would i do 'MINUS' or tokenEnum.MINUS?
				return -right;
			case tokenEnum.BANG:
				return !this.#isTruthy(right);
		}

		return null;
	}

}