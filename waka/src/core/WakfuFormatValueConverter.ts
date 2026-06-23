import { I18N } from "@aurelia/i18n";
import { ILogger, resolve } from "aurelia";
import { Locale, TrString } from "src/models/ankama/TrString";

export class WakfuFormatOptions {
	level?: number;
	params?: number[];
}

export class WakfuFormatValueConverter {
	private readonly i18n = resolve(I18N);
	private readonly logger = resolve(ILogger).scopeTo("WakfuFormatValueConverter");

	/**
	 * @param value - The raw Ankama translation string
	 * @param level - The item/character level (used for per-level param scaling)
	 * @param params - Raw param pairs: [base0, perLevel0, base1, perLevel1, ...]
	 */
	toView(value: TrString, options?: WakfuFormatOptions) { //level: number = 0, ...params: number[]) {
		if (!value) return '';

		const currentLang = this.i18n.getLocale() as Locale;
		const rawText = value[currentLang]
			|| value['fr']
			|| Object.values(value)[0]
			|| '';

		const { level = 0, params = [] } = options || {};

		// Each param is a pair (base + perLevel), so the number of computed params is params.length / 2.
		const paramCount = Math.floor(params.length / 2);
		const stack = { value: 0 };
		return this.processText(rawText, params, paramCount, level, stack).trim();
	}

