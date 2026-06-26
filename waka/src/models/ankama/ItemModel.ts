import { TrString } from "./TrString";

/// https://wakfu.cdn.ankama.com/gamedata/1.92.1.58/items.json
/// https://www.wakfu.com/fr/mmorpg/encyclopedie/ressources/1718  // bois de pommier
/// https://static.ankama.com/wakfu/portal/game/item/115/2011718.png  // bois de pommier
export type ItemModel = {
	definition: ItemModelDefinition,
	title: TrString,
	description: TrString,
	customAdditionalInfo?: {
		weight: number,
	}
};

export type ItemModelDefinition = {
	item: ItemDefinition,
	useEffects: UseEffect[],
	useCriticalEffects: UseEffect[],
	equipEffects: EquipEffect[]
};

export type ItemDefinition = {
	id: number;
	level: number;
	baseParameters: ItemBaseParameters;
	useParameters: UseParameters;
	graphicParameters: GraphicParameters;
	properties: any[];
};

export type ItemBaseParameters = {
	itemTypeId: number;
	itemSetId: number;
	rarity: number;
	bindType: number;
	minimumShardSlotNumber: number;
	maximumShardSlotNumber: number;
};

export type GraphicParameters = {
	gfxId: number;
	femaleGfxId: number;
};
export type UseParameters = {
	useCostAp: number;
	useCostMp: number;
	useCostWp: number;
	useRangeMin: number;
	useRangeMax: number;
	useTestFreeCell: boolean;
	useTestLos: boolean;
	useTestOnlyLine: boolean;
	useTestNoBorderCell: boolean;
	useWorldTarget: number;
};

export type UseEffect = {
	effect: EffectModel
};

export type EquipEffect = {
	effect: EffectModel
};

export type EffectModel = {
	definition: EffectDefinition;
	description: TrString;
}

export type EffectDefinition = {
	id: number,
	actionId: number,
	areaShape: number,
	areaSize: number[],
	params: number[]
};
