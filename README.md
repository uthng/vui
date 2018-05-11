# VUI: Vault UI
Another Web UI written in VueJS & NuxtJS to manage Vault easily. It uses directly Vault HTTP API and still under heavy development.

![VUI Demo](./docs/images/vui_demo.gif)

## Current features:
- User authentication with multiple path support for the same method: token and LDAP
- Authentication methods:
  - Methods: enable, disable, configure current supported methods
  - LDAP:
    - Ldap server configuration
    - Groups & users management with policies (create, delete, modify)
    - Multiple LDAP paths
- Secret engines:
  - Engines: enable, disable and configure current supported engines
  - Secret (Key/Value) v1:
    - Secret treeview editor with access and actions based on user's policies
    - Multiple Secret paths
- Policies: full management (create, delete, modifiy)

## Build Setup:

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

```

## Docker:

To run VUI using the Docker image:

```bash
docker run -d --name vui -e VAULT_API_URL=http://vault_api_url:8200/v1 -p 4000:3000 uthng/vui:0.2.0
```

** Environment variables: **
- VAULT_API_URL: Vault endpoint with version


## Configuration:

### VUI:

To run and to communicate with Vault, VUI loads the configuration file `config.js` in which the following informations need to be specified:

```javascript
export const VAULT_API_URL = "http://vault_api_url:8200/v1"
```

This configuration file will be generated automatically if you are using the Docker image.

### Vault:

##### 1. CORS:

VUI communicates directly with Vault HTTP API, so in order to avoid CORS issues, the following configuration needs to be set first at Vault servers:

```json
{
  "enabled": true,
  "allowed_origins": "*",
  "allowed_headers": [
    "Content-Type",
    "X-Requested-With",
    "X-Vault-AWS-IAM-Server-ID",
    "X-Vault-No-Request-Forwarding",
    "X-Vault-Token",
    "X-Vault-Wrap-Format",
    "X-Vault-Wrap-TTL"
  ]
}

```

##### 2. Policies

When using VUI, a user or a token needs to have a basic set of capabilities in order to: read/renew/revoke token itself, discover mounted secret engines and read somes policies.

  ** 1. Default policy **

A basic default policy for all users.

```hcl

# Allow tokens to look up their own properties
path "auth/token/lookup-self" {
      capabilities = ["read"]
}

# Allow tokens to renew themselves
path "auth/token/renew-self" {
      capabilities = ["update"]
}

# Allow tokens to revoke themselves
path "auth/token/revoke-self" {
      capabilities = ["update"]
}

# Allow a token to look up its own capabilities on a path
path "sys/capabilities-self" {
      capabilities = ["update"]
}

# Allow to read default policy
path "sys/policy/default" {
    capabilities = ["read"]
}

# Allow to list or read configuration of mounted secret engines
path "sys/mounts" {
    capabilities = ["read", "list"]
}

```

  ** 2. Secret policy **

Besides the permissions to secret paths, user must have at least a read capability on the policy to which he is granted. For example:

```hcl
path "secret/travel/*" {
  capabilities = ["create", "update", "delete", "read", "list"]
}

path "sys/policy/travel-ops" {
  capabilities = ["read"]
}

```
