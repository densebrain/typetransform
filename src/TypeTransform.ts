





import { IFilterConfig } from "./Types"

/**
 * Filter an object
 *
 * @param obj
 * @param filterConfig
 */
export function filterObject(obj:any, filterConfig:IFilterConfig) {
	
}

/**
 * Create a curried filterObject instance
 *
 * @param filterConfig
 * @returns {(obj:any)=>any}
 */
export function makeFilter(filterConfig:IFilterConfig) {
	return (obj:any) => filterObject(obj,filterConfig)
}

/**
 * Filter an object
 *
 * @param obj
 * @param filterConfig
 */
export function toPlainObject(obj:any, filterConfig:IFilterConfig = null) {
	let
		plainObj = obj
	
	// Traverse and filter
	
	return plainObj
}
