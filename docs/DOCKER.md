## Build the container from scratch

Compile the source with `npm run build`
```sh
sudo docker build -t open-haus .
```


## Start a new docker container

With the command below, we start a new container with a specific uuid

```sh
sudo docker run --name 64555693-9907-495f-8986-8c1a51d5d1fe --hostname 4555693-9907-495f-8986-8c1a51d5d1fe -e DB_NAME=4555693-9907-495f-8986-8c1a51d5d1fe -p 8080:8080 open-haus
```

## Start/Stop the created container
```sh
sudo docker start 4555693-9907-495f-8986-8c1a51d5d1fe
```

```sh
sudo docker stop -t 2 4555693-9907-495f-8986-8c1a51d5d1fe
```

## Connect into the container

```sh
sudo docker exec -it 4555693-9907-495f-8986-8c1a51d5d1fe /bin/ash
```




## DEMO CONTAINER

sudo docker run --expose 3000 proxy


```sh
sudo docker run -d --expose=8080 -e UUID=4555693-9907-495f-8986-8c1a51d5d1fe -e DB_NAME=4555693-9907-495f-8986-8c1a51d5d1fe --network=openhaus --name 4555693-9907-495f-8986-8c1a51d5d1fe --hostname 4555693-9907-495f-8986-8c1a51d5d1fe open-haus
```



```sh
sudo docker run \
-e UUID="4555693-9907-495f-8986-8c1a51d5d1fe" \
-e DB_NAME="4555693-9907-495f-8986-8c1a51d5d1fe" \
-e DB_AUTH_USER="Admin" \
-e DB_AUTH_PASS="Pa\$\$w0rd" \
-e DB_AUTH_SOURCE="admin" \
-e DB_HOST="10.0.0.1" \
-e LOG_LEVEL="verbose" \
--expose=8080 \
--network=openhaus \
--name 4555693-9907-495f-8986-8c1a51d5d1fe \
--hostname 4555693-9907-495f-8986-8c1a51d5d1fe \
open-haus
```


## HOWTO
1) Start loadbalancer
2) Start Two or more container
3) Add user to database for login
4) Login to container

https://stackoverflow.com/questions/37242217/access-docker-container-from-host-using-containers-name

sudo docker stop $(sudo docker ps -a -q)
sudo docker rm $(sudo docker ps -a -q)