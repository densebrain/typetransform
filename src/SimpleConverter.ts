
import { IConverter } from "./Types"
import { isFunction } from "typeguard"
import {addConverter} from "./TypeTransform"
import { makeTransformedObject } from "./TypeTransformUtils"


export interface IConvertableType {
	toObject():any
}

export interface IConvertableTypeConstructor<T extends IConvertableType> {
	fromJS?:(o:any) => T
	new (props?:any):T
}

export interface IConverterConstructor {
	new (clazz:any):IConverter
}

export class SimpleConverter implements IConverter {

	constructor(private clazz:IConvertableTypeConstructor<any>) {
	
	}
	
	/**
	 * Test instanceof type
	 *
	 * @param value
	 * @returns {boolean}
	 */
	test(value:any){
		return value instanceof this.clazz
	}
	
	/**
	 * Convert
	 * @param value
	 * @returns {any}
	 */
	convert(value:any) {
		return !value ? null :
			isFunction(value.toObject) ?
				makeTransformedObject(this.clazz.name, value.toObject()) :
				value
		
	}
	
	
	
}


export function Converter(converterClazz:IConverterConstructor) {
	return function (target) {
		addConverter(new converterClazz(target))
	}
}