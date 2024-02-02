
import path from 'path'
import fs from 'fs/promises'

const directions = {
    'left': 'inline-start',
    'right': 'inline-end',
    'top': 'block-start',
    'bottom': 'block-end',
}

const pointDirections = {
    'top-left': 'start-start',
    'top-right': 'start-end',
    'bottom-left': 'end-start',
    'bottom-right': 'end-end',
}

const replacements = {
    'width': 'inline-size',
    'height': 'block-size',
    'min-width': 'min-inline-size',
    'min-height': 'min-block-size',
    'max-width': 'max-inline-size',
    'max-height': 'max-block-size',
}

export async function convertRecursive(inpath) {
    if((await fs.stat(inpath)).isDirectory()) {
        const files = await fs.readdir(inpath)
        await Promise.all(files.map((file) => {
            return convertRecursive(path.join(inpath, file))
        }))
    } else if(['.css', '.less', '.scss', '.sass'].includes(path.extname(inpath))) {
        const content = await fs.readFile(inpath, 'utf-8')
        const result = await convert(content)
        await fs.writeFile(inpath, result)
    }
}

export async function convertAll(indir, outdir) {
    const files = await fs.readdir(indir)
    await Promise.all(files.map((file) => {
        const input = path.join(indir, file)
        const output = path.join(outdir, file)
        return convertFile(input, output)
    }))
}

export async function convertFile(input, output) {
    const content = await fs.readFile(input, 'utf-8')
    const result = await convert(content)
    await fs.writeFile(output, result)
}

export default function convert(str) {
    const lines = str.split('\n')
    const output = lines.map(convertLine)
    return output.join('\n')
}

export function convertLine(line) {
    const [content, comment] = line.split('//').map((s) => s.trim())
    const indent = line.slice(0, line.indexOf(content))
    if(!content && comment) return line
    else if(!content.includes(':')) return line
    else if(content.includes('{') || content.includes('}')) return line
    else if(content.endsWith(',')) return line
    else if(content.startsWith('@')) return line
    else if(content.includes('/*') || content.includes('*/')) return line
    const [key, value] = content.split(':')
    const resultKey = convertKey(key)
    const resultValue = convertValue(value.replace(';', ''))
    return `${indent}${resultKey}: ${resultValue};${comment ? ' // ' + comment : ''}`
}

export function convertKey(key) {
    key = key.trim()
    if(key in directions) {
        const dir = directions[key]
        return `inset-${dir}`
    } else if(key.startsWith('margin-')) {
        const dir = directions[key.replace('margin-', '')]
        return `margin-${dir}`
    } else if(key.startsWith('padding-')) {
        const dir = directions[key.replace('padding-', '')]
        return `padding-${dir}`
    } else if(key.startsWith('border-') && key != 'border-radius') {
        if(key.endsWith('-width')) {
            return key
        } if(key.endsWith('-radius')) {
            const dir = pointDirections[key.replace('border-', '').replace('-radius', '')]
            return `border-${dir}-radius`
        } else {
            const dir = directions[key.replace('border-', '')]
            if(!dir) return key
            return `border-${dir}`
        }
    } else {
        return replacements[key] || key
    }
}

export function convertValue(value) {
    value = value.trim()
    return value
}
