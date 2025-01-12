class Return extends RuntimeException {
  constructor(value) {
	super(null, null, false, false);
	this.value = value;
  }
}

module.exports = Return;