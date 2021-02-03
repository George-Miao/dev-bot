const greenLog = (txt: String, prefixes?: String[]) =>
  console.log(
    `\x1b[32m[+]\x1b[0m ${prefixes?.map(x => `[${x}]`).join(' ') ?? ''} ${txt}`,
  )

const at = (name?: String) => (name ? `@${name}` : 'Unknown')

export { greenLog, at }
