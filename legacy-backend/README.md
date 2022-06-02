# IBM Cloud Fun

Quick and dirty custom sequence to access [jobsuche-api](https://github.com/bundesAPI/jobsuche-api) with Cloudant/COS caching and automatic token retrieval.

## How it works

Requests for the jobsuche-api are forwarded via the API gateway to the custom sequence which checks in a Cloudant instance if the same request has already been made. If the result stored there is more than 12h old it will send a new request to the jobsuche-api and update the existing DB entry.

To access the API a JWT is needed. It gets stored in a IBM Cloud Object Storage to reuse it until it no longer is valid.


## Requirements

- IBM Cloud CLI
- IBM Cloud Object Storage buclet
- Cloudant database (I haven't included the service bindings yet)


