```mermaid
flowchart LR;
 subgraph browser;
 app
 end;
 subgraph aws;
 app-->opensearch
 app-->s3
 cloudfront-->s3
 app-->cloudfront
 end;
```
