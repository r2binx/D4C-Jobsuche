export class Jobs {
	constructor() {
		this.results = [];

		return reactive(this);
	}

	addResults(results, page) {
		this.results[page - 1] = results;
	}

	getPage(page) {
		return this.results[page - 1];
	}
}
