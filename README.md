# SLURM Web App

SLURM Web App is a project server-side and client-side to manage a SLURM cluster.

Client-side is a Bootstrap/AngularJS project. Server-side is a NodeJS project which receive WebSocket(SSL) messages by client and execute SSH commands on cluster.


### Client
The client is based on dashboard rdash-angular, an AngularJS/Bootstrap template example. See https://github.com/rdash/rdash-angular

### Server
The server is a NodeJS script and use SSH2, ExpressJS, Socket.io
