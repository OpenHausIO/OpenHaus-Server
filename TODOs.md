### GENERAL
1) Fix `//NOTE`, `//TODO`, `//FIXME`
2) Add 1) comments to build process warning/error
3) sub resources methods
   - get/put/post/delete...

4) Add ESlint/TSlint
5) Pass err.code to all error message ?!


### INTERFACES
1) req.(adapter|states).device.emit
   - benötigt ?
   - middleware:
     - :<event> wrapper/handler/converter


### ADAPTER
1) Dokumentieren
2) Install routine


### PLUGINS
1) Implementieren
2) Install routine


### UPDATES
1) Install routine


### LOGGER


### DATABASE


### AUTHENTIFIZIERUNG


### SZENEN
1) Implementieren -> sollte laufen
2) Makros
   - Promise.resolve(cmd, result)?!
   - if/else
   - date/time/value?!
3) fetch.ts -> Caching einrichten!


- remote/client ip richtig setzen (lib.auth/express)
- x-real-ip...
- BadRequest error
- process.env Boolean convert 
- remove password in response after an account is created