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
