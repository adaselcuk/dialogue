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
  visitBlockStmt(stmt) {}
  visitExpressionStmt(stmt) {}
  visitFunctionStmt(stmt) {}
  visitIfStmt(stmt) {}
  visitPrintStmt(stmt) {}
  visitReturnStmt(stmt) {}
  visitVarStmt(stmt) {}
  visitWhileStmt(stmt) {}
}

class Block extends Stmt {
  constructor(statements) {
    super();
    this.statements = statements;
  }

  accept(visitor) {
    return visitor.visitBlockStmt(this);
  }
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

class Function extends Stmt {
  constructor(name, params, body) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept(visitor) {
    return visitor.visitFunctionStmt(this);
  }
}

class If extends Stmt {
  constructor(condition, thenBranch, elseBranch) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept(visitor) {
    return visitor.visitIfStmt(this);
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

class Return extends Stmt {
  constructor(keyword, value) {
    super();
    this.keyword = keyword;
    this.value = value;
  }

  accept(visitor) {
    return visitor.visitReturnStmt(this);
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

class While extends Stmt {
  constructor(condition, body) {
    super();
    this.condition = condition;
    this.body = body;
  }

  accept(visitor) {
    return visitor.visitWhileStmt(this);
  }
}

Stmt.Block = Block;
Stmt.Expression = Expression;
Stmt.Function = Function;
Stmt.If = If;
Stmt.Print = Print;
Stmt.Var = Var;
Stmt.While = While;
Stmt.Return = Return;

module.exports = { Stmt, Visitor };