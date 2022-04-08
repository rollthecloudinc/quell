# RollTheCloud

## Architecture

```mermaid
flowchart RL
subgraph Druid
core
extensions
micro-frontends
cloud-->core
cloud-->extensions
cloud-->micro-frontends
end
subgraph Organizations
dcloud[rollthecloud.com]-->cloud
druid2[ng-druid.com]-->cloud
zingurus[zingurus.com]-->cloud
classifieds-ui[classifieds-ui.com]-->cloud
end
subgraph AWS
gateway-->dcloud
gateway-->druid2
gateway-->zingurus
gateway-->classifieds-ui
cognito-->gateway
opensearch-->gateway
s3-->gateway
verti-go-->gateway
cassandra-->verti-go
documentdb-->verti-go
atlas-->verti-go
end
```

## Organizations

### rollthecloud.com

Launch new modern cloud web experiences.

### ng-druid.com

The druid project main website.

### zingurus.com

Share thoughts, ideas. media with anyone around the world.

### classifieds-ui.com

Publish ads and create sites for sellings goods and products.
