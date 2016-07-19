# SLURM Web App
SLURM Web App is a project server-side and client-side to manage jobs on a *SLURM* cluster, under licenses [AGPLv3](./LICENSE). The base of project was created for a thesis bachelor to [HEPIA](http://hepia.hesge.ch/) in association with the [University of Geneva](http://www.unige.ch/).

## Features
They are multiple features after authentification by the user :
- **statistics of cluster**, with the ratio of CPUs and nodes allocated
- **list of jobs in queues**, with reamining time and estimated time
- **detail of job**, with live display of standard output and standard error
- **submission of job**, with loading of old batch file, modification of parameters with fileds, advice of the partition to be chosen and predefined submissions
- **files browser of cluster files**, with copy/paste/creation/suppression of files, upload of files, files viewer and files editor

![Dashboard & statistics](/docs/images/screenshots/desktop/1_dashboard.png)
Show more screenshots in [gallery page](./docs/gallery.md)

## Limitations
The application is only in french for the moment. Furthermore, he works only with the resource management *SLURM*

## Architecture
Client-side is a Bootstrap/AngularJS project. Server-side is a NodeJS project
which receive WebSocket(SSL) JSON messages by client and execute SSH commands on cluster.

The server is a NodeJS script and use SSH2, ExpressJS, Socket.io.The client is based on dashboard rdash-angular(https://github.com/rdash/rdash-angular).

![Architecture](/docs/images/resume.png)

## Documentation
More information can be read to these pages :
1. [Gallery](./docs/gallery.md)
2. [Installation](./docs/installation.md)
3. [Configuration](./docs/configuration.md)
4. [Tests](./docs/tests.md)


## TODO
A list of improvments :
- History list of own job
- Multilingue support
- ! Limitation file upload
