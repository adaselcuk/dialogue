// called by error method in Youth class in youth.js
const error = (msg, line) =>
	report(msg, "", line);


module.exports = { error };