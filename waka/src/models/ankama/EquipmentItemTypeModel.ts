import { TrString } from "./TrString";

/// https://wakfu.cdn.ankama.com/gamedata/1.92.1.58/equipmentItemTypes.json
export type EquipmentItemTypeModel = {
	definition: EquipmentItemTypeDefinition,
	title: TrString
};

export type EquipmentItemTypeDefinition = {
	id: number;
	equipmentPositions: string[];
	equipmentDisabledPositions: string[];
	isRecyclable: boolean;
	isVisibleInAnimation: boolean;
};
