const { RuntimeError } = require('./errors.js');

class YouthInstance {
	#klass;
	#fields = {};

	constructor(klass){
		this.#klass = klass;
	}

	get(name){
		if (this.#fields.hasOwnProperty(name.lexeme)){
			return this.#fields[name.lexeme];
		}

		throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
	}

	set(name, value){
		this.#fields[name.lexeme] = value;
	}

	toString(){
		return `${this.#klass.name} instance`;
	}
}