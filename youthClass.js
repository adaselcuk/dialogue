const YouthCallable = require("./callable");
const YouthInstance = require("./instance");

class YouthClass extends YouthCallable{
	#methods = new Map();

	constructor(name, methods){
		this.name = name;
		this.#methods = methods;
	}

	findMethod(name) {
		if (this.#methods.has(name)) {
			return this.#methods.get(name);
		}

		return null;
	}

	toString(){
		return this.name;
	}

	call(interpreter, args){
		const instance = new YouthInstance(this);
		return instance;
	}

	arity(){
		return 0;
	}
}