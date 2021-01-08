import Ajv from '../web_modules/ajv.js';
//import betterAjvErrors from 'better-ajv-errors';
const ajv = new Ajv();
import * as schema from './schema.json.proxy.js';
const validate = ajv.compile(schema.default);
//debugger;
//export {validate, betterAjvErrors, schema};
export {validate};
