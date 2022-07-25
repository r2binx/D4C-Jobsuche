export class AssociativeStore {
	constructor() {
		this.results = {};

		return reactive(this);
	}

	addData(results, index) {
		this.results[index] = results;
	}

	getData(index) {
		return this.results[index];
	}
}
