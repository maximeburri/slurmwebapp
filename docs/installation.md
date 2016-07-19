# Installation
## Requirement
Just NodeJS must be installed. Donwload and install on [NodeJS download page](https://nodejs.org/en/download/).

## Download source
Download or clone the repository : 
```
git clone https://github.com/maximeburri/slurmwebapp
```

## Client side
Go to `client` directory, then update NodeJS modules
```
npm install
```

Then bower modules
```
bower install
```

## Server side
Go to `server` directory, then update NodeJS modules
```
npm install
```

# Compilation & execution

## Client side 
Go to `client` directory.

### Production
To production mode, only build the client, then final application is at directory `client/dist`. The server will serve files.
```
gulp build
```

### Development
For developpement and auto-compilation of pages when code source is modified.
```
gulp
```

Application accessible at `http://127.0.0.1:8888/` 
## Server side
Before execute the server, check last client files was compiled in `client/dist` (Client side installation section). Then go to `server` directory.

### Production
```
nodejs server.js
```
Application/server accessible at `https://127.0.0.1:3000/` 
Port can be changed in server configuration file.

### Development
```
gulp
```


