import { Map, List, Record } from 'immutable'
import * as Immutable from 'immutable'
import _ = require('lodash')
import { toPlainObject, fromPlainObject, isTransformed } from "../TypeTransform"
import { FilterType } from "../Types"
import { isNil, isMap } from "typeguard"
import { excludeFilterConfig, excludeFilter } from "../Helpers"

let
	Map1 = Map({
		hello: 'goodbye',
		names: List([
			'victor',
			'coolio'
		])
	}),
	Fixture = {
		m: Map1
	}

const
	log = console.log.bind(console)


test('Can convert to plain object and rehydrate with equality',() => {
	expect(Immutable.is(Map1,fromPlainObject(toPlainObject(Map1)))).toBe(true)
})

test('Diff types dont match - sanity',() => {
	expect(isNil(Fixture.m.get('hello'))).toBe(false)

	const
		filtered = toPlainObject(Map1,{
			defaultExcluded:false,
			filters:[
				{
					type: FilterType.Exclude,
					test: 'hello'
				}
			]
		})

	expect(isTransformed(filtered)).toBe(true)
	expect(isNil(filtered.hello)).toBe(true)

	const
		hydrated = fromPlainObject(filtered)

	expect(isMap(hydrated)).toBe(true)
	expect(Immutable.is(Map1,hydrated)).toBe(false)
})


test('Regex filter',() => {

	const
		plain = toPlainObject(Map1,{
			defaultExcluded:false,
			filters:[
				{
					type: FilterType.Exclude,
					test: /.*/
				}
			]
		}).$$value

	expect(Object.keys(plain).length).toBe(0)

	expect(Object.keys(toPlainObject(Map1,{
		defaultExcluded:false,
		filters:[
			{
				type: FilterType.Exclude,
				test: /hello/
			}
		]
	}).$$value).length).toBe(1)

	expect(toPlainObject(Map1).$$value.names.$$value.length).toBe(2)


	const
		hydrated = toPlainObject(Map1,{
			defaultExcluded:false,
			filters:[
				{
					type: FilterType.Exclude,
					test: /1/
				}
			]
		}).$$value.names.$$value.length

	expect(hydrated).toBe(1)
})


const TestRecord = Record({
	auth: false,
	authTrans: false,
	myList: List<number>([1,2,3,4,5])
})

class TestModel extends TestRecord {
	
	constructor(o = {}) {
		super(o)
	}
	
	toJS() {
		const
			filterConfig = excludeFilterConfig(...excludeFilter('authTrans'))
		console.log(filterConfig)
		return toPlainObject(this,filterConfig)
	}
	
	auth:boolean
	authTrans:boolean
	myList:List<number>
}


test(`exclude filter`,() => {
	const
		model = new TestModel({auth:true,authTrans:true})
	
	expect(model.authTrans).toBeTruthy()
	expect(model.auth).toBeTruthy()
	
	const
		po = model.toJS()
	
	console.log(po)
	expect(isNil(po.$$value.authTrans)).toBeTruthy()
	expect(po.$$value.auth).toBeTruthy()
	
	const
		inflatedMap = fromPlainObject(po),
		hydratedModel = new TestModel(inflatedMap)
	
	console.log(`Inflated`,inflatedMap,'record',hydratedModel)
	expect(hydratedModel.authTrans).toBeFalsy()
	expect(hydratedModel.auth).toBeTruthy()
	expect(isMap(hydratedModel)).toBeTruthy()
})

test(`nested maps`,() => {
	const
		map = Map({
			subMap: Map({
				myVal: '123'
			})
		})
})

// log(`Original = `,Fixture)
//
//
// log(`Plain Object = `,newVal)
//
// const
// 	rehydrated = fromPlainObject(newVal)
//
// log(`Re-hydrated`,rehydrated)