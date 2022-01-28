## Description

This POC showcases how we can work around Bull queues and Server-Sent Events with NestJS.

**Note**: While this POC provides a simple site that we can access to monitor the events, it's advisable to use the FrontEnd developed on [this POC](https://github.com/greatmindsorg/dp-research/pull/170)

## Requirements

1. [Docker Compose](https://docs.docker.com/compose/install/)
2. [NodeJS](https://nodejs.org/en/download/)

## Instructions

1. Run `npm install` to install the necessary dependencies.
2. Run `npm start` will start a docker container for Redis and also the application on port 3000 (can be change on `main.ts`). 
3. Access `http://localhost:3000/` (or subscribe with the URL `http://localhost:3000/async-job/sse`) on the Browser to establish a connection and write the events received on the DOM (You can also see them on the Network tab on the DevTools)
4. Queue a few jobs by making a `POST` to `http://localhost:3000/async-job/process`
    ```
    curl --location --request POST 'http://localhost:3000/async-job/process'
    ```
5. Now you can monitor the changes on your Browser as the jobs are being processed.
