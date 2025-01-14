const { RuntimeError } = require('./errors');

class Environment {
	#values;

	constructor(enclosing = null){
		this.enclosing = enclosing;
		this.#values = {};
	}

	define(name, value){
		this.#values[name] = value;
	}

	ancestor(distance){
		let environment = this;
		for (let i = 0; i < distance; i++){
			environment = environment.enclosing;
		}

		return environment;
	}

	getAt(distance, name){
		return this.ancestor(distance).#values[name];
	}

	assignAt(distance, name, value){
		this.ancestor(distance).#values[name] = value;
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