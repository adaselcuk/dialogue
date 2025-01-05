class RuntimeError extends RuntimeException {
	constructor(token, message) {
		super(message);
		this.token = token;
	}
}