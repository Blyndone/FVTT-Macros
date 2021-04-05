if (args[0].tag === "OnUse") {
  // Sample Hunters mark
  if (args[0].hitTargets.length === 0) return;
  let target = args[0].hitTargets[0]._id;
  let actorId = args[0].actor._id; // actor who cast the spell
  actor = game.actors.get(actorId);
  if (!actor || !target) {
    console.error("Hex: no token/target selected");
    return;
  }

  // create an active effect, 
  //  one change showing the hunter's mark icon on the caster
  //  the second setting the flag for the macro to be called when damaging an opponent
  const effectData = {
    changes: [{
        key: "flags.midi-qol.huntersMark",
        mode: 5,
        value: target,
        priority: 20
      }, // who is marked
      {
        key: "flags.dnd5e.DamageBonusMacro",
        mode: 5,
        value: `ItemMacro.${args[0].item.name}`,
        priority: 20
      }, // macro to apply the damage
      {
        key: "flags.midi-qol.concentration-data.targets",
        mode: 2,
        value: {
          "actorId": actorId,
          "tokenId": args[0].tokenId
        },
        priority: 20
      }
    ],
    origin: args[0].uuid, //flag the effect as associated to the spell being cast
    disabled: false,
    duration: args[0].item.effects[0].duration,
    label: args[0].item.name
  }
  await actor.createEmbeddedEntity("ActiveEffect", effectData);
} else if (args[0].tag === "DamageBonus") {
  if (args[0].hitTargets.length === 0) return;
  let targetId = args[0].hitTargets[0]._id;
  // only weapon attacks
  if (!["mwak", "rwak", "rsak", "msak"].includes(args[0].item.data.actionType)) return {};
  // only on the marked target
  if (targetId !== getProperty(args[0].actor.flags, "midi-qol.huntersMark")) return {};
  let damageType = "Necrotic";
  return {
    damageRoll: `1d6[${damageType}]`,
    flavor: "Hex Damage"
  }
}