```mermaid
flowchart LR;
 subgraph browser
 app
 end
 subgraph aws
 subgraph search
 app-->opensearch
 end
 subgraph storage
 app-->s3
 end
 subgraph hosting
 cloudfront-->s3
 app-->cloudfront
 end
 end
```
