export const DEFAULT_ENCODING: string;
export const DEFAULT_ENV_FILENAME: string;
type ILoadOptions={path?:string, encoding?:string}
type ILoadResponse={status:boolean, messages?:string[],err?:Error }
export function load(options:ILoadOptions): ILoadResponse;
