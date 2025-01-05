import { error } from './errors.js';

const fs = require('fs');
const readline = require('readline');
const { tokenEnum } = require('./tokenizer.js');
const {AstPrinter} = require('./printer.js');
const { Interpreter } = require('./interpreter.js');
const { Scanner } = require('./scanner.js');
const { Parser } = require('./parser.js');


class Youth {
	hadError = false; 
	hadRuntimeError = false;
	#interpreter;
	
	constructor () {
		this.hadError = false;
		this.hadRuntimeError = false;
		this.#interpreter = new Interpreter();
	}

	#runFile(path){
		fs.readFile(path, 'utf8', (err, data) => {
			if (err){
				console.error(err);
				process.exit(1);
			}

			this.run(data);

			if (hadError){
				process.exit(65);
			}

			if (hadRuntimeError){
				process.exit(70);
			}
		});
	}

	#runPrompt() {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: '> '
		});

		rl.prompt();

		rl.on('line', (line) => {
			if (line.trim() === ''){
				rl.prompt();
				return;
			}

			Youth.run(line);
			hadError = false;
			rl.prompt();
		}).on('close', () => {
			console.log('Goodbye!');
			process.exit(0);
		})
	}

	run (source) {
		const scanner = new Scanner(source);
		const tokens = scanner.scanTokens();

		const parser = new Parser(tokens);
		const expression = parser.parse();

		if (this.hadError) return;
		if (this.hadRuntimeError) return;

		this.#interpreter.interpret(expression);
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

	runtimeError(error){
		console.log(`${error.message}\n[line ${error.token.line}]`);
		hadRuntimeError = true;
	}

}