#!/usr/bin/env node
// Drive headless Chromium over the DevTools protocol to screenshot real
// interaction states: device size, clicks, key presses, then capture.
// `chromium --headless --screenshot` cannot click, which is why this exists.
//
//   node scripts/cdp-shot.mjs --url http://localhost:3000/ --out mega.png \
//     --width 1440 --height 1000 --click "#trigger-programs"
//
// Flags: --url --out --width --height --dpr --wait --click <selector>
//        --keys <key-name> --scroll <selector>
// --move hovers without clicking, which is how the menu opens for a mouse
// user. --click, --move, --keys and --scroll repeat, in order.

import { spawn } from "node:child_process";
import { writeFile, rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function parseArgs(argv) {
  const out = { click: [], keys: [], scroll: [], move: [], width: 1440, height: 1000, dpr: 1, wait: 1200 };
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (value === undefined) continue;
    switch (flag) {
      case "--click": out.click.push(value); break;
      case "--move": out.move.push(value); break;
      case "--keys": out.keys.push(value); break;
      case "--scroll": out.scroll.push(value); break;
      case "--width": out.width = Number(value); break;
      case "--height": out.height = Number(value); break;
      case "--dpr": out.dpr = Number(value); break;
      case "--wait": out.wait = Number(value); break;
      default: out[flag.replace(/^--/, "")] = value;
    }
  }
  return out;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.url || !opts.out) {
  console.error("usage: cdp-shot.mjs --url <url> --out <file> [--width] [--height] [--click <selector>]...");
  process.exit(2);
}

const port = 9333;
const profile = await mkdtemp(join(tmpdir(), "cdp-profile-"));
const browser = spawn("/usr/bin/chromium", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForTarget(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // not up yet
    }
    await sleep(150);
  }
  throw new Error("chromium devtools endpoint never came up");
}

let id = 0;
const pending = new Map();
let ws;

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

function evaluate(expression) {
  return send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })
    .then((r) => {
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
      return r.result.value;
    });
}

const events = [];
const pageErrors = [];
let loaded = null;
function awaitLoad() {
  return new Promise((resolve) => { loaded = resolve; });
}

try {
  const wsUrl = await waitForTarget();
  ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", () => reject(new Error("websocket connect failed")), { once: true });
  });

  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message}: ${msg.error.data || ""}`));
      else resolve(msg.result);
      return;
    }
    events.push(msg.method);
    if (msg.method === "Runtime.consoleAPICalled" && (msg.params.type === "error" || msg.params.type === "warning")) {
      pageErrors.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description ?? a.type).join(" ")}`);
    }
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
      pageErrors.push(`log: ${msg.params.entry.text}`);
    }
    if (msg.method === "Page.loadEventFired" && loaded) loaded();
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: opts.width,
    height: opts.height,
    deviceScaleFactor: opts.dpr,
    mobile: opts.width < 700,
  });

  const done = awaitLoad();
  await send("Page.navigate", { url: opts.url });
  await done;
  await sleep(opts.wait);

  for (const selector of opts.scroll) {
    const y = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return -1; el.scrollIntoView({block: 'center'}); return 1; })()`);
    if (y === -1) throw new Error(`scroll target not found: ${selector}`);
    await sleep(250);
  }

  const centerOf = async (selector) => {
    const box = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null; const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height,
               text: (el.innerText || '').slice(0, 40) }; })()`);
    if (!box) throw new Error(`target not found: ${selector}`);
    if (box.w === 0 || box.h === 0) throw new Error(`target is not rendered (0x0) at this width: ${selector}`);
    return box;
  };

  for (const selector of opts.move) {
    const box = await centerOf(selector);
    // Two moves: the first crosses into the header, the second settles on the
    // target, which is what a real pointer does.
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y - 20 });
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
    await sleep(400);
    console.log(`hovered ${selector} -> "${box.text.replace(/\n/g, " ")}"`);
  }

  for (const selector of opts.click) {
    const box = await centerOf(selector);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: box.x, y: box.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: box.x, y: box.y, button: "left", clickCount: 1 });
    await sleep(350);
    console.log(`clicked ${selector} -> "${box.text.replace(/\n/g, " ")}"`);
  }

  const keyMap = { Escape: ["Escape", "\u001b", 27], Enter: ["Enter", "\r", 13], Tab: ["Tab", "\t", 9] };
  for (const name of opts.keys) {
    const [key, text, keyCode] = keyMap[name] || [name, name, 0];
    await send("Input.dispatchKeyEvent", { type: "keyDown", key, text, keyCode, windowsVirtualKeyCode: keyCode });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, text, keyCode, windowsVirtualKeyCode: keyCode });
    await sleep(300);
    console.log(`pressed ${name}`);
  }

  const shot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(opts.out, Buffer.from(shot.data, "base64"));
  console.log(`wrote ${opts.out} (${opts.width}x${opts.height})`);

  if (pageErrors.length) {
    console.log(`page console errors/warnings (${pageErrors.length}):`);
    for (const e of pageErrors.slice(0, 10)) console.log(`  ${e}`);
  } else {
    console.log("page console: clean");
  }
} catch (err) {
  console.error(`FAIL: ${err.message}`);
  process.exitCode = 1;
} finally {
  if (ws) ws.close();
  browser.kill("SIGTERM");
  await sleep(300);
  browser.kill("SIGKILL");
  await rm(profile, { recursive: true, force: true });
}
