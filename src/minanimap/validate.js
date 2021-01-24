import Ajv from 'ajv';
//import betterAjvErrors from 'better-ajv-errors';
const ajv = new Ajv();
import * as schema from './schema.json';
const validate = ajv.compile(schema.default);
//debugger;
//export {validate, betterAjvErrors, schema};
export {validate};
