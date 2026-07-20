import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

function gameUrl() {
  const url = new URL(process.env.GAME_URL || 'http://localhost:4173/AshenCrownRPG/');
  url.searchParams.set('testMode', '1');
  return url.href;
}

async function pressTouch(locator, options = {}) {
  const box = await locator.boundingBox();
  assert.ok(box, 'missing touch target');
  const x = options.x ?? box.x + box.width / 2;
  const y = options.y ?? box.y + box.height / 2;
  const pointerId = options.pointerId ?? 41;
  await locator.dispatchEvent('pointerdown', {
    pointerId,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    buttons: 1,
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
  });
  await locator.dispatchEvent('pointerup', {
    pointerId,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    buttons: 0,
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
  });
}

function overlaps(a, b, gutter = 4) {
  return !(a.x + a.width + gutter <= b.x || b.x + b.width + gutter <= a.x || a.y + a.height + gutter <= b.y || b.y + b.height + gutter <= a.y);
}

async function assertCanvasPixels(page, label) {
  await page.waitForTimeout(250);
  const stats = await page.locator('canvas').evaluate(canvas => {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const width = Math.min(96, canvas.width);
    const height = Math.min(96, canvas.height);
    const x = Math.max(0, Math.floor(canvas.width / 2 - width / 2));
    const y = Math.max(0, Math.floor(canvas.height / 2 - height / 2));
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let alphaPixels = 0;
    let min = 255;
    let max = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 0) alphaPixels += 1;
      const luminance = Math.round(pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722);
      min = Math.min(min, luminance);
      max = Math.max(max, luminance);
    }
    return { alphaPixels, range: max - min, width, height };
  });
  assert.ok(stats.alphaPixels > stats.width * stats.height * 0.9, `${label} canvas has transparent or missing pixels: ${JSON.stringify(stats)}`);
  assert.ok(stats.range > 8, `${label} canvas appears blank or flat: ${JSON.stringify(stats)}`);
}

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const errors = [];
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
desktop.on('pageerror', error => errors.push(`desktop: ${error.message}`));
await desktop.goto(gameUrl(), { waitUntil: 'networkidle' });
assert.equal(await desktop.locator('canvas').count(), 1);
const webgl = await desktop.locator('canvas').evaluate(canvas => Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')));
assert.equal(webgl, true);
assert.match(await desktop.locator('#questText').innerText(), /촌장/);
await desktop.locator('#begin').click();
await desktop.keyboard.press('KeyE');
await desktop.keyboard.down('KeyW'); await desktop.waitForTimeout(350); await desktop.keyboard.up('KeyW');
await desktop.mouse.move(800, 450); await desktop.mouse.down({ button: 'right' }); await desktop.mouse.move(900, 420); await desktop.mouse.up({ button: 'right' });
await desktop.keyboard.press('Space');
const desktopVfx = await desktop.evaluate(() => window.__ashenCrownDebug.getVfxStats());
assert.ok(desktopVfx.slash >= 1, `desktop sword slash VFX did not spawn: ${JSON.stringify(desktopVfx)}`);
await assertCanvasPixels(desktop, 'desktop');
assert.equal(errors.length, 0, errors.join('\n'));
await desktop.screenshot({ path: 'dist/runtime-smoke.png' });
await desktop.close();

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
mobile.on('pageerror', error => errors.push(`mobile: ${error.message}`));
await mobile.goto(gameUrl(), { waitUntil: 'networkidle' });
assert.equal(await mobile.locator('.mobile-controls').isVisible(), true);
assert.equal(await mobile.locator('.skills').isVisible(), false);
await mobile.locator('#begin').click();
await mobile.locator('.dialogue').click();

const topbar = await mobile.locator('.topbar').boundingBox();
const quest = await mobile.locator('.quest').boundingBox();
const stickBox = await mobile.locator('[data-touch-role="stick"]').boundingBox();
const actionBox = await mobile.locator('.action-pad').boundingBox();
const zoomBox = await mobile.locator('.touch-zoom').boundingBox();
assert.ok(topbar && quest && stickBox && actionBox && zoomBox);
assert.equal(overlaps(topbar, quest), false, 'topbar and quest overlap');
assert.equal(overlaps(stickBox, actionBox), false, 'movement and action controls overlap');
assert.equal(overlaps(zoomBox, actionBox), false, 'zoom and action controls overlap');

const startPosition = await mobile.evaluate(() => window.__ashenCrownDebug.getPlayerPosition());
const stick = mobile.locator('[data-touch-role="stick"]');
const stickBounds = await stick.boundingBox();
const stickX = stickBounds.x + stickBounds.width / 2;
const stickY = stickBounds.y + stickBounds.height / 2;
await stick.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1, clientX: stickX, clientY: stickY, bubbles: true, cancelable: true });
await stick.dispatchEvent('pointermove', { pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1, clientX: stickX + 44, clientY: stickY - 52, bubbles: true, cancelable: true });
await mobile.waitForTimeout(450);
await stick.dispatchEvent('pointerup', { pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0, buttons: 0, clientX: stickX + 44, clientY: stickY - 52, bubbles: true, cancelable: true });
const movedPosition = await mobile.evaluate(() => window.__ashenCrownDebug.getPlayerPosition());
assert.ok(movedPosition.z < startPosition.z - 0.5, `joystick did not move forward: ${JSON.stringify({ startPosition, movedPosition })}`);

