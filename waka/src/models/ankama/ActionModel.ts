import { TrString } from "./TrString";

/// https://wakfu.cdn.ankama.com/gamedata/1.92.1.58/actions.json
export type ActionModel = {
	definition: ActionDefinition,
	description: TrString
};

export type ActionDefinition = {
	id: number;
	effect: string;
};
