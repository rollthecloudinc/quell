import { CrudEntityMetadataMap } from 'crud';

export const entityMetadata: CrudEntityMetadataMap = {
  GridLayout: {
    entityName: 'GridLayout'
  },
  /*PanelPage: {
    entityName: 'PanelPage'
  },
  PanelPageListItem: {
    entityName: 'PanelPageListItem'
  }*/
  PanelPageForm: {
    crud: {
      /*serializer: {
        before: 'idb_keyval',
        params: {
          name: 'form'
        }
      },*/
      panelpageform_serialize: { // I kind of like this... nested adaptors
        /*params: {
          name: 'form'
        },*/
        // params: {},
        plugins: {
          idb_keyval: {
            params: {
              prefix: "panelpageform__"
            }
          }
        }
      },
      /*idb_keyval: {
        params: {
          prefix: 'panelpageform__'
        }
      }*/
    }
  }
};
