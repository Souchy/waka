import { Stat } from "src/views/item-filter/ItemFilter";

export const mainResistances: Stat[] = [
	{
		id: 82,
		opposite: 97,
		name: "Résistance Feu",
		iconUrl: "RES_FIRE_PERCENT.png"
	},
	{
		id: 83,
		opposite: 98,
		name: "Résistance Eau",
		iconUrl: "RES_WATER_PERCENT.png"
	},
	{
		id: 84,
		opposite: 96,
		name: "Résistance Terre",
		iconUrl: "RES_EARTH_PERCENT.png"
	},
	{
		id: 85,
		opposite: 0,
		name: "Résistance Air",
		iconUrl: "RES_AIR_PERCENT.png"
	},
	{
		id: 80,
		opposite: 90, // ou 100 sans cap
		name: "Résistance Élémentaire",
		iconUrl: "RES_IN_PERCENT.png"
	},
	{
		name: "elementalCountResistance",
		id: 1069,
		opposite: 0,
		iconUrl: "RES_IN_PERCENT.png"
	}
];
