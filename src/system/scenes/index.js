

module.exports = (scene) => {


    console.log("Execute scene %s", scene.name);

    const tree = [];

    scene.banks.forEach((bank, index) => {

        const scene = fetchCommands(bank);
        //const cenes = runScene(commands);

        /*
        scene.then(() => {
            console.log("Scene in bank %d complete", index);
        }).catch(() => {
            console.log("Scene in bank %d catched!", index);
        });*/

        tree.push(scene);

    });




    Promise.all(tree).then(() => {
        console.log("Scene (all banks) executed!")
    }).catch(() => {
        console.log("Scene error!");
    });



};