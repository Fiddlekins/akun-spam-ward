import Akun from 'akun-api';
import fs from 'fs-extra';
import escapeRegExp from 'lodash.escaperegexp';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function log(message) {
	console.log(`[${Date.now()}] ${message}`);
}

async function getSpamPatterns() {
	const inputDir = path.join(__dirname, 'spam');

	const filenames = await fs.readdir(inputDir);
	const fileContents = await Promise.all(filenames.map((filename) => {
			return fs.readFile(path.join(inputDir, filename), 'utf8');
		})
	);
	return fileContents.map((content) => {
		return new RegExp(escapeRegExp(content));
	});
}

async function ward(akun, storyId, spamPatterns) {
	const handleChatNode = (node) => {
		for (const spamPattern of spamPatterns) {
			if (node.body && spamPattern.test(node.body)) {
				log(`Ward caught node id "${node.id}" posted by user "${node.username}" with user id "${node.userId}" and body starting:\n${node.body.slice(0, 100)}`);
				akun.ban(storyId, node.id).catch(log);
				akun.deleteChatNodeFromStory(storyId, node.id).catch(log);
			}
		}
	};
	const client = await akun.join(storyId);
	client.chatThread.on('chat', handleChatNode);
	client.chatThread.history.nodes.forEach(handleChatNode);
}

async function init() {
	const [spamPatterns, wardedStories, credentials] = await Promise.all([
		await getSpamPatterns(),
		await fs.readJson(path.join(__dirname, 'wardedStories.json')),
		await fs.readJson(path.join(__dirname, 'credentials.json'))
	]);
	const akunSettings = {
		hostname: 'fiction.live',
		connection: {
			hostname: 'rt.fiction.live'
		}
	};
	const akun = new Akun(akunSettings);
	await akun.login(credentials.username, credentials.password);
	for (const storyId of wardedStories) {
		ward(akun, storyId, spamPatterns).catch(log);
	}
	log(`Wards raised on stories: ${wardedStories.join(', ')}`);
}

init().catch(log);
