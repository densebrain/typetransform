

import {getValue} from 'typeguard'

// MAKE TRANSFORMED OBJECT
export function makeTransformedObject(type,value:any) {
	return {
		$$type: type,
		$$value: value
	}
}


export function hasOwnProp(o,it) {
	return getValue(() => o.hasOwnProperty && o.hasOwnProperty(it),false)
}