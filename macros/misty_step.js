//DAE Macro Execute, Effect Value = "Macro Name" @target 
const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const target = canvas.tokens.get(lastArg.tokenId) || token;
const folder01 = "modules/jb2a_patreon/Library/Generic/Portals/";
//anFile is the name of the file used fRedhe animation

//seed is the animation to play.  Can be overwritten to a single color by setting seed to a specific number.
let seed = Math.floor(Math.random() * 18) + 1;
//seed = 1;
var anFile;

switch (seed) {
	case 1:
		anFile = `${folder01}Portal_Bright_Blue_V_400x250.webm`;
		break;
	case 2:
		anFile = `${folder01}Portal_Bright_Green_V_400x250.webm`;
		break;
	case 3:
		anFile = `${folder01}Portal_Bright_Orange_V_400x250.webm`;
		break;
	case 4:
		anFile = `${folder01}Portal_Bright_Purple_V_400x250.webm`;
		break;
	case 5:
		anFile = `${folder01}Portal_Bright_Red_V_400x250.webm`;
		break;
	case 6:
		anFile = `${folder01}Portal_Bright_Yellow_V_400x250.webm`;
		break;
	case 7:
		anFile = `${folder01}Portal_Dark_Blue_V_400x250.webm`;
		break;
	case 8:
		anFile = `${folder01}Portal_Dark_Green_V_400x250.webm`;
		break;
	case 9:
		anFile = `${folder01}Portal_Dark_Purple_V_400x250.webm`;
		break;
	case 10:
		anFile = `${folder01}Portal_Dark_Red_V_400x250.webm`;
		break;
	case 11:
		anFile = `${folder01}Portal_Dark_RedYellow_V_400x250.webm`;
		break;
	case 12:
		anFile = `${folder01}Portal_Dark_Yellow_V_400x250.webm`;
		break;
	case 13:
		anFile = `${folder01}Portal_Vortex_Blue_V_400x300.webm`;
		break;
	case 14:
		anFile = `${folder01}Portal_Vortex_Green_V_400x300.webm`;
		break;
	case 15:
		anFile = `${folder01}Portal_Vortex_Orange_V_400x300.webm`;
		break;
	case 16:
		anFile = `${folder01}Portal_Vortex_Purple_V_400x300.webm`;
		break;
	case 17:
		anFile = `${folder01}Portal_Vortex_Red_V_400x300.webm`;
		break;
	case 18:
		anFile = `${folder01}Portal_Vortex_Yellow_V_400x300.webm`;
		break;

}

let anDeg;
let ray;
let tok;
let myScale = canvas.grid.size / 100 * .6;
const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


if (args[0] === "on") {

	let range = MeasuredTemplate.create({
		t: "circle",
		user: game.user._id,
		x: target.x + canvas.grid.size / 2,
		y: target.y + canvas.grid.size / 2,
		fillColor: game.user.color,
		direction: 0,
		distance: 30,

		borderColor: "#FF0000",
		flags: {
			DAESRD: {
				MistyStep: {
					ActorId: tactor.id
				}
			}
		}

	});

	range.then(result => {
		let templateData = {
			t: "rect",
			user: game.user._id,
			distance: 7.5,
			direction: 45,
			x: 0,
			y: 0,
			fillColor: game.user.color,
			flags: {
				DAESRD: {
					MistyStep: {
						ActorId: tactor.id
					}
				}
			}
		};



		Hooks.once("createMeasuredTemplate", deleteTemplatesAndMove);

		let template = new game.dnd5e.canvas.AbilityTemplate(templateData);
		template.actorSheet = tactor.sheet;
		template.drawPreview();

		async function deleteTemplatesAndMove(scene, template) {

			let removeTemplates = canvas.templates.placeables.filter(i => i.data.flags.DAESRD?.MistyStep?.ActorId === tactor.id);


			tok = target
			if (tok != undefined) {

				ray = new Ray(tok.center, {
					x: template.x + canvas.grid.size / 2,
					y: template.y + canvas.grid.size / 2
				});
				// Determines the angle
				anDeg = -(ray.angle * 57.3) - 90;

				const data = {
					file: anFile,
					position: tok.center,
					anchor: {
						x: .5,
						y: .85
					},
					angle: anDeg,
					speed: 0,
					scale: {
						x: myScale,
						y: myScale
					}
				}

				canvas.fxmaster.playVideo(data);
				game.socket.emit('module.fxmaster', data);

			}





			tok.update({
				"hidden": !tok.data.hidden
			})
			await target.update({
				x: template.x,
				y: template.y
			})
			await wait(700);

			if (tok != undefined) {

				anDeg = -(ray.angle * 57.3) - 90;



				const data2 = {
					file: anFile,
					position: {
						x: template.x + canvas.grid.size / 2,
						y: template.y + canvas.grid.size / 2
					},
					anchor: {
						x: .5,
						y: .85
					},
					angle: anDeg,
					speed: 0,
					scale: {
						x: -myScale,
						y: -myScale
					}
				}

				canvas.fxmaster.playVideo(data2);
				game.socket.emit('module.fxmaster', data2);

			}

			await canvas.templates.deleteMany([removeTemplates[0].id, removeTemplates[1].id]);
			await tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
			await wait(300);
			tok.update({
				"hidden": !tok.data.hidden
			})

		};
	});

}