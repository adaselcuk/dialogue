class Expr {
  constructor() {
    if (new.target === Expr) {
      // abstract class
      // todo: change this error message later - ESOTERIC!!!
      throw new TypeError('Cannot instantiate Expr directly');
    }
  }

  accept(visitor){
    throw new Error('accept() method must be implemented');
  }
}

class Visitor {
  visitAssignExpr(expr) {}
  visitBinaryExpr(expr) {}
  visitGroupingExpr(expr) {}
  visitLiteralExpr(expr) {}
  visitLogicalExpr(expr) {}
  visitUnaryExpr(expr) {}
  visitVariableExpr(expr) {}
}

class Assign extends Expr {
  constructor(name, value){
    super();
    this.name = name;
    this.value = value;
  }

  accept(visitor){
    return visitor.visitAssignExpr(this);
  }
}

class Binary extends Expr {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  accept(visitor) {
    return visitor.visitBinaryExpr(this);
  }
}

class Grouping extends Expr {
  constructor(expression) {
    super();
    this.expression = expression;
  }
  accept(visitor) {
    return visitor.visitGroupingExpr(this);
  }
}


class Literal extends Expr {
  constructor(value) {
    super();
    this.value = value;
  }
  accept(visitor) {
    return visitor.visitLiteralExpr(this);
  }
}

class Logical extends Expr {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
  accept(visitor) {
    return visitor.visitLogicalExpr(this);
  }
}


class Unary extends Expr {
  constructor(operator, right) {
    super();
    this.operator = operator;
    this.right = right;
  }
  accept(visitor) {
    return visitor.visitUnaryExpr(this);
  }
}

class Variable extends Expr {
  constructor(name){
    super();
    this.name = name;
  }

  accept(visitor){
    return visitor.visitVariableExpr(this);
  }
}


module.exports = { Expr, Visitor, Binary, Logical, Grouping, Literal, Unary, Variable, Assign };