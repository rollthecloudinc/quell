![Page](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/marvel-character-browser-v1.png)
#

![Editor](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/druid_new_design_bw_v4.png)
#

### Summary

Druid is a serverless publishing platform optimized for the modern web using cutting edge technology. Highly inspired by Drupal panels. Druid provides a suite of extensible authoring capabilities. 

* Markdown and HTML content
* Query and refine API datasets
* Upload media assets
* Extend with custom external JavaScript
* Form building and data storage 
* Conditional content display
* Customizable CSS styling
* Page Nesting and Embedding
* Material design styles
* Extensible via plugin architecture
* Authentication and authorization
* Customizable data storage and access restrictions
* Ruesable change detection aware variable definitions

### Live Demo

The live demo app can be found at the link below.

https://dpxmq1mxvsyda.cloudfront.net/pages/create-panel-page

Saved pages are currently saved to index db.

Demos and recipes for using specific features will follow.

NOTE: The live demo is an early stage alpha at best.

### Intentions

The well has run dry with sophisticated, powerful modern tools for authoring content across multiple marketing and business outlets. Druid will fill that void providing the new swift army knife of content development.

* Personal blog
* Small personal websites
* One-off landing pages
* Ecommerce website
* Professional business website(s)
* Web applications
* Development prototyping
* Email generation
* PDF generation

### Motivations

This project is inspired by older CMS platforms. Specifically given extensive work history using Drupal and Magento many of the concepts accross each of those platforms have been adapted for the serverless modern web. 

* Drupal | https://www.drupal.org/
* Magento | https://magento.com/
* Modx | https://modx.com/

### Notable Mentions

This project would not be possible without the previous work of many. Druid uses many other open source projects to deliver a sleek, sophisticated publishing experience. The most noteworthy of those is Angular – https://angular.io/. The foundation for the entire suite is built on top of this modern web building framework developed by Google with global support ecosystem.

One of the primary reasons Angular has been choosen for this project is due to the rich ecosystem of modules developed by community. Many of those projects have been used to optimize development quality, performance, efficiency, and maintainance.

* Angular Material | https://material.angular.io/
* NgRx | https://ngrx.io/
* Formly | https://formly.dev/
* Ngx Markdown | https://www.npmjs.com/package/ngx-markdown
* Angular Split | https://angular-split.github.io/
* ng2 Query Builder | https://zebzhao.github.io/Angular-QueryBuilder/
* Flex Layout | https://github.com/angular/flex-layout
* Ngx Json Viewer | https://www.npmjs.com/package/ngx-json-viewer

In addition to Angular Druid also uses many nodejs projects.

* jsonpath-plus | https://www.npmjs.com/package/jsonpath-plus
* json-rules-engine | https://www.npmjs.com/package/json-rules-engine
* oidc-client | https://www.npmjs.com/package/oidc-client
* numeral | http://numeraljs.com/
* qs | https://www.npmjs.com/package/qs
* css-select | https://www.npmjs.com/package/css-select
* css-json | https://www.npmjs.com/package/cssjson
* deepmerge-json | https://www.npmjs.com/package/deepmerge-json
* js-cookie | https://www.npmjs.com/package/js-cookie
* idb-keyval | https://github.com/jakearchibald/idb-keyval

### Live Examples

This will all be replaced with working, live examples soon.

The examples provided below is a small subset of the editors capabilities.

Classified Ads Fully Interactive Browser
![Rendered Page](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/panels_page_render_abc.png)

Nesting individual panel pages in one another
![Nesting](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/nesting_panels_in_one_another.png)

Formly Field panel page

![Formly Kitchen Sink](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/formly_kitchen_sink_v1_display.png)

State changes to form persisted to store. These changes can than be used to initiate other actions
on the page. For example, when someone changes a form value trigger a new search of data.

![Formly Kitchen Sink Redux](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/formly_kitchen_sink_redux.png)

Example of the editor page for formly.

![Formly Kitchen Sink Editor](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/formly_kitchensink_v1_manage.png)

Drag and drop page builder using Angular.

Example Page:

https://dpxmq1mxvsyda.cloudfront.net/adbrowserv9/realestate/691733b2-a9d3-11ea-99f3-7e44960cbab9

- Saving disabled unless page owned by user.

Any page can be followed by manage to view the editor:

https://dpxmq1mxvsyda.cloudfront.net/adbrowserv9/realestate/cbed078f-ab57-11ea-9774-ea79e329ea22/manage

- Save is disabled but one can play around.

Nested ad list:

https://dpxmq1mxvsyda.cloudfront.net/adlistv7/realestate

Editor for list of ads:

https://dpxmq1mxvsyda.cloudfront.net/adlistv7/realestate/manage

Nested detail view:

https://dpxmq1mxvsyda.cloudfront.net/addetailv3/x/691733b2-a9d3-11ea-99f3-7e44960cbab9

Details view editor:

https://dpxmq1mxvsyda.cloudfront.net/addetailv3/x/691733b2-a9d3-11ea-99f3-7e44960cbab9/manage

backend api: https://github.com/verti-go

List viewable panel pages:

https://dpxmq1mxvsyda.cloudfront.net/pagebrowser/v1

Manage link:

https://dpxmq1mxvsyda.cloudfront.net/pagebrowser/v1/manage

Formly Kitchen Sink

https://dpxmq1mxvsyda.cloudfront.net/formly/kitchensink/v1

Manage link to kitchen sink for formly

https://dpxmq1mxvsyda.cloudfront.net/formly/kitchensink/v1/manage

Formly options are populated using rest api call to marvel api. 
Future plans to implement other data sources and static options.

Tabs Page with custom labeling using selectors

Formly Kitchen sink v2 (code tabs)

https://dpxmq1mxvsyda.cloudfront.net/formly/kitchensink/v2

Version 2 of formly kitchen sink.
Adds code tabs using angular material tab component.
First proof of concept with panel page selecors and style handlers.

https://dpxmq1mxvsyda.cloudfront.net/example-tabs-custom-labels-v1

The first snippet in each tab is selected as the label for the tab.
This is made possible my the new panel page selection feature.
The panel page selection "api" eases pane mutations.
The page selection api is the drivinf force behind selecting a label for the tab.
The tabs style is the first proof of concept for the selection api and style handlers.
Style handlers are the other piece of this that can be used to dynamically change the page data structure.

Pane States

https://dpxmq1mxvsyda.cloudfront.net/test-pane-state-media-content-v1

Momentarily see loading text until image loads. Once image loads the loading text is removed.
This is done using pane states. The media content panel updates its pane state so that
the outside world in this case a rule can take action like hiding/showing content. This
is the first of many examples to follow using pane states.

!Important: There seems to be an issue hear. When the pane using a rule is part of the same panel
for the content that triggers the rule infinite context resolution loop occurs.

Table Recipe

Example of creating a table retaining all features of panel pages.

This uses the new datasource capabilities of multiple viewable content bindings. Each
column is a separate content binding on the datasource. CSS is than applied to make
the panel page components appear like a table.

https://dpxmq1mxvsyda.cloudfront.net/dev-enhanced-table-v1

# Catalog

Catalog of Druid libraries.

https://github.com/ng-druid/platform/wiki/Catalog
