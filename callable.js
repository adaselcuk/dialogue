class YouthCallable {
	constructor(){
		this.arity = 0;
	}
	call(interpreter, args){
		throw new Error('Must implement call method');
	}

	arity(){
		return this.arity;
	}
}