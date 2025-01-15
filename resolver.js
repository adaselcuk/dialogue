const { Visitor: ExprVisitor } = require('./Expr.js');
const { Visitor: StmtVisitor } = require('./Stmt.js');

const creator = (Base, Mixin) => Mixin(Base);
const extender = (...Mixins) => Mixins.reduce(creator, class {});

const FunctionType = {
	NONE: 'NONE',
	FUNCTION: 'FUNCTION',
	METHOD: 'METHOD'
}

class Resolver extends extender(ExprVisitor, StmtVisitor){
	#interpreter
	#scopes = [];
	#currentFunction = FunctionType.NONE;

	constructor(interpreter){
		super();
		this.#interpreter = interpreter;
	}

	resolve(statements){
		for (const statement of statements){
			this.#resolveStmt(statement);
		}
	}

	visitBlockStmt(stmt){
		this.beginScope();
		this.resolve(stmt.statements);
		this.endScope();
		return null;
	}

	visitClassStmt(stmt){
		this.#declare(stmt.name);
		this.#define(stmt.name);

		for (const method of stmt.methods){
			const declaration = FunctionType.METHOD;
			this.#resolveFunction(method, declaration);
		}
		return null;
	}

	visitExpressionStmt(stmt){
		this.#resolveExpr(stmt.expression);
		return null;
	}

	visitFunctionStmt(stmt){
		this.#declare(stmt.name);
		this.#define(stmt.name);

		this.#resolveFunction(stmt, FunctionType.FUNCTION);
		return null;
	}

	visitIfStmt(stmt){
		this.#resolveExpr(stmt.condition);
		this.#resolveStmt(stmt.thenBranch);
		if (stmt.elseBranch !== null) this.#resolveStmt(stmt.elseBranch);
		return null;
	}

	visitPrintStmt(stmt){
		this.#resolveExpr(stmt.expression);
		return null;
	}

	visitReturnStmt(stmt){
		if (this.#currentFunction === FunctionType.NONE){
			Youth.error(stmt.keyword, `Cannot return from top-level code.`);
		}

		if (stmt.value !== null) this.#resolveExpr(stmt.value);
		return null;
	}

	visitVarStmt(stmt){
		this.#declare(stmt.name);
		if (stmt.initializer !== null){
			this.#resolveExpr(stmt.initializer);
		}

		this.#define(stmt.name);
		return null;
	}

	visitWhileStmt(stmt){
		this.#resolveExpr(stmt.condition);
		this.#resolveStmt(stmt.body);
		return null;
	}

	visitAssignExpr(expr){
		this.#resolveExpr(expr.value);
		this.#resolveLocal(expr, expr.name);
		return null;
	}

	visitBinaryExpr(expr){
		this.#resolveExpr(expr.left);
		this.#resolveExpr(expr.right);
		return null;
	}

	visitCallExpr(expr){
		this.#resolveExpr(expr.callee);

		for (const argument of expr.args){
			this.#resolveExpr(argument);
		}

		return null;
	}

	visitGetExpr(expr){
		this.#resolveExpr(expr.object);
		return null;
	}

	visitGroupingExpr(expr){
		this.#resolveExpr(expr.expression);
		return null;
	}

	visitLiteralExpr(expr){
		return null;
	}

	visitLogicalExpr(expr){
		this.#resolveExpr(expr.left);
		this.#resolveExpr(expr.right);
		return null;
	}

	visitSetExpr(expr){
		this.#resolveExpr(expr.value);
		this.#resolveExpr(expr.object);
		return null;
	}

	visitUnaryExpr(expr){
		this.#resolveExpr(expr.right);
		return null;
	}

	visitVariableExpr(expr){
		if (this.#scopes.length !== 0){
			if (this.#scopes[this.#scopes.length - 1].get(expr.name.lexeme) === false){
				throw new Error(`Cannot read local variable in its own initializer.`);
			}
		}

		this.#resolveLocal(expr, expr.name);
		return null;
	}

	#resolveStmt(stmt){
		stmt.accept(this);
	}

	#resolveExpr(expr){
		expr.accept(this);
	}

	#resolveFunction(stmt, type){
		const enclosingFunction = this.#currentFunction;
		this.#currentFunction = type;

		this.beginScope();
		for (const param of stmt.params){
			this.#declare(param);
			this.#define(param);
		}
		this.resolve(stmt.body);
		this.endScope();
		this.#currentFunction = enclosingFunction;
	}

	beginScope(){
		this.#scopes.push(new Map());
	}

	endScope(){
		this.#scopes.pop();
	}

	#declare(name){
		if (this.#scopes.length === 0) return;

		const scope = this.#scopes[this.#scopes.length - 1];
		if (scope.has(name.lexeme)){
			throw new Youth.error(`Variable with name '${name.lexeme}' already declared in this scope.`);
		}
		scope.set(name.lexeme, false);
	}

	#define(name){
		if (this.#scopes.length === 0) return;
		this.#scopes[this.#scopes.length - 1].set(name.lexeme, true);
	}

	#resolveLocal(expr, name){
		for (let i = this.#scopes.length - 1; i >= 0; i--){
			if (scopes[i].has(name.lexeme)){
				this.#interpreter.resolve(expr, this.#scopes.length - 1 - i);
				return;
			}
		}
	}
}

module.exports = Resolver;