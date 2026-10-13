const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ 
  dev, 
  hostname, 
  port,
  dir: __dirname 
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error en request:', req.url, err);
      res.statusCode = 500;
      res.end('Error interno del servidor');
    }
  })
    .once('error', (err) => {
      console.error('Error al iniciar servidor:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Turnero SaaS iniciado en puerto ${port}`);
    });
});
