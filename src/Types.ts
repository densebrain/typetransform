
export enum FilterType {
	Include,
	Exclude
}


/**
 * Filter test fn
 */
export type TFilterTestFn = (key:string,value:any) => boolean

/**
 * A filter
 */
export interface IFilter {
	type:FilterType
	test:string|string[]|RegExp|TFilterTestFn
	 
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



