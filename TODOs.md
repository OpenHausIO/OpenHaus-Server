### GENERAL
1) Fix `//NOTE`, `//TODO`, `//FIXME`
2) Add 1) comments to build process warning/error


### INTERFACES
2) req.(adapter|states).device.emit
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


### AUTHENTIFIZIERUNG (low)
1) interface auth
2) auto. token generation for connector (if valid/auth request)


### SZENEN
1) Implementieren -> sollte laufen
2) Makros
   - Promise.resolve(cmd, result)?!
   - if/else
   - date/time/value?!
3) fetch.ts -> Caching einrichten!