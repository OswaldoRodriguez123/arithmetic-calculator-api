import dotenv from 'dotenv';

dotenv.config();
const envs = process.env;

function isNotBlank(str: string = '') : boolean {
  return !/^\s*$/.test(str);
}

export function envString(name: string, defaultValue = '') : string {
  const val = envs[name];
  return isNotBlank(val) ? String(val) : defaultValue;
}

export function envBoolean(name: string, defaultValue: boolean = false) : boolean {
  const val = envString(name, '');
  if (val === 'true') return true;
  if (val === 'false') return false;
  return defaultValue;
}

export function envNumber(name: string, defaultValue: number = 0) : number {
  const val = envString(name, '');
  if (val == '') return defaultValue;
  const n = Number(val);
  return !isNaN(n) ? n : defaultValue;
}

export function envArray(name: string, defaultValue: []) : string[] {
  const val = envString(name, '');
  if (val == '') return defaultValue;
  const arry = val.split(" ");
  return arry;
}