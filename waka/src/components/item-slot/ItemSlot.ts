import { bindable } from "aurelia";
import { Constants } from "src/core/Constants";
import { ItemModel } from "src/models/ankama/ItemModel";

export class ItemSlot {

	@bindable
	public item: ItemModel | null = null;
	
	public get iconUrl() {
		const gfxId = this.item?.definition?.item?.graphicParameters?.gfxId;
		return gfxId ? `${Constants.itemIconBaseUrl}/${gfxId}.png` : '';
	}

	public get rarityClass() {
		const rarity = this.item?.definition.item.baseParameters.rarity;
		return `rarity-${rarity}`;
	}

}
