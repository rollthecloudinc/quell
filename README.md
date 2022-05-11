![](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/tree_bottom_up.png)

Druid closely aligns with the green software movement. Where developers are empowered and educated to build environmentally friendly applications. https://principles.green/

Rapid online content distribution platform providing environmentally responsible 0 server, 0 trust, 0 cost web hosting solutions.

## Dependable

Highly available, infinitely scalable with low-latency across all tiers.

## Responsive

performant, optimized

## User Centric

delightful experience for everyone involved from user to developer.

## Inexpensive

Low-cost without sacrifice.

## Durable

Low dependance on specific infrastructure configurations or environments.

When its all said and done Druid is a small, portable web app optimized for the cloud.

# Technology

A+ (Angular + AWS)

Low energy consumption fit for preservation of the environment.

* No bulky servers
* No physical infrastructure
* No resource hog databases

# Evolution

## HTML Site

The infancy of the web used static HTML served to users via a remote server. The model was fairly simple and straight forward. However, this model did not lend itself to supporting dynamic web experiences. Furhermore, JavaScript was not a very stable or reliable option for heavily using in the browser.

```mermaid
flowchart TD
 site[browser] --> server[server];
```

## Monolithic CMS

So came along dynamic programming languages/web frameworks like php, ruby, .net, java. This birthed the monolithic CMS era of Wordpress, Drupal, Magento. With this added flexibility much complexity was added. Web sites transformed from simple html pages to large, gigantic complex high energy software platforms sucking the environment dry.

```mermaid
flowchart TD
 site[browser] --> server[server];
 server --> app[app];
 app --> db[database]
```

## Modern MVVM

With the advent of rest apis and advances in JavaScript came the ability to run complete applications in the browser reliably. No more a server was necessary to render html only to serve data via a rest api. In parallel with this tech came the cloud. Many have moved away from clunky traditional databases to highly available, low latency, scalable cloud solutions an industry dominated by aws.

```mermaid
flowchart TD
 site[browser] --> api[rest api];
 api --> s3[s3];
 api --> os[open search]
```

## Druid (HTML+AWS)

Druid takes the next step to completely eliminate the server. Replaced with secure zero-trust http requests dispatched directly from the browser. This model allows organizations to focus on building lightweight, low cost experiences rather than apis. Effectivly coming full circle using only two layers back to the beginning. However, doing so in a way that fully embraces all modern advances.

```mermaid
flowchart TD
 druid[browser] --> s3[s3];
 druid --> os[open search];
```

## Druid- (HTML)

Druid can further be simplified by removing s3 and open search for experiences that don't require seach and/or data collection.

```mermaid
flowchart TD
 druid[browser]
```

# Hosting

Sites can be rendered as static html pages and hosted anywhere from a cdn to a local private filesystem. This is the driving force behind hosting sites with 0 cost associated.

```mermaid
flowchart TD
 browser[browser] --> cdn[cdn];
 cdn --> html[html];
 cdn --> js[javascript];
 cdn --> css[css];
 cdn --> images[images]
 cdn --> video[video]
 cdn --> audio[audio]
```

# Static+

Druid takes static websites to the next level by providing complete, pre-rendered html pages that include JavaScript. This allows pages to easily indexed for SEO without sacrificing usability. Once the page is rendered for the a user the browser takes over and provides a seamless, modern fluent experience without reloading pages using Angular framework.

# Enterprise Architecture

## Extensions

In druid individual apps are micro-frontends but share libraries and extensions. Extensions are another category of micro-fronends without components. Instead extensions expose modules that are pulled into the main app extending its capabilities via plugins. This methodology allows the main app to be extended without touching the main app code. Furthermore, it enables the next level of reusability to not only packages but complete feature driven extensions that can be loaded at runtime into an app when needed. This is achieved through a recent advancement in the technology space known as module federation. Module federation drives the ability to orchestrate micro-frontends efficently pulling them into a main shell app.

```mermaid
flowchart LR
druid[druid]-->app1[app1];
druid-->app2[app2];
druid-->app3[app3];
app1-->ext1[extension 1]
app2-->ext1
app3-->ext2[extension 2]
ext1-->p1[plugin]
ext1-->p2[plugin]
ext2-->p3[plugin]
```

## Hybrid Architecture

Druid is not limited to using Angular modules. In druid any JavaScript app that suppots module federation can be pulled into the main shell app. Druid can host React, Vue, Svelte, etc. apps when module federation is supported. Furthermore, druid apps can be nested inside one other using module federation.

```mermaid
flowchart LR
ds1[druid app]-->rm1[react app]
ds2[druid app]-->rm1
ds2-->rm2[react app]
ds2-->va1[vue app]
ds3[druid app]-->va1
```

# Modules

Druid modules enable devs, builders and editors to quickly realize usable, modern web experiences optimised for 0 server, 0 trust, and 0 cost cloud hosting.

## Security

Watch out for safety and security of the pack.

![](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/wolves.png)

### Auth

* auth
* odic

## Extensibility

Far reaching wing span enabling travel over long distance.

![](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/eagle2.png)

### Plugin

* plugin

### Context

* context

### Meta

* attributes

### Parsing

* dparam
* durl
* token

## Routing

Move users quickly to their destination.

![](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/elephants.png)

### Alias

* alias

Implementations:

* pagealias
* alienalias

## Persistence

Move data quickly with consistency.

![](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/croc.png)

### Crud

* crud

Implementations
* aws3
* awos
* rest

## Search

Soar over, take hold and consume data.

![](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/owl.png)

### Datasource

* datasource

Implementations:
* transform
* crud
* loop
* rest

Articles:
* [Datasources Explained](https://github.com/ng-druid/platform/wiki/Feature-Demo:-Data-Datasource)

## Orchestration

Swim alongside one another with ease and consistency as one.

![](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/dolphines.png)

### Module Federation

* alienalias
* outsider
* tractorbeam

## Publishing

Realize killer breathtaking experiences.

![](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/whale.png)

### PanelPage

* panels
* render
* pages
* pagealias
* layout
* sheath

Articles:
* [Toggling Pane Visibility](https://github.com/ng-druid/platform/wiki/Feature-Demo:-Toggling-Pane-Visibility)

# Demos

## Collect

New data entry form replacing formly supporting repeating sections, nested sectins, and persistence.

* https://demo.ng-druid.com/native_forms_rebuild_v1/89087abb-326d-4a93-888e-9c597ba81b8e
* https://demo.ng-druid.com/native_forms_rebuild_v1/89087abb-326d-4a93-888e-9c597ba81b8e/manage

[OLD] Data entry form using formly (deprecated)

* https://demo.ng-druid.com/formly/kitchensink/v1
* https://demo.ng-druid.com/formly/kitchensink/v1/manage

## Consume

Marvel character browser built entirely with panel pages.

* https://demo.ng-druid.com/dev-test-virtual-list-flex-v1/character/1011334
* https://demo.ng-druid.com/dev-test-virtual-list-flex-v1/character/1011334/manage

## Orchestrate

Workflow designer micro-frontends from Angular architects hosted inside a druid shell.

* https://demo.ng-druid.com/workflow-designer-v2
* https://demo.ng-druid.com/workflow-designer-v2/manage

## Extend

Extension loaded as remote module.

* https://demo.ng-druid.com/tractorbeam-test-v3
* https://demo.ng-druid.com/tractorbeam-test-v3/manage

# Serverless Api

https://github.com/verti-go/main
