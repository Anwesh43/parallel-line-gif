const w = 600
const h = 600
const scGap = 0.05
const scDiv = 0.51
const lineColor = "#0277BD"
const backColor = "#212121"
const Canvas = require('canvas').Canvas
const GifEncoder = require('gifencoder')
const sizeFactor = 3
const strokeFactor = 90
const lines = 2
const nodes = 5

const maxScale = (scale, i, n) => Math.max(0, scale - i / n)
const divideScale = (scale, i, n) => Math.min(1/n, scale - i / n) * n
const scaleFactor = (scale) => Math.floor(scale / 0.51)
const mirrorValue = (scale, a, b) => {
    const k = scaleFactor(scale)
    return (1 - k) / a + k / b
}
const updateValue = (scale, dir, a, b) => {
    return mirrorValue(scale, a, b) * dir * 0.05
}

const drawRotatedLine = (context, size, y, deg) => {
    context.save()
    context.translate(-size, y)
    context.rotate(deg)
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(size, 0)
    context.stroke()
    context.restore()
}
const drawPLNode = (context, i, scale) => {
    const gap = w / (nodes + 1)
    const size = gap / sizeFactor
    const sc1 = divideScale(scale, 0, 2)
    const sc2 = divideScale(scale, 1, 2)
    context.lineCap = 'round'
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.strokeStyle = lineColor
    context.save()
    context.translate(gap * (i + 1), h / 2)
    for (var j = 0; j < lines; j++) {
        const sc1j = divideScale(sc1, j, lines)
        const sc2j = divideScale(sc2, j, lines)
        context.save()
        context.scale(1 - 2 * j, 1)
        drawRotatedLine(context, size, h/2 * sc2j, (Math.PI/2) * sc1j)
        context.restore()
    }
    context.restore()
}
