const { Expr, Visitor, Binary, Grouping, Literal, Unary } = require('./Expr.js');
const { tokenEnum, Token } = require('./tokenizer.js');

class AstPrinter {
	print(expr){
		return expr.accept(this);
	}

	visitBinaryExpr(expr){
		return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
	}

	visitGroupingExpr(expr){
		return this.parenthesize('group', expr.expression);
	}

	visitLiteralExpr(expr){
		if (expr.value === null) return 'nothing'; // null
		return expr.value;
	}

	visitUnaryExpr(expr){
		return this.parenthesize(expr.operator.lexeme, expr.right);
	}

	parenthesize(name, ...exprs){
		let builder = `(${name}`;
		
		exprs.forEach(expr => {
			builder += ` ${expr.accept(this)}`;
		})

		builder += ')';

		return builder;
	}
}

function main() {
	const expression = new Binary(
		new Unary(
			new Token(tokenEnum.MINUS, '-', null, 1),
			new Literal(123)),
		new Token(tokenEnum.STAR, '*', null, 1),
		new Grouping(
			new Literal(45.67)
		)
	);

	const printer = new AstPrinter();
	console.log(printer.print(expression));
}

main()
