const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);


if (args[0] === "on") {
  async function dropManyTokens(actorName, number) {
    if (canvas.tokens.controlled.length == 0) {
      ui.notifications.error("Please select a token");
      return;
    }
    let myToken = canvas.tokens.controlled[0];

    function randInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min
    }

    function pos() {

      let pos = [myToken.position.x, myToken.position.y];
      return pos;

    }

    const actor = game.actors.getName(actorName);


    for (var i = 0; i < number; i++) {

      var xOff = pos()[0];
      var yOff = pos()[1];
      switch (i) {
        case 0:
          xOff = pos()[0] + canvas.grid.size;
          break;

        case 1:
          xOff = pos()[0] - canvas.grid.size;
          break;

        case 2:
          yOff = pos()[1] + canvas.grid.size;
          break;

        case 3:
          yOff = pos()[1] - canvas.grid.size;
          break;
      }


      const extraTokenData = {
        x: xOff,
        y: yOff,
        flags: {
          DL: {
            DancingLights: {
              ActorId: tactor.id
            }
          }
        },
      }
      const token = await Token.fromActor(actor, extraTokenData);
      await Token.create(token.data);
    }

  }

  dropManyTokens("Dancing light - Wildcard", 4);
}





if (args[0] === "off") {

  let dlToks = canvas.tokens.placeables.filter(i => i.data.flags?.DL?.DancingLights?.ActorId === tactor.id)
  var dlToksID = [];
  var i = 0;
  for (i = 0; i < dlToks.length; i++) {

    dlToksID.push(dlToks[i].data._id);

  }

  await canvas.tokens.deleteMany(dlToksID)



}