// called by error method in Youth class in youth.js
const error = (msg, line) =>
	report(msg, "", line);

const report = (msg, where, line) => {
	// good practice to separate error generating and error reporting
	new Error(`I'm sorry, but you should have seen this coming: ${line}${where}: ${msg}`);
	hadError = true;
}
module.exports = { error };