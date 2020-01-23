
//@ts-ignore
module.exports = (log) => {

    // code here gets only executed once:
    // only when the adapter gets initialized!
    // 
    // if you need to communicate between interfaces in your adapter,
    // create here a event emitter!
    log.debug("Adapter singleton init called!");

    //@ts-ignore
    return (iface) => {

        //console.log(iface)

    };

};