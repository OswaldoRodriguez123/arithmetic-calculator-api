/* eslint-disable semi */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type PrimitiveEmpty = undefined | null;
export type Primitive = boolean | string | number;
export type PrimitiveArray = boolean[] | string[] | number[];

/**
  Ejemplo:

  const myVar: IMap = {
    valueNumber: 1,
    valueString: '',
    valueBoolean: false,
    valueNull: null,
    valueUndefined: undefined
  };
*/
export interface IMap {
  [key: string]: any | PrimitiveEmpty | Primitive | PrimitiveArray;
}

/**
  Ejemplo:

  const myVar: IHash<string> = {
    id: 'valor',
    name: 'otro valor'
  };
*/
export interface IHash<T> {
  [key: string] : T;
}