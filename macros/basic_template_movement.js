//DAE Macro Execute, Effect Value = @item
const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const target = canvas.tokens.get(lastArg.tokenId) || token;

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


if (args[0] === "on") {
	let myRange = args[1].data.range.value;
	let range = MeasuredTemplate.create({
		t: "circle",
		user: game.user._id,
		x: target.x + canvas.grid.size / 2 * tactor.data.token.width,
		y: target.y + canvas.grid.size / 2 * tactor.data.token.height,
fillColor: game.user.color,
		direction: 0,
		distance: myRange,

		borderColor: "#FF0000",
		flags: {
			SKT: {
				Move: {
					ActorId: tactor.id
				}
			}
		}
		
	});

	range.then(result => {
	
		let templateData = {
			t: "rect",
			user: game.user._id,
			distance: 7.5*tactor.data.token.width,
			direction: 45,
			x: 0,
			y: 0,
			fillColor: game.user.color,
			flags: {
				SKT: {
					Move: {
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

			let removeTemplates = canvas.templates.placeables.filter(i => i.data.flags.SKT?.Move?.ActorId === tactor.id);


			await target.update({ x: template.x, y: template.y })
					
			await canvas.templates.deleteMany([removeTemplates[0].id, removeTemplates[1].id]);
			await tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
			

		};
	});

}