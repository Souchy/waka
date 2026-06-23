import { route } from '@aurelia/router';
import { ItemExplorer } from './views/item-explorer/ItemExplorer';
import { BuildsPage } from './pages/builds-page/BuildsPage';
import { BuildWizard } from './pages/build-wizard/BuildWizard';
import { BuildPage } from './pages/build-page/BuildPage';

@route({
	routes: [
		ItemExplorer,
		BuildsPage,
		BuildPage,
		BuildWizard,
	],
	// fallback: import('./pages/missing-page/missing-page'),
})
export class MyApp {
}
