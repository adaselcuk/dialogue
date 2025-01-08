class Stmt {
  constructor() {
    if (new.target === Stmt) {
      throw new TypeError('Cannot instantiate Stmt directly');
    }
  }

  accept(visitor) {
    throw new Error('accept() method must be implemented');
  }
}

class Visitor {
  visitExpressionStmt(stmt) {}
  visitPrintStmt(stmt) {}
  visitVarStmt(stmt) {}
}

class Expression extends Stmt {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  accept(visitor) {
    return visitor.visitExpressionStmt(this);
  }
}

class Print extends Stmt {
  constructor(expression) {
    super();
    this.expression = expression;
  }

  accept(visitor) {
    return visitor.visitPrintStmt(this);
  }
}

class Var extends Stmt {
  constructor(name, initializer) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept(visitor) {
    return visitor.visitVarStmt(this);
  }
}

module.exports = {
  Stmt,
  Visitor,
  Expression,
  Print,
  Var
};