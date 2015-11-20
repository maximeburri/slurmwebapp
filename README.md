# SLURM Web App

SLURM Web App is a project server-side and client-side to manage a SLURM cluster.

Client-side is a Bootstrap/AngularJS project. Server-side is a NodeJS project which receive WebSocket(SSL) messages by client and execute SSH commands on cluster.

## Server
The server is a NodeJS script and use SSH2, ExpressJS, Socket.io

## Client
The client is based on dashboard rdash-angular, an AngularJS/Bootstrap template example. (https://github.com/rdash/rdash-angular)

## Compilation
NodeJS have to be installed (https://nodejs.org/en/download/package-manager/).
Install npm modules in the `client` and the `server` directory :
```
npm install
```

### Production
`client` directory
```
gulp build
```

`server` directory
```
nodejs server.js
```

The page is accessible to `https://127.0.0.1:3000/`. The bridge for websocket is `127.0.0.1:3000` (https is added).

### Developpement
`client` directory
```
gulp
```

`server` directory
```
nodejs server.js
```
The page is accessible to `http://127.0.0.1:8888/` and auto-compiled and reload when a file is modified (with gulp). The bridge for websocket is `127.0.0.1:3000` (https is added).

## Configuration
The parameters of configuration can be modified in file `server/config.js`, like :
- the port number : `config.https_server.port`
- the ssl keys files
  - Key file: `config.https_server.certs_key_file`
  - Certificate file: `config.https_server.certs_cert_file`
- the ssh timeout connection : `config.ssh.timeout`
