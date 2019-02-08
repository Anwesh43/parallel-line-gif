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

class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += updateValue(this.scale, this.dir, lines, lines)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating() {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
        }
    }
}

class PLNode {
    constructor(i) {
        this.i = i
        this.state = new State()
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new PLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context) {
        drawPLNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb) {
        this.state.update(cb)
    }

    startUpdating() {
        this.state.startUpdating()
    }

    getNext(dir, cb) {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr != null) {
            return curr
        }
        cb()
        return this
    }
}

class ParallelLine {
    constructor() {
        this.curr = new PLNode(0)
        this.dir = 1
        this.curr.startUpdating()
    }

    draw(context) {
        this.curr.draw(context)
    }

    update(cb) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            if (this.dir == 1 && this.curr.i == 0) {
                cb()
            } else {
                this.curr.startUpdating()
            }
        })
    }
}

class Renderer {
    constructor() {
        this.running = true
        this.pl = new ParallelLine()
    }

    render(context, cb, endcb) {
        while (this.running) {
            this.pl.draw(context)
            cb(context)
            this.pl.update(() => {
                this.running = false
                endcb()
            })
        }
    }
}

class ParallelLineGif {
    constructor(fn) {
        this.encoder = new GifEncoder(w, h)
        this.renderer = new Renderer()
        this.canvas = new Canvas(w, h)
        this.initEncoder(fn)
    }

    initEncoder(fn) {
        this.context = this.canvas.getContext('2d')
        this.encoder.setRepeat(0)
        this.encoder.setDelay(50)
        this.encoder.setQuality(100)
        this.encoder.createReadStream().pipe(require('fs').createWriteStream(fn))
    }

    render(context) {
        this.encoder.start()
        this.renderer.render(context, (context) => {
            this.encoder.addFrame(context)
        }, () => {
            this.encoder.end()
        })
    }
}
