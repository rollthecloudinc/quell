![](https://smeskey-github-prod.s3.amazonaws.com/projects/druid/github/druid_identity.png)

Druid is a cloud optimized content publishing framework based on the below five core standards. Featuring a suite of modules to conquer any web experience whether it be with code or without. Druid has it covered!

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

# Architecture

The core principle of druid is to eliminate unecessary layers of an application.

## Traditional

In traditional applications a middle man is used to communicate with a database and/or services in the cloud.

```mermaid
flowchart TD
 site[browser] --> api[rest api];
 api --> s3[s3];
 api --> os[open search]
```

## Druid

Druid does away with this middle man. Replaced with secure zero-trust http requests dispatched directly from the browser. This model allows organizations to focus on building experiences rather than apis. Apis are already provided by aws for all services like s3 and open search.

```mermaid
flowchart TD
 druid[browser] --> s3[s3];
 druid --> os[open search];
```

# Hosting

Druid sites can be pre-rendered as html files. Once pre-rendered as html files the site can basically be hosted anywhere. All demos at the bottom of this page are hosted as a static pre-rendered github pages site for free in the highly available cloud.

* github pages
* gitlab pages
* aws s3 
* aws s3 + cloudfront
* any CDN

# Stack

Angular + AWS = AA or A++

Double A

Low energy consumption fit for preservation of the environment.

* No bulky servers
* No physical infrastructure
* No resource hog databases

# Modules

Druid modules enable devs, builders and editors to quickly realize usable, modern web experiences optimised for zero-trust no / low cost cloud hosting.

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

Articles:
* [Toggling Pane Visibility](https://github.com/ng-druid/platform/wiki/Feature-Demo:-Toggling-Pane-Visibility)

# Demos

## Orchestrate

Workflow designer micro-frontends from Angular architects hosted inside a druid shell.

* https://ng-druid.github.io/workflow-designer-v2
* https://ng-druid.github.io/workflow-designer-v2/manage

Read about the micro-frontend revolution here.

https://www.angulararchitects.io/en/aktuelles/the-microfrontend-revolution-part-2-module-federation-with-angular/

The code for the micro-frontend apps can be found in a sidecar repo here.

https://github.com/ng-druid/workflow-designer

## Collect

Data entry form built entirely with panel pages.

* https://ng-druid.github.io/formly/kitchensink/v1
* https://ng-druid.github.io/formly/kitchensink/v1/manage

## Consume

Marvel character browser built entirely with panel pages.

* https://ng-druid.github.io/dev-test-virtual-list-flex-v1/character/1011334
* https://ng-druid.github.io/dev-test-virtual-list-flex-v1/character/1011334/manage
