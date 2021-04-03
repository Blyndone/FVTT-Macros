//DAE Item Macro Execute, Effect Value = @attributes.spelldc

const lastArg = args[args.length - 1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);


const spellLevel = args[1]
/**
 * Create Moonbeam item in inventory
 */
if (args[0] === "on") {
 


  
  await tactor.createOwnedItem(
    {
      "name": "Scorching Ray EX",
  "type": "spell",
  "data": {
    "description": {
      "value": "<div  class=\"rd__b  rd__b--3\"><p>You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several.</p><div class=\"rd__spc-inline-post\"></div><p>Make a ranged spell attack for each ray. On a hit, the target takes [[/r 2d6]] fire damage.</p></div><div  class=\"rd__b  rd__b--3\"><div  class=\"rd__b  rd__b--3\"><span class=\"rd__h rd__h--3\" data-title-index=\"18\" > <span class=\"entry-title-inner\">At Higher Levels.</span></span> <p>When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd.</p><div class=\"rd__spc-inline-post\"></div></div><div class=\"rd__spc-inline-post\"></div></div>",
      "chat": "",
      "unidentified": ""
    },
    "source": "PHB",
    "activation": {
      "type": "special",
      "cost": 1,
      "condition": ""
    },
    "duration": {
      "value": null,
      "units": "inst"
    },
    "target": {
      "value": 1,
      "width": null,
      "units": "",
      "type": "creature"
    },
    "range": {
      "value": 120,
      "long": 0,
      "units": "ft"
    },
    "uses": {
      "value": spellLevel+1,
      "max": spellLevel+1,
      "per": ""
    },
    "consume": {
      "type": "",
      "target": "",
      "amount": null
    },
    "ability": "",
    "actionType": "rsak",
    "attackBonus": "0",
    "chatFlavor": "",
    "critical": null,
    "damage": {
      "parts": [
        [
          "2d6",
          "fire"
        ]
      ],
      "versatile": ""
    },
    "formula": "",
    "save": {
      "ability": "",
      "dc": null,
      "scaling": "spell"
    },
    "level": 2,
    "school": "evo",
    "components": {
      "value": "",
      "vocal": true,
      "somatic": true,
      "material": false,
      "ritual": false,
      "concentration": false
    },
    "materials": {
      "value": "",
      "consumed": false,
      "cost": 0,
      "supply": 0
    },
    "preparation": {
      "mode": "innate",
      "prepared": true
    },
    "scaling": {
      "mode": "none",
      "formula": ""
    }
  },
  "sort": -115625,
  "flags": {
    "midi-qol": {
      "onUseMacroName": ""
    },
    "favtab": {
      "isFavorite": false
    },
    "autoanimations": {
      "killAnim": false,
      "override": false,
      "animType": "t1",
      "animName": "",
      "color": "b1",
      "dtvar": "dt1",
      "explosion": false,
      "explodeVariant": "ev1",
      "explodeColor": "ec1",
      "explodeRadius": "0",
      "explodeLoop": "1"
    },
    "exportSource": {
      "world": "workshop",
      "system": "dnd5e",
      "coreVersion": "0.7.9",
      "systemVersion": "1.2.4"
    }
  },
  "img": "modules/plutonium/media/icon/spell/phb-scorching-ray.jpg",
  "effects": []
}
);
}

// Delete Moonbeam
if (args[0] === "off") {
 debugger;
  let casterItem = tactor.data.items.find(i => i.name === "Scorching Ray (Extra Attacks)" && i.type === "spell")
  tactor.deleteOwnedItem(casterItem._id)
}