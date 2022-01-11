//import { EntityMetadataMap } from '@ngrx/data';
import { isPlatformServer } from '@angular/common';
import { CrudEntityMetadataMap, CrudEntityQueryMapping } from 'crud';

export const entityMetadataFactory = (platformId: Object): CrudEntityMetadataMap => {
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
        aws_opensearch_template: {
          ops: ['query'],
          params: {
            id: 'panelpagelistitems',
            index: 'classified_panelpages',
            hits: true,
            source: true,
            domain: 'search-classifieds-ui-dev-eldczuhq3vesgpjnr3vie6cagq',
            region: 'us-east-1'
          }
        },
        ...(isPlatformServer(platformId) ?
          {} :
          {
            idb_keyval: {
              params: {
                prefix: 'panelpage__'
              },
              queryMappings: new Map<string, CrudEntityQueryMapping>([
                ['path', { defaultOperator: 'startsWith' }]
              ])
            }
          }
        ),
        /*aws_opensearch_entity: {
          ops: ['create', 'update', 'read', 'delete']
        },*/
      }
    },
    PanelPage: {
      entityName: 'PanelPage',
      crud: {
        aws_s3_entity: {
          // ops: ['query'],
          params: {
            bucket: 'classifieds-ui-dev',
            prefix: 'panelpages/'
          }
        },
        /*rest: {
          // ops: ['query'],
          params: {
            entityName: 'PanelPage'
          }
        },*/
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
