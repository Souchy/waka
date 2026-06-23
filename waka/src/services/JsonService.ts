import { resolve, singleton } from "aurelia";
import { IHttpClient } from '@aurelia/fetch-client';
import { ModelsEnum } from "../models/ankama/ModelsEnum";
import { ConfigModel } from "../models/ankama/ConfigModel";

@singleton()
export class JsonService {
	private readonly http = resolve(IHttpClient);
	private readonly baseUrl = 'https://wakfu.cdn.ankama.com/gamedata/'; // 1.92.1.58/equipmentItemTypes.json/

	public cache: Map<ModelsEnum, any> = new Map<ModelsEnum, any>();

	public get version(): string {
		const config = this.cache.get(ModelsEnum.config) as ConfigModel;
		return config?.version ?? '';
	}

	public async refreshVersion(): Promise<ConfigModel> {
		const config = await this.get<ConfigModel>(ModelsEnum.config, true);
		return config;
	}

	public async get<T>(model: ModelsEnum, refresh: boolean = false): Promise<T> {
		if (this.cache.has(model) && !refresh) {
			return this.cache.get(model) as T;
		}

		let url = this.baseUrl;
		if (model !== ModelsEnum.config) {
			url += `${this.version}/`;
		}
		url += `${model}.json`;
		
		const response = await this.http.fetch(url);
		const data = await response.json() as T;
		this.cache.set(model, data);
		return data;
	}

}
