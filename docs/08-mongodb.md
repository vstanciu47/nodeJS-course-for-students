# NodeJs API

## Prerequisites

### MongoDB

Download and install locally [MongoDB Community Server](https://www.mongodb.com/try/download/community).
![Mongo Setup 1](assets/08/MongoDB_configuration.png)

Add MongoDB `bin` directory path `C:\Program Files\MongoDB\Server\6.0\bin` to `PATH` environment variable, so that the `mongod` cmd is available.

To establish a connection to the db, type this command in a CMD prompt:

```shell
mongod --port 27017 --dbpath <path_to_local_db>
```

Change `<path_to_local_db>` to a path of a local folder, for example `C:\dev\db`.

#### MongoDB as a service

If you choose to run it as service, verify it runs correctly:
![Mongo Setup 2](assets/08/MongoDB_service.png)

#### MongoDBCompass

Optionally, you can install a db management tool for it, like [Compass](https://www.mongodb.com/try/download/compass):
![Mongo Setup 3](assets/08/MongoDB_Compass.png)

### Postman

Download and install [Postman](https://www.postman.com/downloads/).

## Express app

Install [Mongoose](https://mongoosejs.com/) with `npm i mongoose -s`.

Add new constants in `env.ts` to store the db connection string and the local db name to use:

```typescript
MONGO_URL: 'mongodb://127.0.0.1:27017',
DB_NAME: 'a-json-db'
```

In `app.ts`, we need to initialise Mongoose and establish a connection to the db.

```typescript
import mongoose from 'mongoose';

let app: express.Application;

async function makeApp(): Promise<express.Application> {
    if (app) return app;

    app = express();

    await mongoose.connect(env.MONGO_URL);

    ..
}
```

Notice how `function makeApp()` became `async function makeApp()`? Because attempting to connect to the db is done via an `async` call to the `connect()` function, the return type of `function makeApp()` is now a promise. Because of this, we need to update how the function is used in `index.ts`.

```typescript
makeApp()
  .then((app) => app.listen(env.PORT, () => console.log(`${env.NODE_ENV} server listening on localhost:${env.PORT}`)))
  .catch(err => console.log(err));
```

We'll replace the existing contents of `a-json.model.ts` with a class that will be used to manipulate objects from the db inside our app. This will ensure there is a 1:1 correspondence between what is stored in the db and what we are working with inside the app.

```typescript
export class AJson {

 _id!: string;
 key1!: string;
 'key 2'!: string;

 constructor(model?: Partial<AJson>) {
  if (!model || !(model instanceof Object)) {
   model = <AJson><any>{};
  }

  this.key1 = model.key1 || 'value 1';
  this['key 2'] = model['key 2'] || 'value of key 2';
 }
}
```

Mongoose works with a special object type called `Schema`. A `Schema` represents the object as it is persisted in the db.
For this, we'll add `a-json.schema.ts` inside `src/schemas`:

```typescript
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
    collection: env.DB_NAME
  }
);

const AJsonDb = model<AJson>('AJson', AJsonSchema);

export { AJsonDb };
```

Notice what we export from this file. `AJsonDb` is used to get objects from the db and to persist objects to the db.

The new `AJson` class contains the same properties as the old `AJsonModel`, plus one required `_id` field, which is used to uniquely identify an `AJson` object in the db.

Just after the line of code where we establish the connection to the db, add two middlewares that will allows us to parse the body of a response/request. Use them in `app.ts`:

```typescript
import express from 'express';
..

async function makeApp(): Promise<express.Application> {
 ..

 // middleware
 app.use(express.urlencoded({ extended: false }));
 app.use(express.json());

 // routes
 ..
}
```

At this moment, we're not using the db at all. Let's change `/api/ajson` route to accept `GET` and `POST` requests, to read/write from the db.

Change `a-json.service.ts`:

```typescript
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
  'key 2': aJson['key 2']
 });

 try {
  await jsonModel.save();
 } catch (ex: any) {
  return ex;
 }

 return jsonModel;
}
```

Change `a-json.route.ts`:

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { AJson } from '../models/a-json.model';
import * as jsonService from '../services/a-json.service';

export { setAJsonRouter };

function setAJsonRouter(router: Router): Router {
 router.get('/', getAJson);
 router.post('/', postAJson);

 return router;
}

async function getAJson(req: Request, res: Response, next: NextFunction) {

 const query: any = req.query.key1;

 let aJson: Error | AJson | null;
 try {
  aJson = await jsonService.getAJson(query);
 } catch (ex) {
  return next(ex);
 }

 if (aJson instanceof Error) {
  return next(aJson);
 }

 if (aJson === null) {
  return res.status(404).end();
 }

 console.log('getAJson(), aJson:', aJson);
 return res.json(aJson);
}

async function postAJson(req: Request, res: Response, next: NextFunction) {

 const body: any = req.body;

 let aJson: Error | AJson;
 try {
  aJson = await jsonService.saveAJson(body);
 } catch (ex) {
  return next(ex);
 }

 if (aJson instanceof Error) {
  return next(aJson);
 }

 console.log('postAJson(), aJson:', aJson);
 return res.status(201).json(aJson);
}
```

Update `app.ts`:

```typescript
import express, { Router } from 'express';
import { setAJsonRouter } from './routes/a-json.route';

async function makeApp(): Promise<express.Application> {
 ..

 // routes
 ..
 app.use(env.A_JSON_ROUTE, setAJsonRouter(Router()));
}
```

At this stage it's clear that we're no longer using the `data` folder, so we can remove it.

Try it! Open a CMD prompt and type and run these following `curl` commands (one by one, in this order):

- `curl -X POST -iH "Content-Type: application/json" -d "{\"key1\":\"abc\"}" http://localhost:3000/api/json` => **201** (with item details)  
- `curl -X POST -iH "Content-Type: application/json" -d "{\"key1\":\"abc\"}" http://localhost:3000/api/json` => **500** (item already exists)
- `curl -X POST -iH "Content-Type: application/json" http://localhost:3000/api/json` => **500** (invalid params)
- `curl -i http://localhost:3000/api/json?key1=abc` => **200** (with item details)
- `curl -i http://localhost:3000/api/json`               => **500** (invalid params)
- `curl -i http://localhost:3000/api/json?key1=xyz`   => **404** (item not found)

If done correctly, the API should return the above mentioned status codes.

Update the `a-json.route.test.ts` unit test. We now have a route that accepts both `GET` and `POST` requests, so change router mock object:

```typescript
 const router = <Router><any>{
  get: (path: string, cb: (req: Request, res: Response, next: NextFunction) => any) => routes[path] = cb,
  post: (path: string, cb: (req: Request, res: Response, next: NextFunction) => any) => routes[path] = cb
 };
```

In the same file, `a-json.route.test.ts`, make sure the `proxyquire()` call returns a function which has the same name as the exported function from `a-json.route.ts`.

`a-json.route.test.ts`:

```typescript
 const aJsonRoute: { setAJsonRouter(router: Router): Router } = proxyquire(
  './a-json.route',
  {
   '../services/a-json.service': aJsonService
  }
 );
```

`a-json.route.ts`:

```typescript
export { setAJsonRouter };
```

The 2 function names **must** match.

Finally, running the end-to-end test with `npm run test:e2e` reveals that `get-discovery-client.e2e.test.ts` fails because we did not update it after making `makeApp()` a promise, so the test needs to be updated:

```typescript
describe(`Get ${env.DISCOVERY_CLIENT_ROUTE}`, () => {
  it('success', async () => {
    const app = await makeApp();
    supertest(app)
      .get(env.DISCOVERY_CLIENT_ROUTE)
      .expect(200, { jsonRoute: env.A_JSON_ROUTE });
  });
});
```

Now we're done!

---

Notes:

- this is only a proof a concept API
- if you have installed a db manager like Compass, you could take a peek at the data saved
- we're not using any security with our mongodb instance; for that read the [official documentation](https://docs.mongodb.com/manual/administration/security-checklist/)
- we're not "throwing" errors, we're "returning" errors
