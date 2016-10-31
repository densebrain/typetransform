import {Map,List} from 'immutable'
import * as Immutable from 'immutable'
import _ = require('lodash')
import { toPlainObject, fromPlainObject, isTransformed } from "../TypeTransform"
import { FilterType } from "../Types"
import { isNil, isMap } from "typeguard"

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


// log(`Original = `,Fixture)
//
//
// log(`Plain Object = `,newVal)
//
// const
// 	rehydrated = fromPlainObject(newVal)
//
// log(`Re-hydrated`,rehydrated)