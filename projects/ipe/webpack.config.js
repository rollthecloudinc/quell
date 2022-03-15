const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, '../../tsconfig.json'),
  [/* mapped paths to share */]);

module.exports = {
  output: {
    uniqueName: "ipe",
    publicPath: "auto",
  },
  optimization: {
    runtimeChunk: false
  },   
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
        library: { type: "module" },

        // For remotes (please adjust)
        // name: "ipe",
        // filename: "remoteEntry.js",
        // exposes: {
        //     './Component': './projects/ipe/src/app/app.component.ts',
        // },        
        
        // For hosts (please adjust)
        /*remotes: {
          "fedMicroNg": "http://localhost:3000/remoteEntry.js"
        },*/

        shared: share({
          "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
          "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
          "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
          "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },

          /*"@ng-druid/utils": { singleton: true, strictVersion: true, requiredVersion: '0.0.11' },
          "@ng-druid/attributes": { singleton: true, strictVersion: true, requiredVersion: '0.0.11' },
          "@ng-druid/plugin": { singleton: true, strictVersion: true, requiredVersion: '0.0.11' },
          "@ng-druid/material": { singleton: true, strictVersion: true, requiredVersion: '0.0.11' },
          "@ng-druid/content": { singleton: true, strictVersion: true, requiredVersion: '0.0.11' },*/

          ...sharedMappings.getDescriptors()
        })
        
    }),
    sharedMappings.getPlugin()
  ],
};
