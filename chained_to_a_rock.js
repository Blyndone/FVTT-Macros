//Declarations

const lastArg = args[args.length - 1];
const caster = canvas.tokens.controlled[0];
let targetActor;
if (lastArg.tokenId) targetActor = canvas.tokens.get(lastArg.tokenId).actor;
else {
	const targetId = game.actors.get(lastArg.actorId);
}
let rockTok;
let hookId;

async function UpdateRock() {

	let rockTok = canvas.tokens.placeables.filter(i => i.data.flags.SKT?.Rock?.ActorId === targetActor.id);

	let rot = GetRay(rockTok[0].data.x, rockTok[0].data.y);
	await rockTok[0].update({
		rotation: rot
	})
}

function GetRay(xpos, ypos) {
	xpos += canvas.grid.size / 2;
	ypos += canvas.grid.size / 2;
	let ray = new Ray({
		x: xpos,
		y: ypos
	}, targetActor.token.center);
	// Determines the angle
	return (Math.floor(ray.angle * 57.3));
}

async function DropToken(actor, xpos, ypos) {

	// set stuff
	const rTok = game.actors.getName(actor);
	let rot = GetRay(xpos, ypos);

	const extraTokenData = {
		x: xpos,
		y: ypos,
		data: {
			token: {
				rotation: rot

			}
		},
		rotation: rot,
		flags: {
			SKT: {
				Rock: {
					ActorId: targetActor.id
				}
			}
		},
	};
	// Set Flags

	const rockToken = await Token.fromActor(rTok, extraTokenData);
	await Token.create(rockToken.data);
	rockTok = rockToken;
	rockTok.rotation = rot;
	//rockTok.update({ "rotation": rot });
	// drop token;
}



async function CapitanHook() {
	hookId = Hooks.on("updateToken", UpdateRock);
	await DAE.setFlag(targetActor, "CTRhook", hookId)
}


if (args[0] === "on") {
	// Create AE on target;
	// Range Template;
	let range = MeasuredTemplate.create({
		t: "circle",
		user: game.user._id,
		x: targetActor.token.x + canvas.grid.size / 2,
		y: targetActor.token.y + canvas.grid.size / 2,
		fillColor: game.user.color,
		direction: 0,
		distance: 30,
		borderColor: "#FF0000",
		flags: {
			SKT: {
				CTRtar: {
					ActorId: targetActor.id
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
				SKT: {
					CTRtar: {
						ActorId: targetActor.id
					}
				}
			}
		};
		Hooks.once("createMeasuredTemplate", DropRockAndDeleteTemplates);
		let template = new game.dnd5e.canvas.AbilityTemplate(templateData);
		template.actorSheet = targetActor.sheet;
		template.drawPreview();

		async function DropRockAndDeleteTemplates(scene, template) {

			CapitanHook();
			let tempX = template.x;
			let tempY = template.y;
			DropToken("Chained to a Rock", tempX, tempY);
			let removeTemplates = canvas.templates.placeables.filter(i => i.data.flags.SKT?.CTRtar?.ActorId === targetActor.id);
			canvas.templates.deleteMany([removeTemplates[0].id, removeTemplates[1].id]);


			let flag = await DAE.getFlag(targetActor, 'CTRhook');
			//const hookId = Hooks.on("updateToken", UpdateRock);
			//	Hooks.on("updateToken", "UpdateRock()");
		}
	});


};

if (args[0] === "off") {
	let hookId = await DAE.getFlag(targetActor, "CTRhook");
	Hooks.off("updateToken", hookId);
	DAE.unsetFlag(targetActor, "CTRhook");
	await targetActor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
	//   Delete ChainedtoRock
	//   delete update hook
	//   delete AE?



};