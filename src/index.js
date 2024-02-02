
import { convertAll, convertRecursive } from './convert.js'

async function main() {
    const args = process.argv.slice(2)
    const [indir, outdir] = args
    if(outdir == '--recursive' || outdir == '-r') {
        convertRecursive(indir)
    } else {
        convertAll(indir, outdir)
    }
}

main()
