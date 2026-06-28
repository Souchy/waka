import { route } from "@aurelia/router";
import { ILogger, resolve } from "aurelia";
import { ItemSlotEnum } from "src/data/itemSlots";
import { mainMasteries } from "src/data/stats/main_masteries";
import { mainResistances } from "src/data/stats/main_resistances";
import { otherStats } from "src/data/stats/other";
import { secondaryMasteries } from "src/data/stats/secondary_masteries";
import { secondaryResistances } from "src/data/stats/secondary_resistances";
import { ActionModel } from "src/models/ankama/ActionModel";
import { EffectModel, ItemModel } from "src/models/ankama/ItemModel";
import { ItemTypeModel } from "src/models/ankama/ItemTypeModel";
import { ModelsEnum } from "src/models/ankama/ModelsEnum";
import { JsonService } from "src/services/JsonService";
import { ItemExplorer } from "src/views/item-explorer/ItemExplorer";
import { ItemFilter } from "src/views/item-filter/ItemFilter";
// import major_stats from "src/data/major_stats.json";
// import masteries from "src/data/masteries.json";
// import other_stats from "src/data/other_stats.json";
// import resistances from "src/data/resistances.json";

@route({
	id: 'wizard',
	path: 'wizard',
	title: 'Build Wizard',
})
export class BuildWizard {
	private readonly logger = resolve(ILogger).scopeTo("BuildWizard");
	private readonly json = resolve(JsonService);

	public get itemTypes(): ItemTypeModel[] | undefined {
		return this.json.getCached<ItemTypeModel[]>(ModelsEnum.itemTypes);
	}
	public get allItems(): ItemModel[] | undefined {
		return this.json.getCached<ItemModel[]>(ModelsEnum.items);
	}
	public get actions(): ActionModel[] | undefined {
		return this.json.getCached<ActionModel[]>(ModelsEnum.actions);
	}


	// Toggle elemental masteries
	public toggleFireMastery = false;
	public toggleWaterMastery = false;
	public toggleEarthMastery = false;
	public toggleAirMastery = false;
	// Toggle secondary masteries
	public toggleMeleeMastery = false;
	public toggleRangedMastery = false;
	public toggleBerserkMastery = false;
	public toggleCriticalMastery = false;



	// public minimumElementsCount: number = 0;
	// // Sum chosen elements + chosen secondaries
	// public maitrise1: StatParameter = new StatParameter();
	// public maitrise2: StatParameter = new StatParameter();
	// public maitrise3: StatParameter = new StatParameter();
	// public maitrise4: StatParameter = new StatParameter();


	public major_stats: Map<number, StatParameter> = new Map<number, StatParameter>();
	public masteries: Map<number, StatParameter> = new Map<number, StatParameter>();
	public resistances: Map<number, StatParameter> = new Map<number, StatParameter>();

	public itemSlots = new Map<ItemSlotEnum, ItemModel | undefined>();

	async created() {
		// let items = await this.json.get<ItemModel[]>(ModelsEnum.items);
		// this.allItems = items;

		for (const slot of Object.values(ItemSlotEnum)) {
			this.itemSlots.set(slot, undefined as unknown as ItemModel);
		}
		// Initialize stats map with important stats
		for (const stat of otherStats) {
			this.major_stats.set(stat.id, new StatParameter(stat));
		}
		for (const stat of mainMasteries) {
			this.masteries.set(stat.id, new StatParameter(stat));
		}
		for (const stat of secondaryMasteries) {
			this.masteries.set(stat.id, new StatParameter(stat));
		}
		for (const stat of mainResistances) {
			this.resistances.set(stat.id, new StatParameter(stat));
		}
		for (const stat of secondaryResistances) {
			this.resistances.set(stat.id, new StatParameter(stat));
		}
	}

	public get major_stats_list() { return Array.from(this.major_stats.values()); }
	public get masteries_list() { return Array.from(this.masteries.values()); }
	public get resistances_list() { return Array.from(this.resistances.values()); }
	public get all_stats_list() { return [...this.major_stats_list, ...this.masteries_list, ...this.resistances_list]; }

	public getAction(actionId: number): ActionModel | undefined {
		return this.actions?.find(a => a.definition.id === actionId);
	}

