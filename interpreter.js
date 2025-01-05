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
				checkNumberOperand(expr.operator, right);
				return -right;
			case tokenEnum.BANG:
				return !this.#isTruthy(right);
		}

		return null;
	}

	checkNumberOperand(operator, operand){
		if (typeof operand === 'number') return;
		throw new RuntimeError(operator, 'Operand must be a number');
	}

	#isTruthy(object){
		if (object == null) return false;
		if (typeof object === 'boolean') return object;
		return true;
	}

	visitBinaryExpr(expr){
		const left = evaluate(expr.left);
		const right = evaluate(expr.right);

		switch (expr.operator.type){
			case tokenEnum.MINUS:
				return left - right;
			case tokenEnum.SLASH:
				return left / right;
			case tokenEnum.STAR:
				return left * right;
			case tokenEnum.PLUS:
				// operator overload
				if (typeof left === 'number' && typeof right === 'number') return left + right;
				if (typeof left === 'string' && typeof right === 'string') return left + right;
				break;
			case tokenEnum.GREATER:
				return left > right;
			case tokenEnum.GREATER_EQUAL:
				return left >= right;
			case tokenEnum.LESS:
				return left < right;
			case tokenEnum.LESS_EQUAL:
				return left <= right;
			case tokenEnum.BANG_EQUAL:
				return !this.#isEqual(left, right);
			case tokenEnum.EQUAL_EQUAL:
				return this.#isEqual(left, right);
		}

		return null;
	}

	#isEqual(a, b){
		if (a === null && b === null) return true;
		if (a === null) return false;
		
		return a === b;
	}

}