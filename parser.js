// unary expressions have single operand
// binary expressions have two operands
// literals have no operands

// trees enable the parser and interpreter to work together
// no associated behaviour

class Expr {
	constructor() {
		if (new.target === Expr) {
			// abstract class
			// TODO: change this error message later
			throw new TypeError('Cannot instantiate Expr directly');
		}
	}
}

class Binary extends Expr {
	constructor (left, operator, right) {
		// left is Expr, operator is Token, right is Expr
		// can make them private to prevent modification?? 
		this.left = left;
		this.operator = operator;
		this.right = right;
	}
}