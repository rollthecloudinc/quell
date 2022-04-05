```mermaid
flowchart LR;
 subgraph browser
 app
 end
 subgraph browser2[browser]
 cloud
 end
 subgraph aws
 subgraph search
 app-->opensearch
 cloud-->opensearch
 end
 subgraph storage
 app-->s3
 cloud-->s3
 end
 subgraph hosting
 cloudfront-->s3
 app-->cloudfront
 cloud-->cloudfront
 end
 end
```
