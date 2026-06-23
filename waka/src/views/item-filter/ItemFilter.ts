import { ItemModel } from "src/models/ankama/ItemModel";
import { ItemExplorer } from "../item-explorer/ItemExplorer";
import { ILogger, resolve, watch } from "aurelia";
import { JsonService } from "src/services/JsonService";
import { I18N } from "@aurelia/i18n";
import { Locale } from "src/models/ankama/TrString";

export class ItemFilter {
	private readonly logger = resolve(ILogger).scopeTo("ItemFilter");
	private readonly i18n = resolve(I18N);
	private readonly json = resolve(JsonService);

	// Ref
	public itemExplorer!: ItemExplorer;
	public searchTimeout: number | undefined = undefined;

	// Data
	public allowedTypes: number[] = [];
	public disallowedTypes: number[] = [];

	public minLevel: number = 1;
	public maxLevel: number = 245;
	public name: string = "";

	public async attached() {
		// let itemTypes = await this.json.get<ItemTypeModel[]>(ModelsEnum.itemTypes);
		// this.logger.debug("Fetched item types:", itemTypes);
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

	public filterItems(items: ItemModel[]): ItemModel[] {
		items = items.filter(item => {
			// Filter by allowed types
			// if (this.allowedTypes.length > 0 && !this.allowedTypes.includes(item.definition.item.typeId)) {
			// 	return false;
			// }

			if (item.definition.item.level < (this.minLevel)) {
				return false;
			}
			if (item.definition.item.level > (this.maxLevel)) {
				return false;
			}
			if (item.title[this.locale].toLowerCase().indexOf(this.name.toLowerCase()) === -1) {
				return false;
			}

			return true;
		});

		return items;
	}

}
