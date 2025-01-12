const { Expr, Visitor } = require('./Expr.js');
const { tokenEnum } = require('./tokenizer.js');
const { RuntimeError } = require('./RuntimeError.js');
const { Visitor: ExprVisitor } = require('./Expr.js');
const { Visitor: StmtVisitor } = require('./Stmt.js');
const { Environment } = require('./environment.js');
const { YouthCallable } = require('./callable.js');

const creator = (Base, Mixin) => Mixin(Base);
const extender = (...Mixins) => Mixins.reduce(creator, class {});

const ExprVisitorMixin = (Base) => class extends Base {
	visitLiteralExpr(expr){
		// a literal is a bit of syntax that produces a value
		// literal comes from parser's domain
		return expr.value;
	}

	visitLogicalExpr(expr){
		const left = this.evaluate(expr.left);

		if (expr.operator.type === tokenEnum.OR){
			if (this.isTruthy(left)) return left;
		} else {
			if (!this.isTruthy(left)) return left;
		}

		return this.evaluate(expr.right);
	}

	visitGroupingExpr(expr){
		// grouping - the node you get when you have a parenthesized expression
		return this.evaluate(expr.expression);
		// repeatedly evaluate the expression until you get a value
	}

	visitUnaryExpr(expr){
		// unary expressions have a single subexpression that must be evaluated first
		const right = this.evaluate(expr.right);

		switch (expr.operator.type){
			case tokenEnum.MINUS:
				// would i do 'MINUS' or tokenEnum.MINUS?
				checkNumberOperand(expr.operator, right);
				return -right;
			case tokenEnum.BANG:
				return !this.isTruthy(right);
		}

		return null;
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
				return !this.isEqual(left, right);
			case tokenEnum.EQUAL_EQUAL:
				return this.isEqual(left, right);
		}

		return null;
	}

	visitCallExpr(expr){
		const callee = this.evaluate(expr.callee);

		const args = [];
		for (const arg of expr.args){
			args.push(this.evaluate(arg));
		}
		
		if (!(callee instanceof YouthCallable)){
			throw new RuntimeError(expr.paren, 'Can only call functions and classes');
		}

		const func = callee;

		if (args.length !== func.arity()){
			throw new RuntimeError(expr.paren, `Expected ${func.arity()} arguments but got ${args.length}`);
		}
		return func.call(this, args);
	}

	visitVariableExpr(expr){
		return this.environment.get(expr.name);
	}

	visitAssignExpr(expr){
		const value = this.evaluate(expr.value);
		this.environment.assign(expr.name, value);
		return value;
	}
}

const StmtVisitorMixin = (Base) => class extends Base {
	visitBlockStmt(stmt){
		this.executeBlock(stmt.statements, new Environment(this.environment));
		return null;
	}

	visitExpressionStmt(stmt){
		this.evaluate(stmt.expression);
		return null;
	}

	visitFunctionStmt(stmt){
		const func = new YouthFunction(stmt, environment);
		this.environment.define(stmt.name.lexeme, func);
		return null;
	}

	visitIfStmt(stmt){
		if (this.isTruthy(this.evaluate(stmt.condition))){
			this.execute(stmt.thenBranch);
		} else if (stmt.elseBranch !== null) {
			this.execute(stmt.elseBranch);
		}
		return null;
	}

	visitPrintStmt(stmt){
		const value = this.evaluate(stmt.expression);
		console.log(this.stringify(value));
		return null;
	}

	visitReturnStmt(stmt){
		let value = null;
		if (stmt.value !== null) value = this.evaluate(stmt.value);

		throw new Return(value);
	}

	visitVarStmt(stmt){
		let value = null;
		if (stmt.initializer !== null) value = this.evaluate(stmt.initializer);
		this.environment.define(stmt.name.lexeme, value);
		return null;
	}

	visitWhileStmt(stmt){
		while (this.isTruthy(this.evaluate(stmt.condition))){
			this.execute(stmt.body);
		}

		return null;
	}
}

class Interpreter extends extender(ExprVisitor, StmtVisitor) {
	environment;

	constructor() {
		super();
		this.globals = new Environment();
		this.environment = globals;

		this.globals.define('clock', new YouthCallable({
			arity: () => 0,
			call: (interpreter, args) => (Date.now() / 1000.0),
			toString: () => "<native fn>"
		}));
	} 

	evaluate(expr){
		return expr.accept(this);
	}

	execute(stmt){
		return stmt.accept(this);
	}

	executeBlock(statements, environment){
		const previous = this.environment;
		try {
			this.environment = environment;

			for (const statement of statements){
				this.execute(statement);
			}
		} finally {
			this.environment = previous;
		}
	}

	isEqual(a, b){
		if (a === null && b === null) return true;
		if (a === null) return false;
		
		return a === b;
	}

	stringify(object){
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


	isTruthy(object){
		if (object == null) return false;
		if (typeof object === 'boolean') return object;
		return true;
	}


	interpret(expression){
		try {
			for (let statement of expression){
				this.execute(statement);
			}
		} catch (error) {
			Youth.runtimeError(error); // implement runtimeError method
		}
	}

}