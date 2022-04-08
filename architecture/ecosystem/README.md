# Complete

```mermaid
flowchart RL
subgraph druid
core
end
subgraph spearhead
shell-->core
end
subgraph rollthecloud
dcloud-->shell
zingurus-->shell
classifieds-ui-->shell
end
subgraph aws
gateway-->dcloud
gateway-->zingurus
gateway-->classifieds-ui
opensearch-->gateway
s3-->gateway
end
```



# High Level (old)

```mermaid
flowchart TB
druid-->homebase[homebase]
druid[druid]-->ipe[ipe];
druid[druid]-->cloud[rollthecloud];
druid-->zingurus[zingurus]
druid-->classifieds-ui[classifieds-ui]
druid-->youtube
druid-->wordpress
```
# Homebase

* domain: ng-druid.com

The main druid website.

# Ipe

* domain: n/a

e2e testing site and demos

# RollTheCloud

* domain: rollthecloud.com

The cloud based service to rapidly develop druid sites on shared or dedicated cloud infrastructure.

# Zingurus

* domain: zingurus.com

Twitter 000 clone.


# Classifieds UI

* domain: classifieds-ui.com

Craigslist 000 clone.

This website will also go one step further and provide derivitive ad sites based on specific contexts like realestate, autos, etc. Content type system will be implemented to change data requires for specific ad types. Profiles can also be created to create dedicated ad websites like for a specific real estate firm or dealer.

# Youtube

This needs name and branding but will effectively be a 000 replacement of youtube and tiktok.

# Wordpress

This needs name and branding but will effectively be a 000 replacement of wordpress hosted blogs. Users will be able to easily launch 000 green blogs like Wordpress but without the environmental impact.
