/**
 * Writes a tiny, valid placeholder PDF to public/janith-godage-web-cv.pdf so the Download CV
 * links work before the real file exists. Replace the PDF with your real CV (same file name).
 * Won't overwrite a file that isn't the placeholder.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const OUT = 'public/janith-godage-web-cv.pdf'
const MARK = '(PLACEHOLDER-CV)'
if (existsSync(OUT) && !readFileSync(OUT, 'latin1').includes(MARK)) {
  console.log('cv: real CV found, leaving it alone')
  process.exit(0)
}

const lines = [
  ['F2', 28, 'Janith Godage'],
  ['F1', 12, 'Web developer - front-end & creative development'],
  ['F1', 12, 'Sri Lanka  |  janithzgodage@gmail.com'],
  ['F1', 12, ''],
  ['F2', 14, 'This is a placeholder CV.'],
  ['F1', 12, 'The real one is on its way. Replace public/janith-godage-web-cv.pdf'],
  ['F1', 12, 'with your actual CV (keep the same file name).'],
]
let y = 760
const text = lines
  .map(([f, size, t]) => {
    const s = `BT /${f} ${size} Tf 64 ${y} Td (${t.replace(/[()\\]/g, (c) => '\\' + c)}) Tj ET`
    y -= size + 14
    return s
  })
  .join('\n')
const stream = `${text}\n% ${MARK}`
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
  `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>',
  `<< /Title (Janith Godage - CV ${MARK}) /Author (Janith Godage) >>`,
]
let pdf = '%PDF-1.4\n'
const offsets = []
objects.forEach((o, i) => {
  offsets.push(Buffer.byteLength(pdf, 'latin1'))
  pdf += `${i + 1} 0 obj\n${o}\nendobj\n`
})
const xref = Buffer.byteLength(pdf, 'latin1')
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xref}\n%%EOF\n`
writeFileSync(OUT, pdf, 'latin1')
console.log('cv: placeholder PDF written')
