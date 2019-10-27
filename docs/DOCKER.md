## Build the container from scratch

Compile the source with `npm run build`
```sh
sudo docker build -t open-haus .
```


## Start a new docker container

With the command below, we start a new container with a specific uuid

```sh
sudo docker run --name "64555693-9907-495f-8986-8c1a51d5d1fe" --hostname "4555693-9907-495f-8986-8c1a51d5d1fe" -e DB_NAME="4555693-9907-495f-8986-8c1a51d5d1fe" -p 8080:8080 open-haus
```

## Start/Stop the created container
```sh
sudo docker start "4555693-9907-495f-8986-8c1a51d5d1fe"
```

```sh
sudo docker stop -t 2 "4555693-9907-495f-8986-8c1a51d5d1fe"
```

## Connect into the container

```sh
sudo docker exec -it "64555693-9907-495f-8986-8c1a51d5d1fe" /bin/ash
```