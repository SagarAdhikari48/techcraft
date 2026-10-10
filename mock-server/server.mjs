import jsonServer from 'json-server';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 3000;

const server   = jsonServer.create();
const router   = jsonServer.router(resolve(__dirname, 'db.json'));
const defaults = jsonServer.defaults({
  static: false,
  logger: true,
  noCors: false,
});

const rawRoutes = JSON.parse(
  readFileSync(resolve(__dirname, 'routes.json'), 'utf8')
);
const rewriter = jsonServer.rewriter(rawRoutes);

const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'https://techcraft-three.vercel.app',
];

server.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

server.use(defaults);
server.use(rewriter);
server.use(router);

server.listen(port, () => {
  console.log(`Mock API running on port ${port}`);
});
