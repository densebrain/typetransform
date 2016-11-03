

import {getValue} from 'typeguard'

export const hasOwnProp = (o,it) => getValue(() => o.hasOwnProperty && o.hasOwnProperty(it))