# RollTheCloud

## Architecture

```mermaid
flowchart RL
subgraph Druid
core
extensions
micro-frontends
rollthecloud[rollthecloud.com]-->core
rollthecloud-->extensions
rollthecloud-->micro-frontends
end
subgraph Sites
dcloud[rollthecloud.com]-->rollthecloud
druid2[ng-druid.com]-->rollthecloud
zingurus[zingurus.com]-->rollthecloud
classifieds-ui[classifieds-ui.com]-->rollthecloud
end
subgraph AWS
gateway-->dcloud
gateway-->druid2
gateway-->zingurus
gateway-->classifieds-ui
opensearch-->gateway
s3-->gateway
verti-go-->gateway
cassandra-->verti-go
end
```
