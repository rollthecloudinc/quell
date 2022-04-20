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
dcloud[RollTheCloud.com]-->cloud
card[Card.RollTheCloud.com]-->cloud
druid2[RollWithDruid.com]-->cloud
zingurus[RollWithZings.com]-->cloud
realestate[RollWithRealestate.com]-->cloud
autos[RollWithAutos.com]-->cloud
jobs[RollWithJobs.com]-->cloud
classifieds[RollWithClassifieds.com]-->cloud
commerce[RollWithCommerce.com]-->cloud
end
subgraph AWS
gateway-->dcloud
gateway-->card
gateway-->druid2
gateway-->zingurus
gateway-->realestate
gateway-->autos
gateway-->jobs
gateway-->classifieds
gateway-->commerce
cognito-->gateway
opensearch-->gateway
s3-->gateway
dynamo-->gateway
sns-->gateway
verti-go-->gateway
cassandra-->verti-go
documentdb-->verti-go
atlas-->verti-go
end
```

## Organizations

### RollTheCloud.com

Nonprofit main site.

### Card.RollTheCloud.com

Nonprofit virtual business card for easy mobile distribution.

### RollWithDruid.com

Launch new modern cloud web experiences.

### RollWithZingscom

Share thoughts, ideas. media with anyone around the world.

### RollWithClassifieds.com

Publish ads and create sites for sellings goods and products.

### RollWithRealestate.com

Publish ads and create sites for sellings homes.

### RollWithAutos.com

Publish ads and create sites for sellings autos.

### RollWithJobs.com

Publish ads and create sites for job listings.

### RollWithCommerce.com

Create ecommerce websites.
