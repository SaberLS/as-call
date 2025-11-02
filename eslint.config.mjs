import { createConfig } from './createConfig.mjs'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const eslintConfig = createConfig(__dirname)

export default eslintConfig
