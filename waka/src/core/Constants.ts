import { singleton } from "aurelia";

@singleton()
export class Constants {
	public static readonly itemTypeIconBaseUrl = "https://vertylo.github.io/wakassets/itemTypes";
	public static readonly itemIconBaseUrl = "https://vertylo.github.io/wakassets/items";
	public static readonly characteristicIconBaseUrl = "https://vertylo.github.io/wakassets/characteristics";
	public static readonly elementIconBaseUrl = "https://vertylo.github.io/wakassets/elements";

	public itemTypeIconBaseUrl = Constants.itemTypeIconBaseUrl;
	public itemIconBaseUrl = Constants.itemIconBaseUrl;
	public characteristicIconBaseUrl = Constants.characteristicIconBaseUrl;
	public elementIconBaseUrl = Constants.elementIconBaseUrl;

}
