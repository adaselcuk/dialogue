const error = (msg, line) =>
	new Error(`I'm sorry, but you should have seen this coming:${line}: ${msg}`);
module.exports = {
	error
}