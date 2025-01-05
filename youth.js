import { error } from './errors.js';

const fs = require('fs');
const readline = require('readline');
const { tokenEnum } = require('./tokenizer.js');
const {AstPrinter} = require('./printer.js');


class Youth {
	constructor () {
		this.hadError = false;
	}

	run (source) {
		const scanner = new Scanner(source);
		const tokens = scanner.scanTokens();

		const parser = new Parser(tokens);
		const expression = parser.parse();

		if (hadError) return;

		console.log(new AstPrinter().print(expression));
	}

	report (line, where, msg) {
		// good practice to separate error generating and error reporting
		new Error(`I'm sorry, but you should have seen this coming: ${line}${where}: ${msg}`);
		hadError = true;
	}

	error (token, msg) {
		if (token.type === tokenEnum.EOF){
			report(token.line, " at end", msg);
		} else {
			report(token.line, ` at '${token.lexeme}'`, msg);
		}
		
	}

}