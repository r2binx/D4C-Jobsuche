export class IndexStore {
	constructor() {
		this.results = [];

		return reactive(this);
	}

	addData(results, index) {
		this.results[index - 1] = results;
	}

	getData(index) {
		return this.results[index - 1];
	}
}
