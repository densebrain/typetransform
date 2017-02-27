
export enum FilterType {
	Include,
	Exclude
}


export type TKeyPath = Array<string|number>

/**
 * Filter test fn
 */
export type TFilterTestFn = (keyPath:TKeyPath,value:any) => boolean

export type TFilterTest = string|TKeyPath|RegExp|TFilterTestFn
/**
 * A filter
 */
export interface IFilter {
	type:FilterType
	test:TFilterTest
	 
}

/**
 * Filter shape
 */
export interface IFilterConfig {
	/**
	 * By default exclude all
	 */
	defaultExcluded?:boolean
	
	/**
	 * All filters
	 */
	filters: IFilter[]
}


export type TFilterCurriedFn = (keyPath:TKeyPath,value:any) => boolean


/**
 * Actual converter
 */
export interface ITypeConverter {
	(value?:any, keyPath?:TKeyPath, filter?:TFilterCurriedFn): any
}

/**
 * Get type converter returns either
 *
 * false - not supported
 * converter - supported
 */
export interface ICanConvert {
	(value:any,jsType?:string): boolean
}

/**
 * Actual converter
 */
export interface IConverter {
	test:ICanConvert,
	convert:ITypeConverter
}


export interface IHydrateTest {
	(type:string,value?:any):boolean
}

export interface IHydrate {
	(type:string,value:any):any
}

export interface IHydrater {
	test:IHydrateTest
	hydrate:IHydrate
}


export const DefaultFilterConfig = {
	defaultExcluded: false,
	filters: []
}
