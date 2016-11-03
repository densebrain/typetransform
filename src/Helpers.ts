import { IFilterConfig, IFilter, TFilterTest, FilterType } from "./Types"

export function excludeFilterConfig(...filters:IFilter[]):IFilterConfig {
	return {
		defaultExcluded: false,
		filters
	}
}


export function excludeFilter(...tests:TFilterTest[]):IFilter[] {
	return tests.map(test => ({
		type: FilterType.Exclude,
		test
	}))
}

