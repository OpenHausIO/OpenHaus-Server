# REST documentation, `devices`
## Basic routes
> `GET` /api/devices/ (*\<id>*)\
> `PUT` /api/devices/\
> `POST` /api/devices/\<id>\
> `DELETE` /api/devices/\<id>

## Contents
1) [Object Structure](#Object-Structure)
2) [Extendet routes](#Extendet-routes)
    - 2.1 [Connector](#Extendet-routes-Connector)
    - 2.2 [Connector](#Extendet-routes-Connector)
    - 2.3 [Connector](#Extendet-routes-Connector)
    - 2.4 [Connector](#Extendet-routes-Connector)
3) [Connector](#Extendet-routes-Connector)

## Object Structure
```js
{
    "name": {
        "type": String,
        "required": true
    },
    "icon": {
        "type": String,
        "required": true
    },
    "room": {
        "type": ObjectId,
        "ref": "Rooms"
    },
    "interfaces": [{
        "type": {
            "type": String,
            "required": true,
            "enum": ["RS232", "ETHERNET"]
        },
        "description": {
            "type": String
        },
        "adapter": {
            "type": ObjectId,
            "ref": "Adapters",
        },
        "settings": {
            ...
        }
    }, {
        ...
    }],
    "meta": {
        "manufacturer": {
            "type": String
        },
        "model": {
            "type": String
        },
        "web": {
            "type": String
        },
        "revision": {
            "type": Number
        }
    }
}
```


## Connector (WebSocket)
> `GET` /api/devices/\<id>/connector
