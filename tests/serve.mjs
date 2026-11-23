import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('dist/tour-site-client/browser');
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'};
http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');let file=path.join(root,decodeURIComponent(url.pathname));if(!file.startsWith(root)){res.writeHead(403);return res.end();}if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);}).listen(4300,'127.0.0.1');
