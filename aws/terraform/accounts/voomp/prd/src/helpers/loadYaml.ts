import fs from 'fs'
import YAML from 'yaml'

export const loadYAML = (path: string) => {
  const file = fs.readFileSync(path, 'utf8')
  return YAML.parse(file)
}