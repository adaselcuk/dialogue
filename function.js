const { YouthCallable } = require('./callable');
const { Return } = require('./return');

class YouthFunction extends YouthCallable {
	#declaration;
	#closure;

	constructor(declaration, closure){
		super();
		this.#declaration = declaration;
		this.#closure = closure;
	}

	call(interpreter, args){
		const environment = new Environment(this.#closure);
		for (let i = 0; i < this.#declaration.params.length; i++){
			environment.define(this.#declaration.params[i].lexeme, args[i]);
		}

		try {
			interpreter.executeBlock(this.#declaration.body, environment);
		} catch (returnValue){
			return returnValue.value;
		}

		return null;
	}

	arity(){
		return this.#declaration.params.length;
	}

	toString() {
		return `<fn ${this.#declaration.name.lexeme}>`;
	}
}