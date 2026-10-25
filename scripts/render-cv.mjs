#!/usr/bin/env node
/**
 * Renders documents/cv/cv.html to a print-ready A4 PDF using the Edge/Chrome
 * binary already installed on the machine (no extra packages, no downloads).
 *
 *   npm run cv
 *
 * Also writes preview.png (both pages, print media) so layout can be reviewed
 * without opening the PDF.
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const cwd = path.join(root, "documents", "cv");
const htmlPath = path.join(cwd, "cv.html");
const pdfPath = path.join(cwd, "Marc-Gian-Reantaso-CV.pdf");
const previewPath = path.join(cwd, "preview.png");
const portraitPath = path.join(root, "public", "images", "portrait.jpg");

const BROWSERS = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].filter(Boolean);

const MM_TO_PX = 96 / 25.4;
const A4_WIDTH_PX = Math.round(210 * MM_TO_PX); // 794
const PAGE_BOX_PX = (297 - 15 - 13) * MM_TO_PX; // printable height: 269mm
const CONTENT_WIDTH_PX = 210 - 15 - 15; // 180mm between page margins

// Blocks that must not be split by a page break.
const BREAK_SENSITIVE = "p, li, h2, h3, header, .entry, .cert-group, .edu-head, .award-line";

function findBrowser() {
  const found = BROWSERS.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      `No Chromium browser found. Set BROWSER_PATH to an msedge.exe or chrome.exe path.\nChecked:\n${BROWSERS.join("\n")}`,
    );
  }
  return found;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFile(file, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (existsSync(file)) {
      const contents = await fs.readFile(file, "utf8").catch(() => "");
      if (contents.trim().length > 0) return contents;
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${file}`);
}

/** Minimal CDP client over the built-in WebSocket (Node 22+). */
function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();
  const listeners = new Set();
  let nextId = 1;

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (typeof message.id === "number" && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(`${message.error.message} (${message.error.code})`));
      else resolve(message.result);
      return;
    }
    for (const listener of listeners) listener(message);
  });

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve());
    socket.addEventListener("error", () => reject(new Error("CDP socket error")));
  });

  return {
    ready,
    send(method, params = {}, sessionId) {
      const id = nextId++;
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      socket.send(JSON.stringify(payload));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    on(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close() {
      socket.close();
    },
  };
}

function pageCount(pdf) {
  const matches = pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 0;
}

function mediaBox(pdf) {
  const match = pdf.toString("latin1").match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/);
  return match ? match.slice(1).map(Number) : null;
}

