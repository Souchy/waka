import { TrString } from "./TrString";

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
