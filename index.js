import Akun from 'akun-api';
import fs from 'fs-extra';
import escapeRegExp from 'lodash.escaperegexp';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDryRun = process.argv.includes('--dry');

function log(message) {
	console.log(`[${Date.now()}] ${message}`);
}

async function getSpamPatterns() {
	const inputDir = path.join(__dirname, 'spam');

	const filenames = await fs.readdir(inputDir);
	return Promise.all(filenames.map(async (filename) => {
			const content = await fs.readFile(path.join(inputDir, filename), 'utf8');
			const isRegex = path.extname(filename) === '.regex';
			return {
				name: filename,
				pattern: isRegex ? new RegExp(content, 'i') : new RegExp(escapeRegExp(content), 'i')
			};
		})
	);
}

async function ward(akun, storyId, spamPatterns) {
	const handleChatNode = (node) => {
		for (const spamPattern of spamPatterns) {
			if (node.body && spamPattern.pattern.test(node.body)) {
				log(`Ward pattern "${spamPattern.name}" caught node id "${node.id}" posted by user "${node.username}" with user id "${node.userId}" and body starting:\n${node.body.slice(0, 100)}`);
				if (!isDryRun) {
					akun.ban(storyId, node.id).catch(log);
					akun.deleteChatNodeFromStory(storyId, node.id).catch(log);
				}
				break;
			}
		}
	};
	const handleChoiceNode = (node) => {
		if (node.type !== 'choice') {
			return;
		}
		for (let choiceId = 0; choiceId < node.choiceValues.length; choiceId++) {
			const choiceValue = node.choiceValues[choiceId];
			for (const spamPattern of spamPatterns) {
				if (spamPattern.pattern.test(choiceValue)) {
					log(`Ward pattern "${spamPattern.name}" caught choice node id "${node.id}" with choice id "${choiceId}" and choice starting:\n${choiceValue.slice(0, 100)}`);
					if (!isDryRun) {
						akun.removeChoiceNodeChoice(node.id, choiceId, 'akun-spam-ward').catch(log);
					}
					break;
				}
			}
		}
	};
	let client;
	try {
		client = await akun.join(storyId);
	} catch (err) {
		log(`Unable to join story with id ${storyId} due to:\n${err}\n\n(Is the story ID listed in wardedStories.json correct?)`);
		return;
	}
	client.chatThread.on('chat', handleChatNode);
	client.chatThread.history.nodes.forEach(handleChatNode);
	client.storyThread.on('choiceUpdated', handleChoiceNode);
	client.storyThread.history.nodes.forEach(handleChoiceNode);
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
	if (isDryRun) {
		log(`Operating in dry run mode: logs indicate which posts would be caught by current spam patterns but no bans or deletions are enacted`);
	}
}

init().catch(log);
