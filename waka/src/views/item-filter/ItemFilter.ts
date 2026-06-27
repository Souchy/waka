import { EffectModel, ItemModel } from "src/models/ankama/ItemModel";
import { ItemExplorer } from "../item-explorer/ItemExplorer";
import { ILogger, resolve, watch } from "aurelia";
import { JsonService } from "src/services/JsonService";
import { I18N } from "@aurelia/i18n";
import { Locale, TrString } from "src/models/ankama/TrString";
import { Constants } from "src/core/Constants";
import { otherStats } from "src/data/stats/other";
import { secondaryResistances } from "src/data/stats/secondary_resistances";
import { secondaryMasteries } from "src/data/stats/secondary_masteries";
import { mainResistances } from "src/data/stats/main_resistances";
import { mainMasteries } from "src/data/stats/main_masteries";
import { getItemTypeIconUrl, ItemTypeModel } from "src/models/ankama/ItemTypeModel";
import { ModelsEnum } from "src/models/ankama/ModelsEnum";
import { EquipmentItemTypeModel } from "src/models/ankama/EquipmentItemTypeModel";

// export type StatToggle = {
// 	stat: Stat;
// 	active: boolean;
// }

export interface Stat {
	id: number;
	opposite: number;
	name?: string;
	iconUrl: string;
}

export class StatToggle implements Stat {
	public active: boolean = false;
	constructor(public readonly stat: Stat) {
	}

	public get id(): number {
		return this.stat.id;
	}

	public get opposite(): number {
		return this.stat.opposite;
	}

	public get name(): string | undefined {
		return this.stat.name;
	}

	public get iconUrl(): string {
		return this.stat.iconUrl;
	}
}

export class ItemToggle {
	public active: boolean = false;
	constructor(public readonly item: ItemTypeModel) { }
	public get id(): number {
		return this.item.definition.id;
	}
	public get name(): TrString {
		return this.item.title; // [this.locale];
	}
	// public get locale(): Locale {
	// 	const i18n = resolve(I18N);
	// 	return i18n.getLocale() as Locale;
	// }

	public get iconUrl(): string {
		return getItemTypeIconUrl(this.item);
	}

}

export class ItemFilter {
	private readonly logger = resolve(ILogger).scopeTo("ItemFilter");
	private readonly i18n = resolve(I18N);
	private readonly json = resolve(JsonService);
	private readonly constants = resolve(Constants);

	private itemTypeToggles: ItemToggle[] = this.json.getCached<ItemTypeModel[]>(ModelsEnum.itemTypes)?.filter(item => item.definition.equipmentPositions.length > 0).map(item => new ItemToggle(item)) || [];

	public toggleMainMastery = mainMasteries.map(m => new StatToggle(m));
	public toggleMainResistances = mainResistances.map(r => new StatToggle(r));
	public toggleSecondaryMastery = secondaryMasteries.map(m => new StatToggle(m));
	public toggleSecondaryResistances = secondaryResistances.map(r => new StatToggle(r));
	public toggleOther = otherStats.map(o => new StatToggle(o));

	private allToggles: StatToggle[] = [...this.toggleMainMastery, ...this.toggleMainResistances, ...this.toggleSecondaryMastery, ...this.toggleSecondaryResistances, ...this.toggleOther];

	private readonly sortByLevelThenId = (a: ItemModel, b: ItemModel) => {
		// Sort by level first, then by name
		if (a.definition.item.level !== b.definition.item.level) {
			return b.definition.item.level - a.definition.item.level;
		}
		return b.definition.item.id - a.definition.item.id;
	};
	private readonly sortByWeightThenLevelThenId = (a: ItemModel, b: ItemModel) => {
		// Sort by weight first, then by level, then by name
		const weightA = a.customAdditionalInfo?.weight ?? 0;
		const weightB = b.customAdditionalInfo?.weight ?? 0;
		if (weightA !== weightB) {
			return weightB - weightA;
		}

		return this.sortByLevelThenId(a, b);
	};

	// Ref
	public itemExplorer!: ItemExplorer;
	public searchTimeout: number | undefined = undefined;

	// Data
	public allowedTypes: number[] = [];
	public disallowedTypes: number[] = [];

	public minLevel: number = 169;
	public maxLevel: number = 170;
	public name: string = "";

	public sortFunction = this.sortByWeightThenLevelThenId;

	public async attached() {
	}

	@watch(vm => vm.itemExplorer?.allItems) // can be null at initialization
	@watch(vm => [vm.minLevel, vm.maxLevel, vm.name])
	public onChange() {
		clearTimeout(this.searchTimeout);
		this.searchTimeout = setTimeout(() => {
			this._onChange();
		}, 300);
	}
	public _onChange() {
		this.itemExplorer.filteredItems = this.filterItems(this.itemExplorer.allItems);
		this.itemExplorer.pageChanged(1);
	}

	public get locale() {
		return this.i18n.getLocale() as Locale;
	}

	public clickToggle(toggle: StatToggle) {
		toggle.active = !toggle.active;
		this.onChange();
	}

	public filterItems(items: ItemModel[]): ItemModel[] {
		let anyTypeToggleActive = this.itemTypeToggles.some(toggle => toggle.active);

		items = items.filter(item => {
			// Filter types
			if (anyTypeToggleActive) {
				if (!this.itemTypeToggles.some(toggle => toggle.active && toggle.id === item.definition.item.baseParameters.itemTypeId)) {
					return false;
				}
			}

			// Level
			if (item.definition.item.level < (this.minLevel)) {
				return false;
			}
			if (item.definition.item.level > (this.maxLevel)) {
				return false;
			}
			// Name
			if (item.title[this.locale].toLowerCase().indexOf(this.name.toLowerCase()) === -1) {
				return false;
			}

			// calculate Weight
			if (!item.customAdditionalInfo) {
				item.customAdditionalInfo = { weight: 0 };
			}
			item.customAdditionalInfo.weight = this.calculateWeight(item);

			return true;
		});

		items = items.sort(this.sortFunction);

		return items;
	}

	private isEffectDescriptionContains(effect: EffectModel, text: string): boolean {
		return effect.description?.fr.includes(text);
	}

	public calculateWeight(item: ItemModel): number {
		let weight = 0;
		for (const toggle of this.allToggles) {
			if (!toggle.active) continue;
			item.definition.equipEffects.forEach(effect => {
				const value = effect.effect.definition.params[0] || 1;
				if (effect.effect.definition.actionId === toggle.id) {
					if (toggle.id === 39) {
						if (this.isEffectDescriptionContains(effect.effect, toggle.name || "")) {
							weight += value;
						}
					} else {
						weight += value;
					}
				}
				if (effect.effect.definition.actionId === toggle.opposite) {
					weight -= value;
				}
			});
			// item.definition.useEffects.forEach(effect => {
			// 	const value = effect.effect.definition.params[0] || 1;
			// 	if (effect.effect.definition.actionId === toggle.id) {
			// 		weight += value;
			// 	}
			// 	if (effect.effect.definition.actionId === toggle.opposite) {
			// 		weight -= value;
			// 	}
			// });
		}
		return weight;
	}

}
