import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";

const outDir = resolve(process.cwd(), "out");
const rawBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
const basePath =
  rawBasePath && rawBasePath !== "/"
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";
const port = Number(process.env.PORT ?? 4173);

const MIME = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

if (!existsSync(outDir)) {
  console.error("No out/ directory found. Run `npm run build` first.");
  process.exit(1);
}

async function infoFor(path) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}

async function send(req, res, filePath, status = 200) {
  const info = await infoFor(filePath);
  if (!info?.isFile()) return false;

  const immutable = filePath.includes(`${sep}_next${sep}static${sep}`);
  res.writeHead(status, {
    "Content-Type": MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": info.size,
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
  });

  if (req.method === "HEAD") {
    res.end();
    return true;
  }

  createReadStream(filePath).pipe(res);
  return true;
}

function notFound(req, res, message) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(req.method === "HEAD" ? undefined : `${message}\n`);
}

const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? "/", `http://localhost:${port}`);
    let pathname;

    try {
      pathname = decodeURIComponent(requestUrl.pathname);
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Bad request\n");
      return;
    }

    if (basePath) {
      if (pathname === "/" || pathname === basePath) {
        res.writeHead(302, { Location: `${basePath}/` });
        res.end();
        return;
      }

      if (!pathname.startsWith(`${basePath}/`)) {
        notFound(
          req,
          res,
          `Not found. The exported site is mounted at http://localhost:${port}${basePath}/`,
        );
        return;
      }

      pathname = pathname.slice(basePath.length);
    }

    const relative = pathname.replace(/^\/+/, "");
    let target = resolve(join(outDir, relative));

    if (target !== outDir && !target.startsWith(outDir + sep)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden\n");
      return;
    }

    const info = await infoFor(target);

    if (info?.isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(301, { Location: `${requestUrl.pathname}/` });
        res.end();
        return;
      }
      target = join(target, "index.html");
    }

    if (await send(req, res, target)) return;

    const htmlFallback = `${target}.html`;
    if (await send(req, res, htmlFallback)) return;

    if (await send(req, res, join(outDir, "404.html"), 404)) return;

    notFound(req, res, "Not found");
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal server error\n");
  }
});

server.listen(port, () => {
  console.log(`\n  Portfolio preview: http://localhost:${port}${basePath}/\n`);
  console.log(`  Serving ${outDir}\n`);
});
