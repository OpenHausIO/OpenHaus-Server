
### INTERFACES
2) req.(adapter|states).device.emit
   - benötigt ?
   - connection status für interface/connector ?!
   - middleware:
     - :<event> wrapper/handler/converter

### api.interfaces.ts
req.states = needed?! -> Adapter #2


### ADAPTER
1) Dokumentieren
2) states.js überarbeiten


### PLUGINS
1) Implementieren


### LOGGER
1) Grupieren/Gruppen
   - Adapter
   - RESTful API
   - Plugins
   - Interfaces/Connector?
2) refactor levels/index.ts
   - myCustomLevels


### DATABASE
2) Typescript für settings/commands etc...


### AUTHENTIFIZIERUNG (low)
1) interface auth
2) auto. token generation for connector (if valid/auth request)



### SZENEN
1) Implementieren
2) Makros
   - Promise.resolve(cmd, result)?!
   - if/else
   - date/time/value?!


https://stackoverflow.com/questions/6177423/send-broadcast-datagram
https://embeddedinn.wordpress.com/tutorials/upnp-device-architecture/
https://stackoverflow.com/questions/41853422/how-to-compile-typescript-using-npm-command