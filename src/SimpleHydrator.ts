
import { IHydrater} from "./Types"
import { getValue, isFunction} from "typeguard"
import { addHydrater } from "./TypeTransform"


export interface IHydraterType {
	toJS():any
}

export interface IHydraterTypeConstructor<T extends IHydraterType> {
	fromJS?:(o:any) => T
	new (props?:any):T
}


export interface IHydraterConstructor {
	new (clazz:IHydraterTypeConstructor<any>):IHydrater
}

export class SimpleHydrater implements IHydrater {
	
	constructor(private clazz:IHydraterTypeConstructor<any>) {
	
	}
	
	/**
	 * Hydrate signature
	 *
	 * @param type
	 * @param value
	 * @return {boolean}
	 */
	test(type:string,value:any) {
		//console.log(`testing`,type,value)
		return getValue(() => type === this.clazz.name,false)
	}
	
	/**
	 * Hydrate an object
	 *
	 * @param type
	 * @param value
	 * @returns {any}
	 */
	hydrate(type:string,value?:any):any {
		console.log(`hydrating`,type,value)
		if (getValue(() => value.$$value))
			value = value.$$value
		
		const
			{clazz} = this
		
		return isFunction(this.clazz.fromJS) ?
			clazz.fromJS(value) :
			new clazz(value)
	}
	
}

export function Hydrator(hydraterClazz:IHydraterConstructor) {
	return function (target) {
		addHydrater(new hydraterClazz(target))
	}
}