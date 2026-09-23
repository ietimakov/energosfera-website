import { readFile } from 'node:fs/promises';
const worker = await readFile('dist/server/index.js', 'utf8');
if (!worker.includes('export default') || !worker.includes('fetch(request')) throw new Error('Worker entrypoint is missing a default fetch handler.');
