import 'zone.js/node';

export { ngExpressEngine } from '@nguniversal/express-engine'; 
export { enableProdMode } from '@angular/core';
export { AppServerModule } from './app/app.server.module';
export { HOST_NAME, PROTOCOL } from '@ng-druid/utils';
export { renderModule } from '@angular/platform-server';
// export { renderModule, renderModuleFactory } from '@angular/platform-server';

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
import { HOST_NAME, PROTOCOL } from '@ng-druid/utils';
import { join } from 'path';
// const winston  = require('winston');
// const  { Loggly } = require('winston-loggly-bulk');
const cookieParser = require('cookie-parser');
const proxy = require('express-http-proxy');

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

  // aws service proxy
  server.use('/awproxy', proxy(req => `https://${req.originalUrl.split('/')[3]}.${ req.originalUrl.split('/').length > 4 && req.originalUrl.split('/')[4].match(/^us\-(east|west)-[0-9]+$/gi) ? `${req.originalUrl.split('/')[4]}.` : '' }${req.originalUrl.split('/')[2]}.amazonaws.com` , {
    proxyReqPathResolver: req => {
      console.log(`current request path: ${req.url}`);
      console.log('split', req.url.split('/'));
      const newPath = '/' + (req.url.split('/').length > 3 && req.url.split('/')[3].match(/^us\-(east|west)-[0-9]+$/gi) ? req.url.split('/').slice(4).join('/') : req.url.split('/').slice(3).join('/'));
      console.log(`new request path: ${newPath}`);
      return newPath;
    },
    proxyReqOptDecorator: proxyReqOpts => {
      proxyReqOpts.headers['host'] = `${proxyReqOpts.path.split('/')[2]}.${ proxyReqOpts.path.split('/').length > 3 && proxyReqOpts.path.split('/')[3].match(/^us\-(east|west)\-[0-9]+$/gi) ? `${proxyReqOpts.path.split('/')[3]}.` : '' }${proxyReqOpts.path.split('/')[1]}.amazonaws.com`;
      return proxyReqOpts;
    }
  }));

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  // This is only needed in local dev environment remote environment should always use cdn.
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [
      { provide: APP_BASE_HREF, useValue: req.baseUrl },
      { provide: HOST_NAME, useValue: req.headers.host /*'e4cq5a4vfc.execute-api.us-east-1.amazonaws.com'*/ },
      { provide: PROTOCOL, useValue: 'https' },
      // { provide: HOST_NAME, useValue: 'localhost:4000' /*'e4cq5a4vfc.execute-api.us-east-1.amazonaws.com'*/ },
      // { provide: PROTOCOL, useValue: 'http' },
      { provide: REQUEST, useValue: req }
    ]});
  });

  return server;
}
