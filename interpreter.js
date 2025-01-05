const { Visitor } = require('./Expr.js');
const { tokenEnum } = require('./tokenizer.js');
const { RuntimeError } = require('./RuntimeError.js');
const { Visitor: ExprVisitor } = require('./Expr.js');
const { Visitor: StmtVisitor } = require('./Stmt.js');

class Interpreter extends Expr.Visitor, Stmt.Visitor {
	// need to define visit methods for all expression types
	constructor() {
		super();
	} 

	#evaluate(expr){
		return expr.accept(this);
	}

	#execute(stmt){
		return stmt.accept(this);
	}

	#isEqual(a, b){
		if (a === null && b === null) return true;
		if (a === null) return false;
		
		return a === b;
	}

	#stringify(object){
		if (object === null) return 'emptiness';

		if (typeof object === 'number'){
			let text = object.toString();
			if (text.endsWith('.0')) text = text.substring(0, text.length - 2);
			return text;
		}
		return object.toString();
	}

	checkNumberOperand(operator, operand){
		if (typeof operand === 'number') return;
		throw new RuntimeError(operator, 'Operand must be a number');
	}

	checkNumberOperands(operator, left, right){
		if (typeof left === 'number' && typeof right === 'number') return;
		throw new RuntimeError(operator, 'Operands must be numbers');
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
				checkNumberOperands(expr.operator, left, right);
				return left - right;
			case tokenEnum.SLASH:
				checkNumberOperands(expr.operator, left, right);
				return left / right;
			case tokenEnum.STAR:
				checkNumberOperands(expr.operator, left, right);
				return left * right;
			case tokenEnum.PLUS:
				// operator overload
				if (typeof left === 'number' && typeof right === 'number') return left + right;
				if (typeof left === 'string' && typeof right === 'string') return left + right;
				throw new RuntimeError(expr.operator, 'Operands must be two numbers or two strings');
			case tokenEnum.GREATER:
				checkNumberOperands(expr.operator, left, right);
				return left > right;
			case tokenEnum.GREATER_EQUAL:
				checkNumberOperands(expr.operator, left, right);
				return left >= right;
			case tokenEnum.LESS:
				checkNumberOperands(expr.operator, left, right);
				return left < right;
			case tokenEnum.LESS_EQUAL:
				checkNumberOperands(expr.operator, left, right);
				return left <= right;
			case tokenEnum.BANG_EQUAL:
				return !this.#isEqual(left, right);
			case tokenEnum.EQUAL_EQUAL:
				return this.#isEqual(left, right);
		}

		return null;
	}

	visitExpressionStmt(stmt){
		this.#evaluate(stmt.expression);
		return null;
	}

	visitPrintStmt(stmt){
		const value = this.#evaluate(stmt.expression);
		console.log(this.#stringify(value));
		return null;
	}

	interpret(expression){
		try {
			for (let statement of expression){
				this.#execute(statement);
			}
		} catch (error) {
			Youth.runtimeError(error); // implement runtimeError method
		}
	}

}