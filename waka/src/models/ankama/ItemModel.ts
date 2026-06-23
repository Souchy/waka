import { TrString } from "./TrString";

/// https://wakfu.cdn.ankama.com/gamedata/1.92.1.58/items.json
export type ItemModel = {
	definition: ItemModelDefinition,
	title: TrString,
	description: TrString
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
	effect: Effect
};

export type EquipEffect = {
	effect: Effect
};

export type Effect = {
	definition: EffectDefinition;
}

export type EffectDefinition = {
	id: number,
	actionId: number,
	areaShape: number,
	areaSize: number[],
	params: number[]
};
