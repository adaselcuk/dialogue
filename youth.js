import { error } from './errors.js';

const fs = require('fs');
const readline = require('readline');


class Youth {
	constructor () {
		this.hadError = false;
	}

	run (source) {
		const scanner = new Scanner(source);
		try {
			const tokens = scanner.scanTokens();
			if (this.hadError){
				// ensures not stuck in an error loop
				this.hadError = false;
				return;
			}
			// for now just prints tokens
			console.log(tokens);
		} catch (e) {
			this.hadError = true;
			console.error(e.message);
		}
	}

	error (line, msg) {
		this.hadError = true;
		throw error(msg, line);
		
	}

}