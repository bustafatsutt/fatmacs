class FatMacs {

    static targets(args) {
        const lastArg = args[args.length - 1];
        let tactor, ttoken;
        if (lastArg.tokenId) {
            ttoken = canvas.tokens.get(lastArg.tokenId);
            tactor = ttoken.actor
        }
        else tactor = game.actors.get(lastArg.actorId);
        return { actor: tactor, token: ttoken, lArgs: lastArg }
    }
    /**
     * 
     * @param {Object} templateData 
     * @param {Actor5e} actor 
     */
    static templateCreation(templateData, actor) {
        let doc = new CONFIG.MeasuredTemplate.documentClass(templateData, { parent: canvas.scene })
        let template = new game.dnd5e.canvas.AbilityTemplate(doc)
        template.actorSheet = actor.sheet;
        template.drawPreview()
    }

    /**
     * 
     * @param {String} flagName 
     * @param {Actor5e} actor 
     */
    static async deleteTemplates(flagName, actor) {
        let removeTemplates = canvas.templates.placeables.filter(i => i.document.flags["fatmacs"]?.[flagName]?.ActorId === actor.id);
        let templateArray = removeTemplates.map(function (w) { return w.id })
        if (removeTemplates) await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateArray)
    };

    static async deleteTokens(flagName, actor) {
        let removeTokens = canvas.tokens.placeables.filter(i => i.document.flags["fatmacs"]?.[flagName]?.ActorId === actor.id);
        let tokenArray = removeTokens.map(function (w) { return w.id })
        if (removeTokens) await canvas.scene.deleteEmbeddedDocuments("Token", tokenArray)
    };

    /**
     * 
     * @param {String} flagName 
     * @param {Actor5e} actor 
     */
    static async deleteItems(flagName, actor) {
        let items = actor.items.filter(i => i.flags["fatmacs"]?.[flagName]?.ActorId === actor.id)
        let itemArray = items.map(function (w) { return w._id })
        if (itemArray.length > 0) await actor.deleteEmbeddedDocuments("Item", itemArray);
    }

    /**
     * 
     * @param {String} name 
     * @param {Actor5e} actor 
     */
    static async addDfred(name, actor) {
        await game.dfreds.effectInterface.addEffect({ effectName: name, uuid: actor.uuid })
    }

    /**
     * 
     * @param {String} name 
     * @param {Actor5e} actor 
     */
    static async removeDfred(name, actor) {
        await game.dfreds.effectInterface.removeEffect({ effectName: name, uuid: actor.uuid })
    }

    /**
     * 
     * @param {Token} token Token to move
     * @param {Number} maxRange Range in ft
     * @param {String} name Name of the Effect
     * @param {Boolean} animate Animate move, default false
     */
    static async moveToken(token, maxRange, name, animate = false){
        let snap = token.document.width/2 === 0 ? 1 : -1
        let {x, y} = await this.warpgateCrosshairs(token, maxRange, name, token.document.texture.src, token.document, snap)
        let pos = canvas.grid.getSnappedPosition(x-5, y-5, 1)
        await token.document.update(pos, {animate : animate})
    }

    /**
     * 
     * @param {Token} source Source of range distance (usually)
     * @param {Number} maxRange range of crosshairs
     * @param {String} name Name to use
     * @param {String} icon Crosshairs Icon
     * @param {Object} tokenData {height; width} 
     * @param {Number} snap snap position, 2: half grid intersections, 1: on grid intersections, 0: no snap, -1: grid centers, -2: half grid centers
     * @returns 
     */
    static async warpgateCrosshairs(source, maxRange, name, icon, tokenData, snap) {
        const sourceCenter = source.center;
        let cachedDistance = 0;
        const checkDistance = async (crosshairs) => {

            while (crosshairs.inFlight) {
                //wait for initial render
                await warpgate.wait(100);
                const ray = new Ray(sourceCenter, crosshairs);
                const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0]

                //only update if the distance has changed
                if (cachedDistance !== distance) {
                    cachedDistance = distance;
                    if (distance > maxRange) {
                        crosshairs.icon = 'icons/svg/hazard.svg'
                    } else {
                        crosshairs.icon = icon
                    }
                    crosshairs.draw()
                    crosshairs.label = `${distance}/${maxRange} ft`
                }
            }

        }
        const callbacks = {
            show: checkDistance
        }
        const location = await warpgate.crosshairs.show({ size: tokenData.width, icon: source.document.texture.src, label: '0 ft.', interval: snap }, callbacks)
        console.log(location)

        if (location.cancelled) return false;
        if (cachedDistance > maxRange) {
            ui.notifications.error(`${name} has a maximum range of ${maxRange} ft.`)
            return false;
        }
        return location
    }

    static hasMutation(token,mutName) {
        const tokenDoc = token.document ?? token;
        const stack = warpgate.mutationStack(tokenDoc);
        return !!stack.getName(mutName)
    }
    static async dragonsBreath(args){
        let tokenDoc = canvas.scene.tokens.get(lastArg.tokenId);

if(args[0] === "on") {

const buttonData = {buttons: [{
		label: 'Acid',
		value: {
				embedded: { Item: { 
					 "Dragons Breath": {
						'data.damage' : {
							parts: [
								["3d6","acid"]
							  ],
						}
					 }
				 }}
			  }
	},{
		label: 'Cold',
		value: {
				embedded: { Item: { 
					 "Dragons Breath": {
						'data.damage' : {
							parts: [
								["3d6","cold"]
							  ],
						}
					 }
				 }}
			  }
	},{
		label: 'Fire',
		value: {
				embedded: { Item: { 
					 "Dragons Breath": {
						'data.damage' : {
							parts: [
								["3d6","fire"]
							  ],
						}
					 }
				 }}
			  }
	},{
		label: 'Lightning',
		value: {
				embedded: { Item: { 
					 "Dragons Breath": {
						'data.damage' : {
							parts: [
								["3d6","lightning"]
							  ],
						}
					 }
				 }}
			  }
	},{
		label: 'Poison',
		value: {
				embedded: { Item: { 
					 "Dragons Breath": {
						'data.damage' : {
							parts: [
								["3d6","poison"]
							  ],
						}
					 }
				 }}
			  }
	}
	], title: 'Which element?'};
	
  let element = await warpgate.buttonDialog(buttonData);

	//Updates to Token DELETE ANY UNNEEDED SECTIONS
	let updates = {
		embedded: {
			Item: {
				"Dragons Breath": { //String
					type: "feat", // feat, spell
					img: "Custom%20Images/magesc_elemental_dragons_by_cat_party-d6d39id%20(1).png", //Example: "icons/magic/holy/projectiles-blades-salvo-yellow.webp"
					data: {
						description: {
							value: "<p>Until the spell ends, the creature can use an action to exhale energy of the chosen type in a 15-foot cone. Each creature in that area must make a Dexterity saving throw, taking 3d6 damage of the chosen type on a failed save, or half as much damage on a successful one.</p><p>At Higher Levels. When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d6 for each slot level above 2nd.</p>", //String
							},
						equipped: true,
						activation: {
							type: "action", // action, bonus, crew, day, hour, lair, legendary, minute, none, reaction, special, reactiondamage, reactionmanual
							cost: 1, // Numeric
							},
						duration: {
							units: "inst" // inst, turn, round, minute, hour, day, month, year, perm, spec
							},
						target: {
							value: 15,
							units: "ft",
							type: "cone" // ally, cone, cube, cylinder, enemy, line, none, object, radius, self, space, sphere, square, wall
							},
						ability: "",
						actionType: "rsak", // mwak, rwak, msak, rsak, save, heal, abil, util, other
						save: {
							ability: "dex", // str, dex, con, int, wis, cha
							dc: "",
							scaling: "dex", // spell, str, dex, con, int, wis, cha, flat
							},
						// Active Effects
						effects: [],
						}
					}
				}
			}
		};
		updates = mergeObject(updates, element);
		await warpgate.mutate(tokenDoc, updates);
	}
	else if(args[0] === "off") {
		await warpgate.revert(tokenDoc)
	}
    }
    static async GomuGomu(args) {
        const { actor, token, lArgs } = FatMacs.targets(args)
        // we see if the equipped weapons have base weapon set and filter on that, otherwise we just get all weapons
        const filteredWeapons = actor.items
            .filter((i) => i.type === "weapon" && (i.system.baseItem === "sling"));
        const weapons = (filteredWeapons.length > 0)
            ? filteredWeapons
            : actor.itemTypes.weapon;

        const weapon_content = weapons.map((w) => `<option value=${w.id}>${w.name}</option>`).join("");
        if (args[0] === "on") {
            const content = `
                <div class="form-group">
                <label>Weapons : </label>
                <select name="weapons">
                ${weapon_content}
                </select>
                </div>
                `;
        
            new Dialog({
                title: "Gomu Gomu no?",
                content,
                buttons: {
                    Ok: {
                        label: "BIG BOOMBALL BLAST",
                        callback: async (html) => {
                            const itemId = html.find("[name=weapons]")[0].value;
                            const weaponItem = actor.getEmbeddedDocument("Item", itemId);
                            const weaponCopy = duplicate(weaponItem);
                            await DAE.setFlag(actor, "BIG BOOMBALL BLAST", {
                                id: itemId,
                                name: weaponItem.name,
                                damage: weaponItem.system.damage.parts[0][0],
                                save: weaponItem.system.save.ability, 
                                dc: weaponItem.system.save.dc,
                                scaling: weaponItem.system.save.scaling,
                                magical: getProperty(weaponItem, "system.properties.mgc") || false,
                            });
                            const damage = weaponCopy.system.damage.parts[0][0];
                            const targetAbilities = actor.system.abilities;
                            weaponCopy.system.damage.parts[0][0] = damage.replace(/1d(6)/g, "2d8+2");
                            weaponCopy.system.save.ability = "str";
                            weaponCopy.system.save.dc = "17";
                            weaponCopy.system.save.scaling = "flat";
                            weaponCopy.name = weaponItem.name + " [BIG BOOMBALL BLAST]";
                            setProperty(weaponCopy, "system.properties.mgc", true);
                            await actor.updateEmbeddedDocuments("Item", [weaponCopy]);
                            await ChatMessage.create({
                                content: weaponCopy.name + " is empowered by BIG BOOMBALL BLAST",
                            });
                        },
                    },
                    Cancel: {
                        label: `Cancel`,
                    },
                },
            }).render(true);
        }
        
        if (args[0] === "off") {
            const flag = DAE.getFlag(actor, "BIG BOOMBALL BLAST");
            const weaponItem = actor.getEmbeddedDocument("Item", flag.id);
            const weaponCopy = duplicate(weaponItem);
            weaponCopy.system.damage.parts[0][0] = flag.damage;
            weaponCopy.system.save.ability = flag.save;
            weaponCopy.system.save.dc = flag.dc;
            weaponCopy.system.save.scaling = flag.scaling;
            weaponCopy.name = flag.name;
            setProperty(weaponCopy, "system.properties.mgc", flag.magical);
            await actor.updateEmbeddedDocuments("Item", [weaponCopy]);
            await DAE.unsetFlag(target, "BIG BOOMBALL BLAST");
            await ChatMessage.create({ content: weaponCopy.name + " returns to normal" });
        }
        }
    }