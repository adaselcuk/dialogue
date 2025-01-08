class Environment {
	#values;

	constructor(enclosing = null){
		this.enclosing = enclosing;
		this.#values = {};
	}

	define(name, value){
		this.#values[name] = value;
	}

	get(name){
		if (this.#values[name.lexeme]) return this.#values[name.lexeme];

		if (this.enclosing !== null) return this.enclosing.get(name);

		throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
	}

	assign(name, value){
		if (this.#values[name.lexeme]){
			this.#values[name.lexeme] = value;
			return;
		}

		if (this.enclosing !== null){
			this.enclosing.assign(name, value);
			return;
		}

		throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
	}
}