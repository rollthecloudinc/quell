import 'zone.js/dist/zone-node';

export { ngExpressEngine } from '@nguniversal/express-engine'; 
export { enableProdMode } from '@angular/core';
export { AppServerModule } from './app/app.server.module';
export { renderModule, renderModuleFactory } from '@angular/platform-server';

// import { renderModule, renderModuleFactory } from '@angular/platform-server';
// import { environment } from './environments/environment';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { AppServerModule } from './app/app.server.module';

// import 'localstorage-polyfill';
import * as express from 'express';
// const { ngExpressEngine, AppServerModule, enableProdMode } = require('../../../dist/ipe/server/main');
import { APP_BASE_HREF } from '@angular/common';
import { enableProdMode } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
// const winston  = require('winston');
// const  { Loggly } = require('winston-loggly-bulk');
const cookieParser = require('cookie-parser');

// @todo: Required for https to function locally. Need to revisit on prod environment.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  enableProdMode();
  const server = express();
  const distFolder = 'dist/ipe';
  const indexHtml = 'index';

  server.use(cookieParser());

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [
      { provide: APP_BASE_HREF, useValue: req.baseUrl },
      // { provide: REQUEST, useValue: req }
    ]});
  });

  return server;
}
