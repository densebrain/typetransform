





import {
	DefaultFilterConfig, TConverter, TFilterCurriedFn, FilterType, TFilterTest, IFilterConfig, ICanConvert,
	TTypeConverter, TKeyPath, IHydrater
} from "./Types"
import { isString, isFunction, isNumber, isNil, isList, isMap, isObject } from "typeguard"
import { Map, List } from 'immutable'
import isBoolean = require("lodash/isBoolean")
import isDate = require("lodash/isDate")
import isNull = require("lodash/isNull")
import isError = require("lodash/isError")
import transform = require('lodash/transform')

const
	NoConvertFn = (value:any) => value,
	ExcludeConvertFn = (value:any) => undefined,
	Primitives = [isNumber,isString,isBoolean,isDate,isNil,isError],
	Converters = List<TConverter>()
		.asMutable(),
	Hydraters = List<IHydrater>()
		.asMutable()


// INSTALL PRIMITIVE CONVERTERS
Primitives.forEach(test => Converters.push({test,convert:NoConvertFn}))

// FUNCTIONS ARE EXCLUDED
Converters.push({test: isFunction,convert:ExcludeConvertFn})

// MAKE TRANSFORMED OBJECT
function makeTransformedObject(type,value:any) {
	return {
		$$type: type,
		$$value: value
	}
}

/**
 * Add converters
 *
 * @param newConverters
 */
export function addConverters(...newConverters:TConverter[]) {
	Converters.unshift(...newConverters)
}

// IMMUTABLE MAP/LIST CONVERTERS
function transformList(value:List<any>) {
	return makeTransformedObject(List.name,value.toArray())
}

function transformMap(value:Map<any,any>) {
	return makeTransformedObject(Map.name,value.toObject())
}

addConverters(
	{test:isMap,convert:transformMap},
	{test:isList,convert:transformList}
)


export function addHydrater(...newHydraters:IHydrater[]) {
	Hydraters.unshift(...newHydraters)
}


function hydrateList(type:string,value:any) {
	value = fromPlainObject(value)
	return List(value)
}

function hydrateMap(type:string,value:any) {
	value = fromPlainObject(value)
		
	return Map(value)
}


function makeTypeCheck(type:string) {
	return (inType) => inType === type
}

addHydrater(
	{
		test: makeTypeCheck(Map.name),
		hydrate: hydrateMap
	},{
		test: makeTypeCheck(List.name),
		hydrate: hydrateList
	}
)
/**
 * Match the filter test to the current keypath
 *
 * @param test
 * @param keyPath
 * @param value
 * @returns {boolean}
 */
function match(test:TFilterTest,keyPath:TKeyPath,value:any) {
	if (!test)
		throw new Error(`test can not be null`)
	
	if (isString(test)) {
		return test === keyPath.join('.')
	} else if (Array.isArray(test)) {
		return keyPath.length === test.length &&
			keyPath.every((key,index) => key === test[index])
	} else if (test instanceof RegExp) {
		return test.test(keyPath.join('.'))
	} else if (isFunction(test)) {
		return test(keyPath,value)
	} else {
		return false
	}
}

/**
 * Filter an object
 *
 * @param keyPath
 * @param value
 * @param filterConfig
 */
export function filterKey(keyPath:TKeyPath, value:any, filterConfig:IFilterConfig) {
	const
		{
			defaultExcluded,
			filters
		} = filterConfig
	
	//noinspection JSUnusedAssignment
	let
		excluded = defaultExcluded === true
	
	// ITERATE ALL FILTERS
	for (let filter of filters) {
		if (!match(filter.test,keyPath,value))
			continue
		
		excluded = filter.type === FilterType.Exclude
		
	}
	
	return excluded !== true
}

/**
 * Create a curried filterObject instance
 *
 * @param filterConfig
 * @returns {(obj:any)=>any}
 */
export function makeFilter(filterConfig:IFilterConfig):TFilterCurriedFn {
	return (keyPath:TKeyPath,value:any) => filterKey(keyPath,value,filterConfig)
}

/**
 * Was the value transformed
 *
 * @param val
 * @returns {any}
 */
export function isTransformed(val:any) {
	return val && isObject(val) && ['$$type','$$value'].every(it => val.hasOwnProperty(it))
}


/**
 * Convert a keypath value to a plain object
 *
 * @param value
 * @param keyPath
 * @param filter
 * @returns {any}
 */
function keyPathToPlainObject(value:any, keyPath:TKeyPath, filter:TFilterCurriedFn) {
	let
		converter = Converters.find(it => it.test(value)),
		nextValue
	
	// IF CONVERTER THEN DO IT
	nextValue = !converter ? value : converter.convert(value,keyPath,filter)
	
	if (nextValue) {
		let
			wasTransformed = isTransformed(nextValue),
			tmpValue = wasTransformed ? nextValue.$$value : nextValue
		
		
		if (Array.isArray(tmpValue)) {
			tmpValue = tmpValue.reduce((result, val, index) => {
				const
					nextKeyPath = [ ...keyPath, index ]
				
				// CHECK THE KEY IS OK
				if (filter(nextKeyPath, val)) {
					const
						convertedVal = keyPathToPlainObject(val, nextKeyPath, filter)
					
					if (convertedVal !== undefined)
						result.push(convertedVal)
				}
				
				return result
			}, [])
		} else if (isObject(tmpValue)) {
			tmpValue = transform(tmpValue, (result:any, val:any, key, src) => {
				
				const
					nextKeyPath = [ ...keyPath, key ]
				
				// CHECK THE KEY IS OK
				if (filter(nextKeyPath, val)) {
					const
						convertedVal = keyPathToPlainObject(val, nextKeyPath, filter)
					
					if (convertedVal !== undefined)
						result[ key ] = convertedVal
				}
			}, {})
		}
		
		// IF TRANSFORMED, SET VALUE
		if (wasTransformed)
			nextValue.$$value = tmpValue
		else
			nextValue = tmpValue
	}
	return nextValue
	
}


/**
 * Filter an object
 *
 * @param obj
 * @param filterConfig
 */
export function toPlainObject(obj:any, filterConfig:IFilterConfig = null) {
	let
		filter = makeFilter(filterConfig || DefaultFilterConfig),
		keyPath = []
		
	// Traverse and filter
	return keyPathToPlainObject(obj,keyPath,filter)
}

function hydrateValue(value:any) {
	if (!isTransformed(value))
		return null
	
	const
		hydrater = Hydraters.find(it => it.test(value.$$type,value.$$value))
	
	return !hydrater ? null : hydrater.hydrate(value.$$type,value.$$value)
}



/**
 *
 * @param value
 */
export function fromPlainObject(value:any) {
	const
		hydrated = hydrateValue(value)
	
	if (hydrated)
		return hydrated
	
	const
		valueIsArray = value && Array.isArray(value)
	
	if (isObject(value))
		value = transform(value,(result:any,nextValue,key,src) => {
			nextValue = fromPlainObject(nextValue)
			if (valueIsArray)
				result.push(nextValue)
			else
				result[key] = nextValue
		},valueIsArray ? [] : {})
	
	return value
}