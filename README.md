# Druid

Drag and drop page builder using Angular.

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

Plugins:

## Context

## Content

## Style

## Layout

## Widgets