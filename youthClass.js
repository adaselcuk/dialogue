const YouthCallable = require("./callable");
const YouthInstance = require("./instance");

class YouthClass extends YouthCallable{
	constructor(name){
		this.name = name;
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