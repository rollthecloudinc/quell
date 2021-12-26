// import 'localstorage-polyfill';
import 'zone.js/dist/zone-node';
import * as express from 'express';

// servelewss includes
import 'binary-case';
import 'type-is';
import 'media-typer';
import 'mime-types';
import 'mime-db';

// const { ngExpressEngine, AppServerModule, enableProdMode } = require('../../../dist/ipe/server/main');
const { ngExpressEngine, AppServerModule, enableProdMode } = require('../server/main');
import { APP_BASE_HREF } from '@angular/common';
//const winston  = require('winston');
//const  { Loggly } = require('winston-loggly-bulk');

// Optimization
import * as compression from 'compression';
// import * as cors from 'cors';
import * as bodyParser from 'body-parser';
const cookieParser = require('cookie-parser');
const proxy = require('express-http-proxy');

// Serveless stuff.
const serverlessExpress = require('@vendia/serverless-express');
// const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const binaryMimeTypes = [
  'application/javascript',
  'application/json',
  'application/octet-stream',
  'application/xml',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/comma-separated-values',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'text/text',
  'text/xml',
  'image/x-icon',
  'image/svg+xml',
  'application/x-font-ttf',
  'font/ttf',
  'font/otf',
];

// @todo: Required for https to function locally. Need to revisit on prod environment.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  enableProdMode();
  const server = express();
  const distFolder = 'dist/ipe';
  const indexHtml = 'index';

  server.use(cookieParser());

  // All below app with use commands are optional but good to have as it improves performance and compresses the response.
  server.use(compression());
  // server.use(cors());
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({
      extended: true
  }));

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Open search AWS proxy
  server.use('/opensearch', proxy('https://search-classifieds-ui-dev-eldczuhq3vesgpjnr3vie6cagq.us-east-1.es.amazonaws.com', {
    proxyReqOptDecorator: proxyReqOpts => {
      proxyReqOpts.headers['host'] = 'search-classifieds-ui-dev-eldczuhq3vesgpjnr3vie6cagq.us-east-1.es.amazonaws.com';
      return proxyReqOpts;
    }
  }));

  // Example Express Rest API endpoints
  // app.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

// Create app
const a = app();
//a.use(awsServerlessExpressMiddleware.eventContext());
//const serverProxy = awsServerlessExpress.createServer(a, null, binaryMimeTypes);

//export const handler = (event, context) => awsServerlessExpress.proxy(serverProxy, event, context);

export const handler = serverlessExpress({ app: a })