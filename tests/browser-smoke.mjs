import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto(process.env.GAME_URL || 'http://localhost:4173/', { waitUntil: 'networkidle' });
assert.equal(await page.locator('canvas').count(), 1);
const webgl = await page.locator('canvas').evaluate(canvas => Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')));
assert.equal(webgl, true);
assert.match(await page.locator('#questText').innerText(), /촌장/);
await page.locator('#begin').click();
await page.keyboard.press('KeyE');
await page.keyboard.down('KeyW'); await page.waitForTimeout(350); await page.keyboard.up('KeyW');
await page.mouse.move(800, 450); await page.mouse.down({ button: 'right' }); await page.mouse.move(900, 420); await page.mouse.up({ button: 'right' });
assert.equal(errors.length, 0, errors.join('\n'));
await page.screenshot({ path: 'dist/runtime-smoke.png' });
await browser.close();
console.log('PASS: WebGL canvas, intro interaction, keyboard movement, camera drag, HUD and zero page errors');
