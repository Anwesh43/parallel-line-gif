const w = 600
const h = 600
const scGap = 0.05
const scDiv = 0.51
const lineColor = "#0277BD"
const backColor = "#212121"
const Canvas = require('canvas').Canvas
const GifEncoder = require('gifencoder')
const sizeFactor : number = 3
const strokeFactor : number = 90

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
