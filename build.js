import fs from 'fs-extra';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
	const outputFolder = path.join(__dirname, 'dest');
	await fs.remove(outputFolder);
	await fs.ensureDir(outputFolder);

	// Copy code
	await fs.copy(path.join(__dirname, 'README.md'), path.join(outputFolder, 'README.txt'));
	await fs.copy(path.join(__dirname, 'index.js'), path.join(outputFolder, 'index.js'));
	await fs.copy(path.join(__dirname, 'spam'), path.join(outputFolder, 'spam'));
	await fs.copy(path.join(__dirname, 'node_modules'), path.join(outputFolder, 'node_modules'));
	await fs.copy(process.execPath, path.join(outputFolder, 'node.exe'));

	// Create data placeholders
	await fs.writeFile(path.join(outputFolder, 'wardedStories.json'), JSON.stringify(["storyId1", "storyId2"], null, '\t'), 'utf8');
	await fs.writeFile(path.join(outputFolder, 'credentials.json'), JSON.stringify({
		username: "exampleUsername",
		password: "examplePassword"
	}, null, '\t'), 'utf8');

	// Create start scripts
	const packageJson = await fs.readJson(path.join(__dirname, 'package.json'));
	await fs.writeFile(path.join(outputFolder, 'run.cmd'), packageJson.scripts['start'], 'utf8');
	await fs.writeFile(path.join(outputFolder, 'run-log.cmd'), packageJson.scripts['start-log'], 'utf8');
	await fs.writeFile(path.join(outputFolder, 'run-dry.cmd'), packageJson.scripts['start-dry'], 'utf8');
}

init().catch(console.error);
