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

        shared: share({
          "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
          "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
          "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
          "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },

          // React experimental
          //"react": { singleton: true, strictVersion: false, requiredVersion: 'auto' },
          //"react-dom": { singleton: true, strictVersion: false, requiredVersion: 'auto' },

          // Uncommenting this results in compilation errors for building project ipe
          /*"@rollthecloudinc/utils": { singleton: true, strictVersion: true, requiredVersion: '0.0.24' },
          "@rollthecloudinc/attributes": { singleton: true, strictVersion: true, requiredVersion: '0.0.24' },
          "@rollthecloudinc/plugin": { singleton: true, strictVersion: true, requiredVersion: '0.0.24' },
          "@rollthecloudinc/material": { singleton: true, strictVersion: true, requiredVersion: '0.0.24' },
          "@rollthecloudinc/content": { singleton: true, strictVersion: true, requiredVersion: '0.0.24' },*/

          ...sharedMappings.getDescriptors()
        })
        
    }),
    sharedMappings.getPlugin()
  ],
};
