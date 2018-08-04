import { merge } from 'lodash'
import { loadModules } from '@services/moduleLoader'

const moduleDirectives = loadModules('./src/modules', 'directives')

const directives = {}
Object.keys(moduleDirectives).forEach(directiveKey => {
  const directive = moduleDirectives[directiveKey]
  merge(directives, directive)
})

export default directives
