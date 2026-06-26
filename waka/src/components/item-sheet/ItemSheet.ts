import { I18N } from "@aurelia/i18n";
import { bindable, ILogger, resolve } from "aurelia";
import { Constants } from "src/core/Constants";
import { ItemModel } from "src/models/ankama/ItemModel";
import { getItemTypeIconUrl, ItemTypeModel } from "src/models/ankama/ItemTypeModel";
import { ModelsEnum } from "src/models/ankama/ModelsEnum";
import { Locale } from "src/models/ankama/TrString";
import { JsonService } from "src/services/JsonService";

export class ItemSheet {
	public readonly logger = resolve(ILogger).scopeTo("ItemSheet");
	public readonly i18n = resolve(I18N);
	public readonly json = resolve(JsonService);
	public readonly constants = resolve(Constants);

	@bindable
	public item!: ItemModel;

	public attached() {
		// if(this.id === 2027) {
		// 	this.logger.debug("ItemSheet bound with item:", this.item);
		// }
	}

	public get locale(): Locale {
		return this.i18n.getLocale() as Locale;
	}

	public get id() {
		return this.item.definition.item.id;
	}

	public get title() {
		return this.item.title;
	}

	public get description() {
		return this.item.description;
	}

	public get level() {
		return this.item.definition.item.level;
	}

	public get rarityClass() {
		const rarity = this.item.definition.item.baseParameters.rarity;
		return `rarity-${rarity}`;
	}

	public get type(): ItemTypeModel | undefined {
		const itemTypes = this.json.getCached<ItemTypeModel[]>(ModelsEnum.itemTypes);
		const typeId = this.item.definition.item.baseParameters.itemTypeId;
		return itemTypes?.find(t => t.definition.id === typeId);
	}

	public get typeIconUrl() {
		const type = this.type;
		if (!type) {
			return '';
		}
		return getItemTypeIconUrl(type);
	}

	public get iconUrl() {
		const gfxId = this.item?.definition?.item?.graphicParameters?.gfxId;
		return gfxId ? `${this.constants.itemIconBaseUrl}/${gfxId}.png` : '';
	}

	public clickDebug() {
		this.logger.debug('', this.item);
	}


}
