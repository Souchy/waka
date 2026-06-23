
export enum ModelsEnum {
	config = "config", // contient la version du jeu
	actions = "actions", // contient les descriptions des types d'effets (perte de PdV, boost de PA, etc)
	blueprints = "blueprints", // contient la liste des plans débloquant des recettes
	collectibleResources = "collectibleResources", // contient les actions de récolte
	equipmentItemTypes = "equipmentItemTypes", // contient les définitions des types d'équipements et des emplacements associés (Associé aux objets définis dans items)
	harvestLoots = "harvestLoots", // contient les objets récupérés via la récolte
	itemTypes = "itemTypes", // contient les définitions des types d'objets (Associé aux objets définis dans jobsItems)
	itemProperties = "itemProperties", // contient les propriétés qui peuvent être appliquées à des objets
	items = "items", // contient les données relatives aux items, leurs effets, nom, description, etc.. À croiser avec les données actions, equipmentItemTypes et itemProperties.
	jobsItems = "jobsItems", // contient les données relatives aux items récoltés, craftés et utilisés par les recettes de craft (version light du items.json)
	recipeCategories = "recipeCategories", // contient la liste des métiers
	recipeIngredients = "recipeIngredients", // contient les ingrédients des crafts
	recipeResults = "recipeResults", // contient les objets produits par les crafts
	recipes = "recipes", // contient la liste des recettes
	resourceTypes = "resourceTypes", // contient les types de ressources
	resources = "resources", // contient les ressources
	states = "states", // contient les traduction des états utilisés par les équipements
}
