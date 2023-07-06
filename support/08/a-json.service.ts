import { AJsonDb } from '../schemas/a-json.schema';
import { AJson } from '../models/a-json.model';

export { getAJson, saveAJson };

async function getAJson(key1: string): Promise<Error | AJson | null> {
	if (!key1 || typeof key1 !== 'string') {
		return Error('invalid params');
	}

	try {
		const aJson = await AJsonDb.findOne<AJson>({ key1: key1 });
		return aJson;
	} catch (ex: any) {
		return ex;
	}
}

async function saveAJson(aJson: Partial<AJson>): Promise<Error | AJson> {
	if (!aJson || typeof aJson !== 'object' || !aJson.key1) {
		return Error('invalid params');
	}

	try {
		const aJsonExists = await AJsonDb.findOne<AJson>({ key1: aJson.key1 });
		if (aJsonExists) {
			return Error('item already exists');
		}
	} catch (ex: any) {
		return ex;
	}

	const jsonModel = new AJsonDb({
		key1: aJson.key1,
		'key 2': aJson['key 2'],
	});

	try {
		await jsonModel.save();
	} catch (ex: any) {
		return ex;
	}

	return jsonModel;
}
