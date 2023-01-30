# Pern
## Tech Stack
- JavaScript (Node v16.13.2)
- Database (PostgreSQL v13.7)
- Server (Express v4.13.3)
- Client (React v18.2.0)

## Setup 
This project has been containerized for an easy and swift setup using Docker and nginx, pleae follow the following simple steps to run the project
1. Install Docker if you haven't already [Get Docker](https://docs.docker.com/get-docker/)
2. Run the following command to build the project `docker-compose up --build`
3. Checkout the react portion of the project on [http://localhost:3050/](http://localhost:3050/)
4. Checkout the server portion of the project on [http://localhost:3050/api/](http://localhost:3050/api/)
5. Database should be running on port `5432` with the credentials exposed to the api environments in `./docker-compose.yml`
6. I have included a script that would run seed the postgres database with the SQL datadump that was provided

## Running the Application
To run the application, run the following command to start up the services
```
docker-compose up
```
- [Client](http://localhost:3050/) 
- [Api](http://localhost:3050/api/) 