const canvas = mobile.locator('canvas');
const canvasBox = await canvas.boundingBox();
const cameraBefore = await mobile.evaluate(() => window.__ashenCrownDebug.getCameraState());
await canvas.dispatchEvent('pointerdown', { pointerId: 12, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1, clientX: canvasBox.x + 220, clientY: canvasBox.y + 360, bubbles: true, cancelable: true });
await canvas.dispatchEvent('pointermove', { pointerId: 12, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1, clientX: canvasBox.x + 312, clientY: canvasBox.y + 320, bubbles: true, cancelable: true });
await canvas.dispatchEvent('pointerup', { pointerId: 12, pointerType: 'touch', isPrimary: true, button: 0, buttons: 0, clientX: canvasBox.x + 312, clientY: canvasBox.y + 320, bubbles: true, cancelable: true });
const cameraAfter = await mobile.evaluate(() => window.__ashenCrownDebug.getCameraState());
assert.ok(Math.abs(cameraAfter.yaw - cameraBefore.yaw) > 0.1 || Math.abs(cameraAfter.pitch - cameraBefore.pitch) > 0.05, 'touch camera drag did not rotate');

const zoomBefore = await mobile.evaluate(() => window.__ashenCrownDebug.getCameraState());
await canvas.dispatchEvent('pointerdown', { pointerId: 21, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1, clientX: canvasBox.x + 160, clientY: canvasBox.y + 430, bubbles: true, cancelable: true });
await canvas.dispatchEvent('pointerdown', { pointerId: 22, pointerType: 'touch', isPrimary: false, button: 0, buttons: 1, clientX: canvasBox.x + 230, clientY: canvasBox.y + 430, bubbles: true, cancelable: true });
await canvas.dispatchEvent('pointermove', { pointerId: 21, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1, clientX: canvasBox.x + 120, clientY: canvasBox.y + 430, bubbles: true, cancelable: true });
await canvas.dispatchEvent('pointermove', { pointerId: 22, pointerType: 'touch', isPrimary: false, button: 0, buttons: 1, clientX: canvasBox.x + 270, clientY: canvasBox.y + 430, bubbles: true, cancelable: true });
await canvas.dispatchEvent('pointerup', { pointerId: 21, pointerType: 'touch', isPrimary: true, button: 0, buttons: 0, clientX: canvasBox.x + 120, clientY: canvasBox.y + 430, bubbles: true, cancelable: true });
await canvas.dispatchEvent('pointerup', { pointerId: 22, pointerType: 'touch', isPrimary: false, button: 0, buttons: 0, clientX: canvasBox.x + 270, clientY: canvasBox.y + 430, bubbles: true, cancelable: true });
const zoomAfterPinch = await mobile.evaluate(() => window.__ashenCrownDebug.getCameraState());
assert.ok(zoomAfterPinch.distance < zoomBefore.distance, 'pinch zoom did not move camera closer');
await pressTouch(mobile.locator('[data-touch-action="zoomOut"]'));
const zoomAfterButton = await mobile.evaluate(() => window.__ashenCrownDebug.getCameraState());
assert.ok(zoomAfterButton.distance > zoomAfterPinch.distance, 'zoom button did not move camera back');

