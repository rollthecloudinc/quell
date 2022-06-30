import { Injectable } from "@angular/core";
import { DefaultHttpUrlGenerator, HttpResourceUrls, Pluralizer, normalizeRoot } from "@ngrx/data";

@Injectable()
export class RestHttpGenerator extends DefaultHttpUrlGenerator {

  constructor(private pluralizer2: Pluralizer) {
    super(pluralizer2);
  }

  /**
   * Get or generate the entity and collection resource URLs for the given entity type name
   * @param entityName {string} Name of the entity type, e.g, 'Hero'
   * @param root {string} Root path to the resource, e.g., 'some-api`
   */
   protected getResourceUrls(
    entityName: string,
    root: string,
    trailingSlashEndpoints: boolean = false
  ): HttpResourceUrls {
    const nRoot = trailingSlashEndpoints ? root : normalizeRoot(root);
    const resourceUrls = {
      entityResourceUrl: `${nRoot}/${entityName}/`.toLowerCase(),
      collectionResourceUrl: `${nRoot}/${this.pluralizer2.pluralize(
        entityName
      )}/`.toLowerCase(),
    };
    return resourceUrls;
  }
}