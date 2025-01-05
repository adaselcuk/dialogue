class Stmt {
  constructor() {
    if (new.target === Stmt) {
      throw new TypeError('Cannot instantiate Stmt directly');
    }
  }
}

class Visitor {
  visitExpressionStmt(stmt) {}
  visitPrintStmt(stmt) {}
}

class Expression extends Stmt {
  constructor(expression) {
    this.expression = expression;
  }
  accept(visitor) {
    return visitor.visitExpressionStmt(this);
  }
}

class Print extends Stmt {
  constructor(expression) {
    this.expression = expression;
  }
  accept(visitor) {
    return visitor.visitPrintStmt(this);
  }
}

