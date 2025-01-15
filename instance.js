const { RuntimeError } = require('./errors.js');

class YouthInstance {
	#klass;
	#fields = {};

	constructor(klass){
		this.#klass = klass;
	}

	findMethod(name){
		if (this.#fields.hasOwnProperty(name)){
			return this.#fields[name];
		}

		return null;
	}

	get(name){
		if (this.#fields.hasOwnProperty(name.lexeme)){
			return this.#fields[name.lexeme];
		}

		const method = this.#klass.findMethod(name.lexeme);
		if (method !== null) return method;

		throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
	}

	set(name, value){
		this.#fields[name.lexeme] = value;
	}

	toString(){
		return `${this.#klass.name} instance`;
	}
}