	/** Walk text left-to-right, replacing [#N] tokens and evaluating {[COND]?t:f} branches. */
	private processText(text: string, params: number[], paramCount: number, level: number, stack: { value: number }): string {
		let result = '';
		let i = 0;
		while (i < text.length) {
			if (text[i] === '[') {
				const end = text.indexOf(']', i);
				if (end === -1) { result += text[i++]; continue; }
				const token = text.slice(i + 1, end);
				const m = token.match(/^#(\d+)$/);
				if (m) {
					// [#N] — compute base + perLevel * level for the N-th param pair
					const val = this.evalValue(params, parseInt(m[1]) - 1, level);
					stack.value = val;
					result += String(val);
				}
				// Unknown tags like [el6], [ecnbi], [#charac ...] are stripped
				i = end + 1;
			} else if (text[i] === '{') {
				const closeIdx = this.findMatchingBrace(text, i);
				const inner = text.slice(i + 1, closeIdx);
				result += this.evaluateBranch(inner, params, paramCount, level, stack);
				i = closeIdx + 1;
			} else {
				result += text[i++];
			}
		}
		return result;
	}

	/** Finds the index of the closing } that matches the { at openIdx. */
	private findMatchingBrace(text: string, openIdx: number): number {
		let depth = 0;
		for (let i = openIdx; i < text.length; i++) {
			if (text[i] === '{') depth++;
			else if (text[i] === '}' && --depth === 0) return i;
		}
		return text.length;
	}

	/** Parses [COND]?trueVal:falseVal and recursively processes the winning branch. */
	private evaluateBranch(inner: string, params: number[], paramCount: number, level: number, stack: { value: number }): string {
		if (inner[0] !== '[') return '';
		const condEnd = inner.indexOf(']');
		if (condEnd === -1 || inner[condEnd + 1] !== '?') return '';

		const cond = inner.slice(1, condEnd);
		const rest = inner.slice(condEnd + 2);
		const splitIdx = this.findColonAtDepth0(rest);
		const trueVal = splitIdx === -1 ? rest : rest.slice(0, splitIdx);
		const falseVal = splitIdx === -1 ? '' : rest.slice(splitIdx + 1);

		return this.evalCondition(cond, params, paramCount, level, stack.value)
			? this.processText(trueVal, params, paramCount, level, stack)
			: this.processText(falseVal, params, paramCount, level, stack);
	}

	/** Finds the first ':' at brace depth 0 (not inside a nested {}). */
	private findColonAtDepth0(text: string): number {
		let depth = 0;
		for (let i = 0; i < text.length; i++) {
			if (text[i] === '{') depth++;
			else if (text[i] === '}') depth--;
			else if (text[i] === ':' && depth === 0) return i;
		}
		return -1;
	}

	private evalCondition(cond: string, params: number[], paramCount: number, level: number, stack: number): boolean {
		let m: RegExpMatchArray | null;
		if (m = cond.match(/^~(\d+)$/)) return paramCount >= parseInt(m[1]);            // [~N]: >= N params
		if (m = cond.match(/^\+(\d+)$/)) return paramCount > parseInt(m[1]);            // [+N]: more than N params
		if (m = cond.match(/^-(\d+)$/)) return paramCount < parseInt(m[1]);             // [-N]: fewer than N params
		if (m = cond.match(/^>(\d+)$/)) return stack >= parseInt(m[1]);                 // [>N]: stack >= N
		if (m = cond.match(/^<(\d+)$/)) return stack <= parseInt(m[1]);                 // [<N]: stack <= N
		if (m = cond.match(/^=(\d+)$/)) return stack === parseInt(m[1]);                // [=N]: stack == N
		if (m = cond.match(/^(\d+)=(\d+)$/)) return this.evalValue(params, parseInt(m[2]) - 1, level) === parseInt(m[1]); // [N=M]
		if (m = cond.match(/^(\d+)<(\d+)$/)) return this.evalValue(params, parseInt(m[2]) - 1, level) < parseInt(m[1]);   // [N<M]
		if (m = cond.match(/^(\d+)>(\d+)$/)) return this.evalValue(params, parseInt(m[2]) - 1, level) > parseInt(m[1]);   // [N>M]
		return false;
	}

	/** Computes the value of a param pair: Math.floor(base + perLevel * level). */
	private evalValue(params: number[], index: number, level: number): number {
		index *= 2; // Each param is a pair (base + perLevel)
		const base = params[index] ?? 0;
		const perLevel = params[index + 1] ?? 0;
		return Math.floor(base + perLevel * level);
	}

}

// "description": {
//   "fr": "[#charac FEROCITY] [#1] % Coup critique",
//   "en": "[#charac FEROCITY] [#1]% Critical Hit",
//   "es": "[#charac FEROCITY] [#1]% de golpe crítico",
//   "pt": "[#charac FEROCITY] [#1]% de golpe crítico"
// }

const example0 = {
	"fr": "Hache{[~1]?s:} (Deux mains)",
	"en": "Axe{[~1]?s:} (Two-handed)",
	"es": "Hacha{[~1]?s:} (Dos manos)",
	"pt": "Machado{[~1]?s:} (duas mãos)"
};

const example1 = {
	"definition": {
		"id": 1053,
		"effect": "Gain : Maîtrise Distance"
	},
	"description": {
		"fr": "[#1] Maîtrise Distance",
		"en": "[#1] Distance Mastery",
		"es": "[#1] dominio distancia",
		"pt": "[#1] de Domínio de distância"
	}
};

const example2 = {
	"definition": {
		"id": 1068,
		"effect": "Gain : Maîtrise Élémentaire dans un nombre variable d'éléments"
	},
	"description": {
		"fr": "{[~3]?[#1] Maîtrise [#3]:[#1] Maîtrise sur [#2] élément{[>2]?s:} aléatoire{[>2]?s:}}",
		"en": "{[~3]?[#1] Mastery [#3]:[#1] Mastery of [#2] random{[=2]?:} element{[=2]?:s}}",
		"es": "{[~3]?[#1] Dominio[#3]:[#1] Dominio de [#2] elemento{[>2]?s:} aleatorio{[>2]?s:}}",
		"pt": "{[~3]?[#1] Domínio[#3]:[#1] Domínio sobre [#2] elemento{[>2]?s:} aleatório{[>2]?s:}}"
	}
};

const example3 = {
	"definition": {
		"id": 1084,
		"effect": "Soin : Lumière"
	},
	"description": {
		"fr": "Soin [el6] : [#1]{[+3]?% des PV:}{[+3]?{[1=3]? max:{[2=3]? courants:{[3=3]? manquants:{[4=3]? max:{[5=3]? courants:{[6=3]? manquants:}}}}}}:}{[+3]?{[4<3]? du lanceur:{[7<3]? de la cible:}}:}{[-2]?{[0=2]? [ecnbi] [ecnbr]:}:}{[+2]?{[2=2]? [ecnbi]:}:}{[+2]?{[1=2]? [ecnbr]:}:}",
		"en": "[el6] Heal: [#1]{[+3]?% of HP:}{[+3]?{[1=3]? max:{[2=3]? current:{[3=3]? lost:{[4=3]? max:{[5=3]? current:{[6=3]? lost:}}}}}}:}{[+3]?{[4<3]? of the caster:{[7<3]? of the target:}}:}{[-2]?{[0=2]? [ecnbi] [ecnbr]:}:}{[+2]?{[2=2]? [ecnbi]:}:}{[+2]?{[1=2]? [ecnbr]:}:}",
		"es": "Cura [el6]: [#1]{[+3]?% de los PdV:}{[+3]?{[1=3]? máx.:{[2=3]? actuales:{[3=3]? faltantes:{[4=3]? máx.:{[5=3]? actuales:{[6=3]? faltantes:}}}}}}:}{[+3]?{[4<3]? del lanzador:{[7<3]? del objetivo:}}:}{[-2]?{[0=2]? [ecnbi] [ecnbr]:}:}{[+2]?{[2=2]? [ecnbi]:}:}{[+2]?{[1=2]? [ecnbr]:}:}",
		"pt": "Cura [el6]: [#1]{[+3]?% dos PV:}{[+3]?{[1=3]? máx.:{[2=3]? atuais:{[3=3]? perdidos:{[4=3]? máx.:{[5=3]? atuais:{[6=3]? perdidos:}}}}}}:}{[+3]?{[4<3]? do lançador:{[7<3]? do alvo:}}:}{[-2]?{[0=2]?[ecnbi] [ecnbr]:}:}{[+2]?{[2=2]? [ecnbi]:}:}{[+2]?{[1=2]? [ecnbr]:}:}"
	}
};

const example4 = {
	"definition": {
		"id": 39,
		"effect": "Gain : charac passée en paramètre"
	},
	"description": {
		"fr": "[#1]{[~2]?%:} [#3]",
		"en": "[#1]{[~2]?%:} [#3]",
		"es": "[#1]{[~2]?%:} [#3]",
		"pt": "[#1]{[~2]?%:} [#3]"
	}
};


const example5 = {
	"definition": {
		"id": 304,
		"effect": "State : Applique un état"
	},
	"description": {
		"fr": "[#1] {[99\u003E3]?:{[0\u003C3]?:{[~3]?([#3] %):}}}",
		"en": "[#1] {[99\u003E3]?:{[0\u003C3]?:{[~3]?([#3]%):}}}",
		"es": "[#1] {[99\u003E3]?:{[0\u003C3]?:{[~3]?([#3]%):}}}",
		"pt": "[#1] {[99\u003E3]?:{[0\u003C3]?:{[~3]?([#3]%):}}}"
	}
};
