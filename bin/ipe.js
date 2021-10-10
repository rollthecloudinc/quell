const { app } = require('../dist/ipe/server/main');
const port = process.env.PORT || 4000;

// Start up the Node server
const server = app();
server.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
