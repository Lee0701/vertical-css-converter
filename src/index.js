
import { convertAll } from './convert.js'

async function main() {
    const args = process.argv.slice(2)
    const [indir, outdir] = args
    convertAll(indir, outdir)
}

main()
