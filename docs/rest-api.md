# REST documentation

## Resource types
- [devices](./api.devices.md)
- `adapters`
- `endpoints`
- `rooms`

For all resource types the basic rest features are available:
- Fetch (`GET`)
- Create (`PUT`)
- Update (`POST`)
- Remove (`DELETE`)

> All requests must have set the `Content-Type` header to `application/json`

## Example: fetch list of `devices`
> **`GET`** /api/devices

### Response: `200 OK`
```json
[
    {
        "_id": "5d5bd2608a38373238b5d70b",
        "name": "AV - Receiver",
        "icon": "fa-volume-up",
        "room": "5d5bd75081f0870608796097",
        "interfaces": [
            {
                "_id": "5d5bd2608a38373238b5d70c",
                ...
            },
            {
                "_id": "5d5bd2608a38373238b5d70d",
               ...
            }
        ],
        "__v": 0
    },
    {
        "_id": "5d5bdd022709e8279ce56f9d",
        "icon": "fa-compact-disc",
        "name": "BD - Player",
        "interfaces": [
            {
                "_id": "5d5bdd022709e8279ce56f9f",
                ...
            },
            {
                "_id": "5d5bdd022709e8279ce56f9e",
                ...
            }
        ],
        "__v": 0
    }
    ...
]
```

## Example: Create new `rooms` resource
> **`PUT`** /api/rooms

### Request
```json
{
    "name": "Wohnzimmer",
    "floor": 0,
}
```

### Response: `200 OK`
```json
 {
    "_id": "5d5bd75081f0870608796097",
    "name": "Wohnzimmer",
    "floor": 0,
    "__v": 0
},
```

## Example: Update existing `endpoints` resource
> **`POST`** /api/endpoints/5d5be7bc29637d16447f31a4

### Request
```json
{
    "_id": "5d5be7bc29637d16447f31a4",
    "name": "Beamer",
[+] "icon": "fa-projector",   
    "interface": "5d5bea7ba58aee10d0f06b40",
    "__v": 0,
    "commands": [{
[+]     "name": "Power On",
[+]     "payload": "PWR01"       
    }]
}
```

### Response: `200 OK`
```json
{
    "n": 1,
    "nModified": 1,
    "ok": 1
}
```

## Example: Remove `adapters` resource
> **`DELETE`** /api/adapters/5d8b28ae0d7b4e1dac1993bc

### Response: `200 OK`
```json
{
    "_id": "5d8b28ae0d7b4e1dac1993bc",
    "name": "oh.generic.raw",
    "folder": "oh.generic.raw",
    "version": 1,
    "author": "Marc Stirner <marc.stirner@open-haus.io>",
    "description": "Send command 'payload' field direct to interface",
    "__v": 0
}
```