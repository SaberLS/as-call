/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  plugins: [
    'prettier-plugin-organize-imports',
    'prettier-plugin-sort-json',
    'prettier-plugin-packagejson',
  ],

  jsonRecursiveSort: false,
  jsonSortOrder: '{"*": "lexical"}',

  // Dodaje przecinki na końcu ostatniego elementu w obiektach/arrayach, gdy to możliwe (ES5+)
  trailingComma: 'es5',

  // Używaj spacji zamiast tabulatorów
  useTabs: false,

  // Liczba spacji na jeden poziom wcięcia
  tabWidth: 2,

  // Wymuszaj LF jako znak końca linii (Unix-style)
  endOfLine: 'lf',

  // Maksymalna długość linii przed zawinięciem
  printWidth: 80,

  // Używaj pojedynczych cudzysłowów zamiast podwójnych
  singleQuote: true,

  // Nie dodawaj średników na końcu linii
  semi: false,

  // Dodaje spację wewnątrz nawiasów klamrowych obiektów { foo: bar }
  bracketSpacing: true,

  // Służy do kontrolowania zawijania nawiasów klamrowych obiektów i map
  objectWrap: 'preserve',

  // Pomija nawiasy wokół pojedynczych argumentów funkcji strzałkowych, np. x => x + 1
  arrowParens: 'avoid',

  // Eksperymentalne formatowanie operatorów warunkowych (ternary)
  experimentalTernaries: true,

  // Automatyczne formatowanie kodu osadzonego (np. w szablonach)
  embeddedLanguageFormatting: 'auto',

  // Wymuszaj zawijanie tekstu w dokumentach typu markdown i prose
  proseWrap: 'always',

  // Używa podwójnych (" "), jak w HTML.
  jsxSingleQuote: false,

  // Przenosi zamykający znacznik do nowej lini.
  bracketSameLine: false,

  // Wymusza, by każdy atrybut JSX/HTML był w osobnej linii, jeśli są wielolinijkowe.
  singleAttributePerLine: true,

  // Zachowuje białe znaki tylko wtedy, gdy mają znaczenie wizualne.
  // Traktuje odstępy w HTML zgodnie z tym, jak działa CSS (np. <pre> vs <div>).
  htmlWhitespaceSensitivity: 'css',
}

export default config
