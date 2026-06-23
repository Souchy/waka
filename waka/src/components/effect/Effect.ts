import { bindable, ILogger, resolve } from "aurelia";
import { ActionModel } from "src/models/ankama/ActionModel";
import { EffectModel } from "src/models/ankama/ItemModel";
import { ModelsEnum } from "src/models/ankama/ModelsEnum";
import { JsonService } from "src/services/JsonService";

export class Effect {
	private readonly logger = resolve(ILogger).scopeTo("Effect");
	private readonly json: JsonService = resolve(JsonService);
	
	@bindable
	public level: number = 0;
	@bindable
	public effect!: EffectModel;

	public bound() {
		// this.logger.debug("Effect bound with effect:", this.effect);
	}

	private get actions() {
		return this.json.getCached<ActionModel[]>(ModelsEnum.actions);
	}

	public get action() {
		const actionId = this.effect?.definition?.actionId;
		return this.actions?.find(a => a.definition.id === actionId);
	}

	public get actionDescription() {
		return this.action?.description;
	}

	public get params() {
		return this.effect.definition.params;
	}

}
