import { ILogger, resolve } from "aurelia";
import { ItemModel } from "src/models/ankama/ItemModel";
import { ModelsEnum } from "src/models/ankama/ModelsEnum";
import { JsonService } from "src/services/JsonService";
import { ItemFilter } from "../item-filter/ItemFilter";

export class ItemExplorer {
	private readonly logger = resolve(ILogger);
	private json = resolve(JsonService);

	// Ref
	public itemFilter!: ItemFilter;

	// Data
	public allItems: ItemModel[] = [];
	public filteredItems: ItemModel[] = [];

	public itemsPerPage: number = 100;
	public page: number = 1;
	public itemsInPage: ItemModel[] = [];

	// Lifecycle
	public async attached() {
		this.itemFilter.itemExplorer = this;

		let items = await this.json.get<ItemModel[]>(ModelsEnum.items);
		this.allItems = items;
		// this.logger.debug("Fetched items:", items.slice(0, 10)); // Log only the first 10 items for brevity
	}

	// Events
	public clickShowMore() {
		this.itemsInPage = this.filteredItems.slice(0, this.itemsInPage.length + this.itemsPerPage);
	}
	public clickNextPage() {
		if (this.page * this.itemsPerPage < this.filteredItems.length) {
			this.page++;
			this.pageChanged(this.page);
		}
	}
	public clickPreviousPage() {
		if (this.page > 1) {
			this.page--;
			this.pageChanged(this.page);
		}
	}
	public pageChanged(page: number) {
		this.page = page;
		const startIndex = (page - 1) * this.itemsPerPage;
		const endIndex = startIndex + this.itemsPerPage;
		this.itemsInPage = this.filteredItems.slice(startIndex, endIndex);
		this.logger.debug(`Page changed to ${page}. 
			Showing items ${startIndex + 1} to ${Math.min(endIndex, this.filteredItems.length)} of ${this.filteredItems.length}.`);
		// this.logger.debug("Items in current page:", this.itemsInPage);
	}

}
