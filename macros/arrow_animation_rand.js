//This macro plays the animation on selected targets with a trajectory and distances of 30ft, 60ft and 90ft
//And We play another animation on top of that on impact. Perfect for Explosive Arrows !
//folder 01 is the directory path to the Arrow assets and folder02 is for the Explosion

let folder01 = "https://assets.forge-vtt.com/bazaar/modules/jb2a_patreon-2d960ceba80cc778/assets/Library/Generic/Weapon_Attacks/Ranged/";
let folder02 = "modules/jb2a_patreon/Library/Generic/Explosion/"
// anFile30 points to the file corresponding to 30ft, anFile60 for 60ft and anFile90 for 90ft
//anFileXpl is for the file of the explosion.
let anFile30 = `${folder01}Arrow_Simple_01_30ft_1600x400.webm`;
let anFile60 = `${folder01}Arrow_Simple_01_60ft_2800x400.webm`;
let anFile90 = `${folder01}Arrow_Simple_01_90ft_4000x400.webm`;
let anFileXpl = `${folder02}Explosion_01_Orange_400x400.webm`;


//if(game.user.targets.size == 0) ui.notifications.error('You must target at least one token');
//if(canvas.tokens.controlled.length == 0) ui.notifications.error("Please select your token");
///Check if Module dependencies are installed or returns an error to the user
if (!canvas.fxmaster) ui.notifications.error("This macro depends on the FXMaster module. Make sure it is installed and enabled");

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function Cast() {
   var myStringArray = Array.from(game.user.targets)[0];
   var arrayLength = game.user.targets.size;
   for (var i = 0; i < arrayLength; i++) {

      let mainTarget = Array.from(game.user.targets)[i];
      let tarScale = ((mainTarget.data.width + mainTarget.data.height) / 2);
      let myToken = canvas.tokens.controlled[0];
      if (myToken == null) {
         myToken = canvas.tokens.ownedTokens[0];
      }

      let ray = new Ray(myToken.center, mainTarget.center);
      let anDeg = -(ray.angle * 57.3);
      let anDist = ray.distance;
      anDeg += (Math.random() - .5) * 3 * tarScale;
      anDist += (Math.random() - .5) * 50 * tarScale;



      let anFile = anFile30;
      let anFileSize = 600;
      let anchorX = 0.125;
      switch (true) {
         case (anDist <= 1200):
            anFileSize = 1200;
            anFile = anFile30;
            anchorX = 0.125;
            break;
         case (anDist > 2400):
            anFileSize = 3600;
            anFile = anFile90;
            anchorX = 0.05;
            break;
         default:
            anFileSize = 2400;
            anFile = anFile60;
            anchorX = 0.071;
            break;
      }

      let anScale = anDist / anFileSize;
      let anScaleY = anDist <= 600 ? 0.6 : anScale;

      let spellAnim = {
         file: anFile,
         position: myToken.center,
         anchor: {
            x: anchorX,
            y: 0.5
         },
         angle: anDeg,
         scale: {
            x: anScale,
            y: anScaleY
         }
      };

      let spellAnim2 = {
         file: anFileXpl,
         position: mainTarget.center,
         anchor: {
            x: 0.5,
            y: 0.5
         },
         angle: 0,
         scale: {
            x: tarScale,
            y: tarScale
         }
      };

      canvas.fxmaster.playVideo(spellAnim);
      await sleepNow(150);



      //canvas.fxmaster.playVideo(spellAnim2);
      //await sleepNow(250);
      game.socket.emit('module.fxmaster', spellAnim);
   }
}
Cast()