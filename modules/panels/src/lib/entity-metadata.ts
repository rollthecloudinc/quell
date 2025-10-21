//import { EntityMetadataMap } from '@ngrx/data';
import { isPlatformServer } from '@angular/common';
import { CrudEntityMetadataMap, CrudEntityQueryMapping } from '@rollthecloudinc/crud';
import { PanelsSettings } from './models/panels.models';

export const entityMetadataFactory = (platformId: Object, panelsSettings: PanelsSettings): CrudEntityMetadataMap => {
  return {
    PanelPageListItem: {
      entityName: 'PanelPageListItem',
      crud: {
        /*rest: {
          // ops: ['query'],
          params: {
            entityName: 'PanelPageListItem'
          }
        },*/
        /*aws_opensearch_template: {
          ops: ['query'],
          params: {
            id: 'panelpagelistitems',
            index: 'classified_panelpages',
            hits: true,
            source: true,
            // domain: 'search-classifieds-ui-dev-eldczuhq3vesgpjnr3vie6cagq',
            domain: panelsSettings.openSearchDomain,
            region: 'us-east-1'
          }
        },*/
        /*aws_opensearch_entity: {
          ops: ['create', 'update'],
          params: {
            index: 'classified_panelpages',
            // domain: 'search-classifieds-ui-dev-eldczuhq3vesgpjnr3vie6cagq',
            domain: panelsSettings.openSearchDomain,
            region: 'us-east-1'
          }
        },*/
        ...(isPlatformServer(platformId) ?
          {} :
          {
            idb_keyval: {
              params: {
                prefix: 'panelpage__'
              },
              queryMappings: new Map<string, CrudEntityQueryMapping>([
                // ['path', { defaultOperator: 'startsWith' }]
                ['site', { defaultOperator: 'term||wildcard' }],
                ['path', { defaultOperator: 'term||wildcard' }]
              ])
            }
          }
        ),
        /*aws_opensearch_entity: {
          ops: ['create', 'update', 'read', 'delete']
        },*/
        idb_keyval: {
          params: {
            prefix: 'panelpage__'
          },
          queryMappings: new Map<string, CrudEntityQueryMapping>([
            // ['path', { defaultOperator: 'startsWith' }]
            ['site', { defaultOperator: 'term||wildcard' }],
            ['path', { defaultOperator: 'term||wildcard' }]
          ])
        }
      }
    },
    PanelPage: {
      entityName: 'PanelPage',
      crud: {
        /*aws_s3_entity: {
          ops: ['query', 'create', 'update'],
          params: {
            // bucket: 'classifieds-ui-dev',
            bucket: panelsSettings.s3Bucket,
            prefix: 'panelpages/'
          }
        }*/
        /*save: {
          ops: ['create', 'update'],
          plugin: 'rest',
          params: {
            entityName: 'PanelPage'
          }
        },*/
        ...(isPlatformServer(platformId) ? {} : { readPrimary: { // demo only
          fallback: true,
          ops: ['create', 'update', 'query'],
          plugin: 'idb_keyval',
          params: {
            prefix: 'panelpage__'
          }
        }}),
        readFallback: {
          fallback: true,
          ops: ['query'],
          plugin: 'rest',
          params: {
            entityName: 'PanelPage',
            root: panelsSettings.objectsRootUrl,
            // root: 'https://rollthecloudinc.github.io/ipe-objects',
            // root: '/assets/objects',
            suffix: '.json'
          }
        },
        ...(isPlatformServer(platformId) ? 
          {} :
          {
            idb_keyval: { // demo only
              params: {
                prefix: 'panelpage__'
              }
            }
          }
        )
      }
    },
    PanelPageState: {
      entityName: 'PanelPageState'
    }
  }
};