async function main() {
  if (!existsSync(htmlPath)) throw new Error(`Missing source: ${htmlPath}`);
  if (!existsSync(portraitPath)) throw new Error(`Missing photo: ${portraitPath}`);

  const browser = findBrowser();
  const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), "cv-render-"));
  const child = spawn(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let client;
  try {
    const portFile = path.join(profileDir, "DevToolsActivePort");
    const [port, wsPath] = (await waitForFile(portFile)).trim().split(/\r?\n/);
    client = connect(`ws://127.0.0.1:${port}${wsPath}`);
    await client.ready;

    const { targetId } = await client.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await client.send("Target.attachToTarget", { targetId, flatten: true });

    const send = (method, params) => client.send(method, params, sessionId);
    const loaded = new Promise((resolve) => {
      const off = client.on((message) => {
        if (message.sessionId === sessionId && message.method === "Page.loadEventFired") {
          off();
          resolve();
        }
      });
      setTimeout(() => {
        off();
        resolve();
      }, 15000);
    });

    await send("Page.enable", {});
    await send("Page.navigate", { url: pathToFileURL(htmlPath).href });
    await loaded;

    // 1. Screen preview at true A4 width: body carries the 15mm page padding,
    //    so line breaking matches the printed layout exactly.
    await send("Emulation.setDeviceMetricsOverride", {
      width: A4_WIDTH_PX,
      height: 1123,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await send("Emulation.setEmulatedMedia", { media: "screen" });
    await sleep(400);

    const { result } = await send("Runtime.evaluate", {
      expression: `JSON.stringify({
        images: Array.from(document.images).map((img) => ({ src: img.getAttribute("src"), loaded: img.complete && img.naturalWidth > 0 })),
        links: document.links.length,
        text: document.body.innerText.trim().length
      })`,
      returnByValue: true,
    });
    const stats = JSON.parse(result.value);

    const { cssContentSize } = await send("Page.getLayoutMetrics", {});
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width: Math.ceil(cssContentSize.width),
        height: Math.ceil(cssContentSize.height),
        scale: 1,
      },
    });
    await fs.writeFile(previewPath, Buffer.from(shot.data, "base64"));

    // 2. Print media at the real content width for pagination checks.
    await send("Emulation.setDeviceMetricsOverride", {
      width: Math.round(CONTENT_WIDTH_PX * MM_TO_PX),
      height: 1123,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Emulation.setEmulatedMedia", { media: "print" });
    await sleep(300);

    const auditExpression = `(() => {
      const pageBox = ${PAGE_BOX_PX.toFixed(2)};
      const selectors = ${JSON.stringify(BREAK_SENSITIVE)};
      const set = new Set(document.querySelectorAll(selectors));
      // Leaf blocks only: an article/group never breaks because its children carry the rule.
      const atoms = [...set]
        .filter((el) => ![...set].some((other) => other !== el && el.contains(other)))
        .sort((a, b) =>
          a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
        );
      const label = (el) =>
        ((el.innerText || "").replace(/\\s+/g, " ").trim() || el.tagName.toLowerCase()).slice(0, 52);

      const breaks = [];
      const oversized = [];
      let page = 1;
      let shift = 0;
      let previous = "";
      for (const el of atoms) {
        const rect = el.getBoundingClientRect();
        let top = rect.top + window.scrollY + shift;
        const height = rect.height;
        if (height > pageBox) {
          oversized.push({ tag: el.tagName.toLowerCase(), label: label(el) });
          continue;
        }
        if (top + height > page * pageBox + 0.5) {
          const pageTop = (page - 1) * pageBox;
          shift += pageTop - top;
          top = pageTop;
          page += 1;
          breaks.push({ page, startsWith: label(el), follows: previous });
        }
        previous = label(el);
      }
      const used = atoms.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
      const wideLabels = [...document.querySelectorAll(".skill .k, .compact .k, .contact")]
        .filter((el) => el.scrollWidth > el.clientWidth + 0.5)
        .map((el) => el.textContent.trim().slice(0, 40));
      return JSON.stringify({
        pages: page,
        breaks,
        oversized,
        flowHeight: Math.ceil(document.documentElement.scrollHeight),
        wideLabels,
        overflowX: Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
        contentHeight: Math.ceil(used),
      });
    })()`;

    const auditResult = await send("Runtime.evaluate", {
      expression: auditExpression,
      returnByValue: true,
    });
    const audit = JSON.parse(auditResult.result.value);

    const { data } = await send("Page.printToPDF", {
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });
    const pdf = Buffer.from(data, "base64");
    await fs.writeFile(pdfPath, pdf);

    const pages = pageCount(pdf);
    const box = mediaBox(pdf);
    const boxMm = box ? `${((box[2] - box[0]) / 72) * 25.4} × ${((box[3] - box[1]) / 72) * 25.4} mm` : "unknown";

    console.log(`Rendered: ${path.relative(root, pdfPath)}`);
    console.log(`  size      ${(pdf.length / 1024).toFixed(0)} KB`);
    console.log(`  pages     ${pages}`);
    console.log(`  page box  ${boxMm}`);
    console.log(`  content   ${audit.flowHeight}px = ${(audit.flowHeight / PAGE_BOX_PX).toFixed(2)} printable pages`);
    console.log(`  text      ${stats.text} characters, ${stats.links} links`);
    for (const image of stats.images) {
      console.log(`  image     ${image.loaded ? "ok" : "MISSING"} ${image.src}`);
      if (!image.loaded) process.exitCode = 1;
    }
    console.log(`Preview:  ${path.relative(root, previewPath)}`);

    for (const entry of audit.breaks) {
      console.log(`  break     page ${entry.page} starts with "${entry.startsWith}"`);
    }

    if (audit.wideLabels.length > 0) {
      console.warn(`  layout    label column overflow: ${audit.wideLabels.join(", ")}`);
      process.exitCode = 1;
    }

    if (audit.overflowX > 0) {
      console.warn(`  layout    horizontal overflow of ${audit.overflowX}px`);
      process.exitCode = 1;
    }

    if (audit.oversized.length > 0) {
      console.warn("  layout    block(s) taller than one page and will be split:");
      for (const block of audit.oversized) {
        console.warn(`            <${block.tag}> ${block.label}`);
      }
      process.exitCode = 1;
    }

    if (pages !== 2) {
      console.warn(`Warning: expected 2 pages, got ${pages}.`);
      process.exitCode = 1;
    }
  } finally {
    try {
      await client?.send("Browser.close");
    } catch {
      child.kill();
    }
    client?.close();
    await sleep(300);
    await fs.rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
