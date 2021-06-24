# Druid

Content Editor
![Panels UI](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/panels_content_editor_abcd.png)

Rendered Page
![Rendered Page](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/panels_page_render_abc.png)

Nesting individual panel pages in one another
![Nesting](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/nesting_panels_in_one_another.png)

Drag and drop page builder using Angular.

Example Page:

https://dpxmq1mxvsyda.cloudfront.net/adbrowserv9/realestate/691733b2-a9d3-11ea-99f3-7e44960cbab9

- Saving disabled unless page owned by user.

Any page can be followed by manage to view the editor:

https://dpxmq1mxvsyda.cloudfront.net/adbrowserv9/realestate/cbed078f-ab57-11ea-9774-ea79e329ea22/manage

- Save is disabled but one can play around.

Nested ad list:

https://dpxmq1mxvsyda.cloudfront.net/adlistv7/realestate

backend api: https://github.com/verti-go

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

@todo

## Panels

Inspired by Drupal panels. Aims to provide a user friendly interface for building modern web experiences.