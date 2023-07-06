import mongoose from 'mongoose';
const { model, Schema } = mongoose;

import env from '../env';
import { AJson } from '../models/a-json.model';

const AJsonSchema = new Schema<AJson>(
	{
		key1: { type: String, required: true },
		'key 2': { type: String },
	},
	{
		collection: env.DB_NAME,
	}
);

const AJsonDb = model<AJson>('AJson', AJsonSchema);

export { AJsonDb };
