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
  visitCallExpr(expr) {}
  visitGetExpr(expr) {}
  visitGroupingExpr(expr) {}
  visitLiteralExpr(expr) {}
  visitLogicalExpr(expr) {}
  visitSetExpr(expr) {}
  visitThisExpr(expr) {}
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

class Call extends Expr {
  constructor(callee, paren, args){
    super();
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }

  accept(visitor){
    return visitor.visitCallExpr(this);
  }
}

class Get extends Expr {
  constructor(object, name){
    super();
    this.object = object;
    this.name = name;
  }

  accept(visitor){
    return visitor.visitGetExpr(this);
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

class Set extends Expr {
  constructor(object, name, value){
    super();
    this.object = object;
    this.name = name;
    this.value = value;
  }

  accept(visitor){
    return visitor.visitSetExpr(this);
  }
}

class This extends Expr {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  accept(visitor){
    return visitor.visitThisExpr(this);
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

Expr.Variable = Variable;
Expr.Assign = Assign;
Expr.Binary = Binary;
Expr.Call = Call;
Expr.Get = Get;
Expr.Grouping = Grouping;
Expr.Literal = Literal;
Expr.Logical = Logical;
Expr.Set = Set;
Expr.This = This;
Expr.Unary = Unary;


module.exports = { Expr, Visitor };