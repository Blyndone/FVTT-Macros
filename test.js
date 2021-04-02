if (args[0] === "on") {
async function dropManyTokens(actorName, number){
    if(canvas.tokens.controlled.length == 0) {ui.notifications.error("Please select a token");
return;
}
let myToken = canvas.tokens.controlled [0];
    function randInt(min, max){
      return Math.floor(Math.random() * (max - min)) + min
    }
    
    function pos(){
        
        let pos = [myToken.position.x, myToken.position.y];
        return pos;
       
    }
    
    
    function convertCoord (square) {
      return [
        ( square[0] + 0.5 ) * canvas.grid.w,
        canvas.grid.height - (( square[1] + 0.5 ) * canvas.grid.h),
        ];
    }
  
    const actor = game.actors.getName(actorName);
   
  
    for (var i = 0; i < number; i++){
        console.log(pos());
        var xOff = pos()[0];
        var yOff = pos()[1];
        switch (i) {
            case 0:
                 xOff = pos()[0]+canvas.grid.size;
        break;

        case 1:
             xOff = pos()[0]-canvas.grid.size;
           break;

           case 2:
             yOff = pos()[1]+canvas.grid.size;
        break;

        case 3:
             yOff = pos()[1]-canvas.grid.size;
        break;
        }


        // let xOff = pos()[0]+canvas.grid.size;
        // let yOff = pos()[1]+canvas.grid.size;
        

        const extraTokenData = {
        x: xOff,
        y: yOff,
      };
      const token = await Token.fromActor(actor, extraTokenData);
      await Token.create(token.data);
    }
    
}
    
    dropManyTokens("Dancing light - Wildcard", 4);
}

if (args[0] === "off") {

    let token = canvas.scene.data.tokens.find(token => token.name = 'Dancing light - Wildcard');
    canvas.tokens.deleteMany(token.id);






}