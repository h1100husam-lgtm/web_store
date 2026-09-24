/* =========================================================================
   server.js  |  tiny local development server (no dependencies)
   -------------------------------------------------------------------------
   Why it exists:  the site uses `fetch`/localStorage features that need a
   real http origin, so opening index.html straight from the file system
   (file://) does not work.

   Run it with:   npm start            (or: node server.js)
   Then open:     http://localhost:3000
   ========================================================================= */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";                      // reachable from the preview too
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, status, file, type) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache"
  });
  fs.createReadStream(file).pipe(res);
}

function send404(res) {
  const notFound = path.join(ROOT, "404.html");
  if (fs.existsSync(notFound)) {
    send(res, 404, notFound, MIME[".html"]);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 - Not Found");
  }
}

const server = http.createServer(function (req, res) {
  let urlPath;

  try {
    urlPath = decodeURIComponent(req.url.split("?")[0]);
  } catch (err) {
    return send404(res);
  }

  if (urlPath === "/" || urlPath === "") urlPath = "/index.html";

  /* build the file path and make sure it stays inside the project folder */
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    return send404(res);
  }

  fs.stat(filePath, function (err, stats) {
    /* a directory request falls back to index.html inside it */
    let target = filePath;
    if (!err && stats.isDirectory()) {
      target = path.join(filePath, "index.html");
    }

    fs.readFile(target, function (readErr, data) {
      if (readErr) {
        console.log("404  " + req.url);
        return send404(res);
      }
      const ext = path.extname(target).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      console.log("200  " + req.url + "  (" + data.length + " bytes)");
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
      res.end(data);
    });
  });
});

server.listen(PORT, HOST, function () {
  console.log("");
  console.log("  Reda Store is running");
  console.log("  Local:    http://localhost:" + PORT);
  console.log("  Press Ctrl + C to stop");
  console.log("");
});
