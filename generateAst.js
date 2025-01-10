const fs = require('fs');
const path = require('path');

function main(args) {
	if (args.length !== 1){
		console.error('Usage: generateAst <output directory>');
		process.exit(64);
	}
	const outputDir = args[0];

	defineAst(outputDir, "Expr", [
		"Assign   : name, value",
		"Binary   : left, operator, right",
		"Call	  : callee, paren, args",
		"Grouping : expression",
		"Literal  : value",
		"Logical  : left, operator, right",
		"Unary    : operator, right",
		"Variable : name"
		
	]);

	defineAst(outputDir, "Stmt", [
		"Block      : statements",
		"Expression : expression",
		"Function   : name, params, body",
		"If			: condition, thenBranch, elseBranch",
		"Print      : expression",
		"Var		: name, initializer",
		"While		: condition, body"
	]);
}

function defineAst(outputDir, baseName, types){
	// outputDir is string, baseName is string, types is array of strings
	const path = `${outputDir}/${baseName}.js`;
	const writer = fs.createWriteStream(path, {encoding: 'utf8'});

	// creates abstract class with given name - Expr
	writer.write(`class ${baseName} {\n`);
    writer.write(`  constructor() {\n`);
    writer.write(`    if (new.target === ${baseName}) {\n`);
    writer.write(`      throw new TypeError('Cannot instantiate ${baseName} directly');\n`);
    writer.write(`    }\n`);
    writer.write(`  }\n`);
    writer.write(`}\n\n`);

	defineVisitor(writer, baseName, types);

	// AST classes
	types.forEach(type => {
		const [className, fields] = type.split(':').map(s => s.trim());
		defineType(writer, baseName, className, fields);
	});

	// base accept() method
	writer.write(`  accept(visitor) {}\n`);

	writer.end();
}

function defineVisitor(writer, baseName, types){
	// writer is a stream, baseName is a string, types is an array of strings
	writer.write(`class Visitor {\n`);

	types.forEach(type => {
		const typeName = type.split(':')[0].trim();
		writer.write(`  visit${typeName}${baseName}(${baseName.toLowerCase()}) {}\n`);
	});

	writer.write(`}\n\n`);
}

function defineType(writer, baseName, className, fieldList){
	writer.write(`class ${className} extends ${baseName} {\n`);
	writer.write(`  constructor(${fieldList}) {\n`);
	const fields = fieldList.split(', ');
	fields.forEach(field => {
		const name = field.split(" ")[1];
		writer.write(`    this.${name} = ${name};\n`);
	})

	writer.write(`  }\n`);

	writer.write(`  accept(visitor) {\n`);
	writer.write(`    return visitor.visit${className}${baseName}(this);\n`);
	writer.write(`  }\n`);

	writer.write(`}\n\n`);
	fields.forEach(field => {
		writer.write(`  ${field};\n`);
	});

	writer.write(`}\n\n`);
}

main(process.argv.slice(2));