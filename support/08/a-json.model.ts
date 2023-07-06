export class AJson {
	_id!: string;
	key1!: string;
	'key 2'!: string;

	constructor(model?: Partial<AJson>) {
		if (!model || !(model instanceof Object)) {
			model = <AJson>(<any>{});
		}

		this.key1 = model.key1 || 'value 1';
		this['key 2'] = model['key 2'] || 'value of key 2';
	}
}
