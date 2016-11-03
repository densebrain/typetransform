

import {getValue} from 'typeguard'

export function hasOwnProp(o,it) {
	return getValue(() => o.hasOwnProperty && o.hasOwnProperty(it),false)
}