await mobile.evaluate(() => window.__ashenCrownDebug.setPlayerPosition(-3, 12));
await pressTouch(mobile.locator('[data-touch-action="interact"]'));
assert.match(await mobile.locator('.dialogue h3').innerText(), /오르벤/);
const dialogueBox = await mobile.locator('.dialogue').boundingBox();
assert.equal(overlaps(dialogueBox, actionBox), false, 'dialogue overlaps action controls');
assert.equal(overlaps(dialogueBox, stickBox), false, 'dialogue overlaps movement controls');
await mobile.locator('.dialogue').click();
await mobile.locator('.dialogue').click();
assert.equal((await mobile.evaluate(() => window.__ashenCrownDebug.getGameState())).phase, 'defeat_scouts');

await mobile.evaluate(() => window.__ashenCrownDebug.setPlayerPosition(-7, 2));
const enemyBefore = await mobile.evaluate(() => window.__ashenCrownDebug.getEnemyHealths().find(enemy => !enemy.boss).hp);
await pressTouch(mobile.locator('[data-touch-action="attack"]'));
const enemyAfter = await mobile.evaluate(() => window.__ashenCrownDebug.getEnemyHealths().find(enemy => !enemy.boss).hp);
assert.ok(enemyAfter < enemyBefore, 'attack button did not damage nearby enemy');
const attackVfx = await mobile.evaluate(() => window.__ashenCrownDebug.getVfxStats());
assert.ok(attackVfx.slash >= 1 && attackVfx.impact >= 1 && attackVfx.spark >= 1, `mobile attack VFX did not spawn around hit: ${JSON.stringify(attackVfx)}`);
await pressTouch(mobile.locator('[data-touch-action="skill"]'));
await assert.doesNotReject(() => mobile.locator('.toast').waitFor({ timeout: 1000 }));
const skillVfx = await mobile.evaluate(() => window.__ashenCrownDebug.getVfxStats());
assert.ok(skillVfx.shockwave >= 1, `mobile skill shockwave VFX did not spawn: ${JSON.stringify(skillVfx)}`);
await mobile.evaluate(() => window.__ashenCrownDebug.damagePlayer(70));
const beforeHeal = await mobile.evaluate(() => window.__ashenCrownDebug.getGameState());
await pressTouch(mobile.locator('[data-touch-action="heal"]'));
const afterHeal = await mobile.evaluate(() => window.__ashenCrownDebug.getGameState());
assert.ok(afterHeal.hp > beforeHeal.hp, 'heal button did not restore HP');
assert.ok(afterHeal.potions < beforeHeal.potions, 'heal button did not consume a potion');
await assertCanvasPixels(mobile, 'mobile');

assert.equal(errors.length, 0, errors.join('\n'));
await mobile.screenshot({ path: 'dist/runtime-mobile-smoke.png', fullPage: true });
await mobile.close();
await browser.close();
console.log('PASS: desktop WebGL controls plus mobile joystick, camera drag, pinch/button zoom, action buttons, layout and zero page errors');
