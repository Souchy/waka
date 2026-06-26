import { ItemToggle } from "src/views/item-filter/ItemFilter";
import { TrString } from "./TrString";
import { Constants } from "src/core/Constants";

/// https://wakfu.cdn.ankama.com/gamedata/1.92.1.58/ItemTypes.json
export type ItemTypeModel = {
	definition: ItemTypeDefinition,
	title: TrString
};

export type ItemTypeDefinition = {
	id: number;
	equipmentPositions: string[];
	equipmentDisabledPositions: string[];
	isRecyclable: boolean;
	isVisibleInAnimation: boolean;
};

const daggerId = 112;
const shieldId = 189;
const daggerIconId = 571;
const shieldIconId = 520;
const oneHandIconId = 518;
const twoHandIconId = 519;
const itemTypeIconMap = new Map<number, number>([
	[daggerId, daggerIconId],
	[shieldId, shieldIconId]
]);

export function getItemTypeIconUrl(itemType: ItemTypeModel): string {
	const first = "FIRST_WEAPON";
	const second = "SECOND_WEAPON";

	let iconId = itemType.definition.id;
	// two hand: takes first hand and disables second hand
	if (itemType.definition.equipmentPositions.includes(first) && itemType.definition.equipmentDisabledPositions.includes(second)) {
		iconId = twoHandIconId;
	}
	if (itemType.definition.equipmentPositions.includes(first) && itemType.definition.equipmentDisabledPositions.length === 0) {
		iconId = oneHandIconId;
	}
	if (itemTypeIconMap.has(itemType.definition.id)) {
		iconId = itemTypeIconMap.get(itemType.definition.id)!;
	}
	return `${Constants.itemTypeIconBaseUrl}/${iconId}.png`;
};
