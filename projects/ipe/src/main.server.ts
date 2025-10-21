import 'zone.js/node';

import { enableProdMode } from '@angular/core';
import { AppServerModule } from './app/app.server.module';
import { HOST_NAME, PROTOCOL } from '@rollthecloudinc/utils';
import { renderModule } from '@angular/platform-server';

// 🚨 FINAL FIX: Import CommonEngine from the specific '/node' entry point
import { CommonEngine } from '@angular/ssr/node'; 

import express from 'express'; // Fixed: Use 'import express from' for correct typing
import { APP_BASE_HREF } from '@angular/common';
import { REQUEST } from './express.tokens';
import { join } from 'path';

const cookieParser = require('cookie-parser');
const proxy = require('express-http-proxy');

// Create the CommonEngine instance outside the app function for reuse
const commonEngine = new CommonEngine();

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  enableProdMode();
  const server = express();
  const distFolder = join(process.cwd(), 'dist/spear');
  const indexHtml = join(distFolder, 'index.html'); // Must point to the physical index.html

  server.use(cookieParser());

  // Set up view engine for Express
  server.set('view engine', 'html');
  server.set('views', distFolder);

  // aws service proxy (unchanged)
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

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes now use the CommonEngine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    
    commonEngine
      .render({
        bootstrap: AppServerModule,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: distFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          { provide: HOST_NAME, useValue: headers.host },
          { provide: PROTOCOL, useValue: 'https' },
          { provide: REQUEST, useValue: req }
        ],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}