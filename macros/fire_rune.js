//DAE Macro Execute, Effect Value = "Macro Name" @target @attributes.spelldc

const lastArg = args[args.length - 1];
let tactor;
let actorCast = args[3].actorId;
actor = game.actors.get(actorCast);
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const target = canvas.tokens.get(lastArg.tokenId)

const DAEItem = lastArg.efData.flags.dae.itemData
const saveData = DAEItem.data.save

if (args[0] === "on") {
    game.cub.addCondition(["Restrained"], target);
    ChatMessage.create({ content: `Ignis Rune is applied to ${tactor.name}` })

}
if (args[0] === "off") {


    const hookId = Hooks.once("preUpdateCombat", (combat, changed, options, userId) => {
        if (!("turn" in changed)) return;

        if (combat.combatant.tokenId === args[2]) {
            game.cub.removeCondition(["Restrained"], target);

        }
        game.cub.removeCondition(["Concentrating"], args[3].token);
        ChatMessage.create({ content: `Ignis Rune is removed from ${tactor.name} ` });
    });


}
if (args[0] === "each") {

    let damageRoll = new Roll("2d6").roll();
    new MidiQOL.DamageOnlyWorkflow(tactor, target, damageRoll.total, "fire", [target], damageRoll, { flavor: `Ignis Rune Fire Damage` });
    //tactor.update({ "data.attributes.hp.temp": mod });
    ChatMessage.create({ content: "Ignis Rune continues on " + tactor.name })
    const flavor = `${CONFIG.DND5E.abilities[saveData.ability]} DC${saveData.dc} ${DAEItem?.name || ""}`;
    const saveDC = saveData.dc;
    let saveRoll = (await tactor.rollAbilitySave(saveData.ability, { flavor })).total;

    if (saveRoll >= saveDC) {
        ChatMessage.create({ content: `Ignis Rune ends for ${tactor.name} at the end of their turn` })
        tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
    }

}