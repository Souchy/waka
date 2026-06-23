import Aurelia, { ConsoleSink, LoggerConfiguration, LogLevel, Registration } from 'aurelia';
import { MyApp } from './my-app';
import { JsonService } from './services/JsonService';
import { RouterConfiguration } from '@aurelia/router';
import { DialogConfigurationStandard, DialogRenderOptionsStandard } from '@aurelia/dialog';
import { I18nConfiguration } from '@aurelia/i18n';
import Fetch from 'i18next-fetch-backend';
import { ItemExplorer } from './views/item-explorer/ItemExplorer';
import { ItemFilter } from './views/item-filter/ItemFilter';
import { ItemSlot } from './components/item-slot/ItemSlot';
import { ItemSheet } from './components/item-sheet/ItemSheet';
import { DefaultVirtualizationConfiguration } from '@aurelia/ui-virtualization/dist/types/configuration';
import { ModelsEnum } from './models/ankama/ModelsEnum';
import { ActionModel } from './models/ankama/ActionModel';
import { EquipmentItemTypeModel } from './models/ankama/EquipmentItemTypeModel';
import { ItemTypeModel } from './models/ankama/ItemTypeModel';
import { ItemModel } from './models/ankama/ItemModel';

async function startApp() {
	const au = new Aurelia();
	// let i18n: I18N | null = null;

	// Logger for development
	if (import.meta.env.VITE_NODE_ENV !== 'production') {
		const logger = LoggerConfiguration.create({
			level: LogLevel.debug,
			colorOptions: 'colors',
			sinks: [ConsoleSink]
		});
		au.register(logger);
	}

	// I18N
	// const osLocale = await locale();
	const lng = 'fr'; // osLocale?.split('-')[0] ?? 'en'; // Use only the language code, e.g. 'en' from 'en-US'
	au.register(
		I18nConfiguration.customize((options) => {
			options.initOptions = {
				// debug: true,
				plugins: [Fetch],
				backend: {
					loadPath: (lng: string, ns: string) => {
						return `/i18n/${lng}/${ns}.json`;
					},
				},
				defaultNS: 'common',
				ns: [
					'common',
				],
				lng: lng,
				fallbackLng: 'en',
			};
		})
	);

	// Router
	// au.register(RouterConfiguration.customize({}));
	au.register(RouterConfiguration.customize({
		useNavigationModel: true,
		useUrlFragmentHash: false,
		historyStrategy: 'push',     // Browser history
		// activeClass: "toggled",
		// buildTitle(tr: Transition) {
		//   // Use the I18N to translate the titles using the keys from data.i18n.
		//   i18n ??= au.container.get(I18N);
		//   // const root = tr.routeTree.root;
		//   const child = tr.routeTree.root.children[0];
		//   return `${i18n.tr(child.data.i18n as string)}`;
		// },
		basePath: '/',
	}));

	// Dialogs
	au.register(DialogConfigurationStandard.customize((settings) => {
		settings.options.overlayStyle = 'background: rgba(0, 0, 0, 0.5)';
		// settings.options.modal = true;
	}).withChild("side", settings => {
		settings.options.modal = false; // drawer, not modal
		// settings.options.overlayStyle = 'background: transparent';
		settings.options.show = dom => dom.root.classList.add('drawer-open');
		settings.options.hide = dom => dom.root.classList.remove('drawer-open');
		settings.options.overlayStyle = 'background: rgb(0, 0, 0)';
		return settings;
	}));

	// Virtualization
	au.register(DefaultVirtualizationConfiguration);

	// App State
	// au.register(StateDefaultConfiguration.init(initialState, appStateHandler));

  // Services
	au.register(JsonService);
	const jsonService = au.container.get(JsonService);
  await jsonService.refreshVersion();
  
  void Promise.all([
    jsonService.get<ActionModel>(ModelsEnum.actions),
    jsonService.get<EquipmentItemTypeModel>(ModelsEnum.equipmentItemTypes),
    jsonService.get<ItemTypeModel>(ModelsEnum.itemTypes),
    jsonService.get<ItemModel>(ModelsEnum.items),
    // jsonService.get<ItemPropertyModel>(ModelsEnum.itemProperties),
    // jsonService.get<JobItemModel>(ModelsEnum.jobsItems),
  ]);

  // UI
  au.register(ItemExplorer, ItemFilter);
  au.register(ItemSheet, ItemSlot);

	await au.app(MyApp).start();
}
void startApp();
