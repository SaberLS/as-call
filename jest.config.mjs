console.log(`✅ Loaded Jest config from: ${import.meta.dirname}`)

const config = {
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'esbuild-jest',
      {
        platform: 'node',
        target: 'node20',
        bundle: true,
        packages: 'bundle',
      },
    ],
  },
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*(.|/)(test|spec)).(ts|tsx|js|jsx)$',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [],
}

export default config