	public clickGenerate() {
		this.logger.debug("Generate button clicked", this.major_stats);

		let items = this.allItems?.filter(item => {
			if (item.definition.item.level > 170) return false;
			if (item.definition.item.level < 166) return false;

			let weight = this.calculateWeight(item);
			item.customAdditionalInfo = { weight: weight };
			if (weight <= 0) return false; //continue;

			return true;
		});

		let epicItems = [];
		let relicItems = [];

		for (const item of items || []) {
			if (item.definition.item.baseParameters.rarity == 5) {
				epicItems.push(item);
				continue;
			}
			if (item.definition.item.baseParameters.rarity == 7) {
				relicItems.push(item);
				continue;
			}

			let type = this.itemTypes?.find(t => t.definition.id === item.definition.item.baseParameters.itemTypeId);
			let weight = item.customAdditionalInfo?.weight || 0;

			let goodPosition = null;
			for (const position of type?.definition.equipmentPositions || []) {
				const posEnum = position as ItemSlotEnum;
				let currentItem = this.itemSlots.get(posEnum);
				let currentWeight = currentItem?.customAdditionalInfo?.weight || 0;
				if (!currentItem || weight > currentWeight) {
					goodPosition = posEnum;
				}
				if(currentItem?.definition.item.id === item.definition.item.id) {
					goodPosition = null;
				}
			}
			if(goodPosition) {
				this.itemSlots.set(goodPosition, item);
			}
		}

		// epicItems.map(item => {
		// 	let type = this.itemTypes?.find(t => t.definition.id === item.definition.item.baseParameters.itemTypeId);
		// });

		let bestWeightDiff = -1000;
		let bestEpic = epicItems[0];
		let bestSlot = ItemSlotEnum.FIRST_WEAPON;
		for (const item of epicItems || []) {
			let type = this.itemTypes?.find(t => t.definition.id === item.definition.item.baseParameters.itemTypeId);
			
			for (const position of type?.definition.equipmentPositions || []) {
				const posEnum = position as ItemSlotEnum;
				let currentItem = this.itemSlots.get(posEnum);
				let diff = (item.customAdditionalInfo?.weight || 0) - (currentItem?.customAdditionalInfo?.weight || 0);
				if (diff > bestWeightDiff) {
					bestWeightDiff = diff;
					bestEpic = item;
					bestSlot = posEnum;
				}
			}
		}
		this.itemSlots.set(bestSlot, bestEpic);

		bestWeightDiff = -1000;
		bestEpic = relicItems[0];
		bestSlot = ItemSlotEnum.FIRST_WEAPON;
		for (const item of relicItems || []) {
			let type = this.itemTypes?.find(t => t.definition.id === item.definition.item.baseParameters.itemTypeId);
			
			for (const position of type?.definition.equipmentPositions || []) {
				const posEnum = position as ItemSlotEnum;
				let currentItem = this.itemSlots.get(posEnum);
				let diff = (item.customAdditionalInfo?.weight || 0) - (currentItem?.customAdditionalInfo?.weight || 0);
				if (diff > bestWeightDiff) {
					bestWeightDiff = diff;
					bestEpic = item;
					bestSlot = posEnum;
				}
			}
		}
		this.itemSlots.set(bestSlot, bestEpic);


		// let explorer = resolve(ItemExplorer);
		// let filter = resolve(ItemFilter);
		// filter.minLevel = 166;
		// filter.maxLevel = 170;
		// filter.toggleMainMastery.find(t => t.id === 122)!.active = true; // Activate FIRE mastery
		// filter.toggleMainResistances.find(t => t.id === 120)!.active = true; // Activate ELEMENTAL mastery
		// filter.toggleMainResistances.find(t => t.id === 1068)!.active = true; // Activate ELEMENTAL count mastery
		// filter.toggleSecondaryMastery.find(t => t.id === 1053)!.active = true; // Activate RANGED mastery

		// filter.toggleMainMastery.find(t => t.id === 39)!.active = true; // Activate ARMOR_GIVEN mastery
		// filter.toggleMainResistances.find(t => t.id === 1)!.active = true; // Activate FIRE resistance
		// filter.toggleSecondaryMastery.find(t => t.id === 43)!.active = true; // Activate MELEE mastery
		// filter.toggleSecondaryResistances.find(t => t.id === 5)!.active = true; // Activate EARTH resistance
		// filter.toggleOther.find(t => t.id === 100)!.active = true; // Activate CRITICAL mastery
		// filter.minStats = this.major_stats_list.filter(s => s.value > 0);
		// filter.minMasteries = this.masteries_list.filter(s => s.value > 0);
		// filter.minResistances = this.resistances_list.filter(s => s.value > 0);

		// filter.itemExplorer = explorer;
		// explorer.attached();
		// filter.attached();
		// let allItems = filter.itemExplorer?.allItems;
	}


	public calculateWeight(item: ItemModel): number {
		let weight = 0;
		for (const toggle of this.all_stats_list) {
			item.definition.equipEffects.forEach(effect => {
				const value = effect.effect.definition.params[0] || 1;
				if (effect.effect.definition.actionId === toggle.id) {
					if (toggle.id === 39) {
						if (this.isEffectDescriptionContains(effect.effect, toggle.name || "")) {
							weight += value * toggle.weight;
						}
					} else {
						weight += value * toggle.weight;
					}
				}
				if (effect.effect.definition.actionId === toggle.opposite) {
					weight -= value * toggle.weight;
				}
			});
		}
		return weight;
	}
	private isEffectDescriptionContains(effect: EffectModel, text: string): boolean {
		return effect.description?.fr.includes(text);
	}

}

export class StatParameter {
	id: number = 0;
	opposite: number | null = null;
	name: string = '';

	weight: number = 1;
	minimum: number = 0;
	maximum: number = Infinity;
	value: number = 0;

	constructor(init?: Partial<StatParameter>) {
		Object.assign(this, init);
	}
}
