import { route } from "@aurelia/router";
import { ILogger, resolve } from "aurelia";
import { ActionModel } from "src/models/ankama/ActionModel";
import { ModelsEnum } from "src/models/ankama/ModelsEnum";
import { JsonService } from "src/services/JsonService";
import major_stats from "src/data/major_stats.json";
import masteries from "src/data/masteries.json";
import other_stats from "src/data/other_stats.json";
import resistances from "src/data/resistances.json";

@route({
	id: 'wizard',
	path: 'wizard',
	title: 'Build Wizard',
})
export class BuildWizard {
	private readonly logger = resolve(ILogger).scopeTo("BuildWizard");
	private readonly json = resolve(JsonService);

	public get actions(): ActionModel[] | undefined {
		return this.json.getCached<ActionModel[]>(ModelsEnum.actions);
	}

	public minimumElementsCount: number = 0;
	// Sum chosen elements + chosen secondaries
	public maitrise1: StatParameter = new StatParameter();
	public maitrise2: StatParameter = new StatParameter();
	public maitrise3: StatParameter = new StatParameter();
	public maitrise4: StatParameter = new StatParameter();



	public major_stats: Map<number, StatParameter> = new Map<number, StatParameter>();
	public masteries: Map<number, StatParameter> = new Map<number, StatParameter>();
	public other_stats: Map<number, StatParameter> = new Map<number, StatParameter>();
	public resistances: Map<number, StatParameter> = new Map<number, StatParameter>();


	created() {
		// Initialize stats map with important stats
		for (const stat of major_stats) {
			this.major_stats.set(stat.id, new StatParameter(stat));
		}
		for (const stat of masteries) {
			this.masteries.set(stat.id, new StatParameter(stat));
		}
		for (const stat of other_stats) {
			this.other_stats.set(stat.id, new StatParameter(stat));
		}
		for (const stat of resistances) {
			this.resistances.set(stat.id, new StatParameter(stat));
		}
	}

	public get major_stats_list() { return Array.from(this.major_stats.values()); }
	public get masteries_list() { return Array.from(this.masteries.values()); }
	public get other_stats_list() { return Array.from(this.other_stats.values()); }
	public get resistances_list() { return Array.from(this.resistances.values()); }

	public getAction(actionId: number): ActionModel | undefined {
		return this.actions?.find(a => a.definition.id === actionId);
	}

	public clickGenerate() {
		this.logger.debug("Generate button clicked", this.major_stats);
	}
}

export class StatParameter {
	hint: string = '';
	id: number = 0;
	weight: number = 1;
	minimum: number = 0;
	maximum: number = Infinity;
	value: number = 0;
	opposite: number | null = null;
	
	constructor(init?: Partial<StatParameter>) {
		Object.assign(this, init);
	}
}
