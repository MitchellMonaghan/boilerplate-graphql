import fs from 'fs'
import path from 'path'

export default (folderPath, fileName) => {
  const moduleNames = fs.readdirSync(folderPath)

  const modules = []

  moduleNames.forEach((moduleName) => {
    const modulePath = path.join(process.cwd(), folderPath, moduleName, fileName)
    modules.push(require(modulePath))
  })

  return modules
}
