import { bindable } from "aurelia";

export class Action {

	@bindable
	public actionid: number = 0;

	@bindable
	public description: string = "";

	@bindable
	public level: number = 0;

	@bindable
	public params: number[] = [];

}
