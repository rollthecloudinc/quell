# Druid

Druid is a serverless publishing platform optimized for the modern web using cutting edge technology.

This projects goal is to provide a powerful, sophisticated toolset for authoring digital content.

Digital authoring targets include:

* highly interactive web app
* smaller website building
* landing page creation
* small static sites
* email creation
* other digital marketing
* PDF creation / documentation
* prototyping tool
* diagramming

### Motivations

This project is inspired by older CMS platforms. Specifically given extensive work history using Drupal and Magento many of the concepts accross each of those platforms have been adapted for the serverless modern web.

### Notable Mentions

This project would not be possible without the previous work of many. Druid uses many other open source projects to deliver a sleek, sophisticated publishing experience. The most noteworthy of those is Angular – https://angular.io/. The foundation for the entire suite is built on top of this modern web building framework developed by Google with global support ecosystem.

One of the primary reasons Angular has been choosen for this project is due to the rich ecosystem of modules developed by community. Many of those projects have been used to provide qoptimize development quality, performance, efficiency, and maintainance.

* Angular Material
* NgRx
* Formly
* Ngx Markdown
* Angular Split
* ng2 Query Builder
* Flex Layout

### Chief Editor

Meet the chief editor and driving force behind entire the entire publishing experience.

![Panels UI](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/panels_content_editor_abcd.png)

Highly inspired by Drupal panels. The Druid editor provides a suite of extensible authoring capabilities.

The examples provided below is a small subset of the editors capabilities.

# Examples

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


Features:
- Default content like html and markdown.
- Content is extensible without altering code. For example, if you have a component or several which you would
like to allow users to drop into a layout. This is possible.
- Groups of content can be styled. For example, a group of items can be made into a virtual list. 
- Styling groups of content is extensible. You can define your own styles without modifying the base code.
- Pages that are created can change based on some type of state. For example, when the query string changes
the layout can adapt to that change even load in extra content and display it alongside other content.
- Context system that allows pages to react to state changes is extensible.
- Three default layouts exist: grid (gridster), gridless (flat), and split (flex layout).
- Layouts are also extensible. Create your own layouts and plug them into the system for user selection.

Ambitions:

- Panel Styles need options.
- Auth system is currently hard coded to aws. Make the auth system extensible.
- Websocket support.
  - Define a websocket like you would a rest api endpoint and when a message is received
    create a new dynamic pane.
- Customization of panel page presentation using css/scss that overrides defaults.
- Media is currently hard coded to back-end api (not open source yet). Make this extensible.
- More attribute widgets.
- Panel page form integration possible using well known libraries like formly.
- Using panel pages as content.
  - Create content entities as panel pages and display them all the same.
- Data grid / actions within panel pages.
  - Tabular data support. Not only in markup but in building the table via the builder itself. This
    will include actions on entities. Like an "action" pane or something rendered in a cell maybe.
- Add example of using a lazy loaded plugin to ipe project. For example, adding a content plugin that is lazy
loaded. This can probably be something as simple as a component in a small module to demostrate the plugin system
module loader discovery.
- Create demo website. I want people to be able to create and edit panel pages without needing to download
this package and install it.

## Plugin

Inspired by drupal plugin system.

Extend framework, platform, app without changing any source code in that project.

Promote development that inspires all authors to consider extensibility.

## Context

Inspired by the Drupal context system. 

Applications and pages have contexts.

Those contexts are used to provide info to the end user.

The alternative to contexts is hard-coding logic in the application which changes its behavior.

Different features (modules) provide their own contexts.

A global module like a user module might provide an application wide context for user info.

Any feature now compatible with the context system naturally inherits access to the user info.

## Content

Panels backbone. The content which is placed on a page.

## Style

Panels subsystem for enhancing standard panel rendering with additional behavior.

## Layout

Panels subsystem for laying out content on a panel page.

## Attribute

Inpsired by Magento.

Framework for extending concrete entities with unstructured meta data.

## Token

Allows users to specify tokens that are replaced with dynamic content.

## Panels

Inspired by Drupal panels. Aims to provide a user friendly interface for building modern web experiences.

## Alias

Extends angular routing with dynamic routing capabilities using plugins.

## Formly

Panel pages formly pages.

Place formly elements on the page using panel pages for their layout.

Render panel page as form that accepts user input.

Panel page forms stored in state (redux) and can be used as contexts
to trigger state changes. For example, when user selects item in drop down
rest request can be triggered to update other content on the page.

Futures:

Save panel page form as derivative of panel page that form was derived from.

This effectively allows panel pages to be used not only for layout but to create
and define new entities dynamically using the panel page builder.

In Drupal this is known as "panels everywhere".
