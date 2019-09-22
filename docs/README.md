# Documentation
For Developer.

## Architecture
1) Overview
2) Adapter
3) Connector
4) Endpoints

### 1) Overview
![architecture](assets/img/architecture.png)

### 2) Adapter
Adapter implements a protocol specification for comunication with a devicee/interface.\
Example: eISCP/ISCP for Pioneer/Onkyo AV Receivers.

### 3) Connector
A Connector is responsible for the communication between a adapter and a interface.\
Its like a proxy for two parties, it must allways run on the local network.\
The data forwarding to the backend/api is realized over websockets.

### 4) Endpoints
A Endpoint is a controllable thing. This "thing" must not physical exists.\
The Endpoint is connected with/over a interface/connector to a adapter.\