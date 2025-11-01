import fs from 'fs'
import path from 'path'

type Item = {
  id: number
  title: string
  level: string
  fileName: string
  imageAlt: string
  description?: string
  pros?: string[]
  cons?: string[]
}

const root = process.cwd()
const dataPath = path.join(root, 'data', 'data.json')
const imagesDir = path.join(root, 'public', 'images', 'positions')

const raw = fs.readFileSync(dataPath, 'utf-8')
const json = JSON.parse(raw)
const items: Item[] = json.data

let missing = 0
let missingImages = 0
let problems: string[] = []

for (const it of items) {
  if (!it.title || !it.level || !it.fileName || !it.imageAlt) {
    missing++
    problems.push(`Missing required fields for id=${it.id}`)
  }
  const imgPath = path.join(imagesDir, it.fileName)
  if (!fs.existsSync(imgPath)) {
    missingImages++
    problems.push(`Image not found for id=${it.id} expected=${it.fileName}`)
  }
}

console.log(`Checked ${items.length} items.`)
console.log(`Missing fields: ${missing}; Missing images: ${missingImages}`)
if (problems.length) {
  console.log('Details:')
  for (const p of problems.slice(0, 100)) console.log('-', p)
}

process.exit(0)

