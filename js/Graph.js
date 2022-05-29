






const Graph = function Graph(isline, delay, fmt, fg, bg, bg2) {
    this.fmt = fmt !== undefined ? fmt : (v, vw, mi, ma) => JSON.stringify([v, vw, mi, ma])
    fg = fg !== undefined ? fg : 'red'
    bg = bg !== undefined ? bg : 'white'
    bg2 = bg2 !== undefined ? bg2 : 'gray'
    this.data = {}

    const root = document.createElement('div')
    makeDraggable(root)
    root.classList.add('graph')
    this.view = root

    const navbar = document.createElement('div')
    navbar.style.borderColor = bg2
    navbar.style.backgroundColor = bg
    navbar.style.color = fg

    const text = document.createElement('span')
    navbar.appendChild(text)

    const closebtn = document.createElement('span')
    closebtn.innerText = '×'
    closebtn.style.borderLeftColor = bg2
    closebtn.addEventListener('mouseup', (ev) => Graphs.closeGraph(ev.path[2]))
    navbar.appendChild(closebtn)

    root.appendChild(navbar)
    const canvas = document.createElement('canvas')
    canvas.style.borderColor = bg2
    root.appendChild(canvas)

    let w = canvas.width, h = canvas.height
    const ctx = canvas.getContext('2d')
    const clearCanvas = () => {
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)
    }
    clearCanvas()
    let prevtext = 0
    let minv = Infinity
    let maxv = 0
    const update2 = isline ? (() => {
        let vv = 0
        ctx.strokeStyle = fg
        return (steps, v) => {
            ctx.beginPath()
            ctx.moveTo(w - steps, h - vv)
            ctx.lineTo(w, h - v)
            ctx.stroke()
            vv = v
        }
    })() : (steps, v) => {
        ctx.fillStyle = fg
        ctx.fillRect(w - steps, h, steps, -v)
    }
    this.update = function (steps, v, minw, maxw) {
        const t = performance.now()
        if (minw != undefined)
            minv = minw
        if (maxw != undefined)
            maxv = maxw
        minv = min(minv, v)
        if (maxv < v) {
            const newh = h * maxv / v
            ctx.drawImage(canvas, steps, 0, w - steps, h, 0, h - newh, w - steps, newh)
            maxv = v
        }
        else
            ctx.drawImage(canvas, steps, 0, w - steps, h, 0, 0, w - steps, h)
        ctx.fillStyle = bg
        ctx.fillRect(w - steps, 0, steps, h)
        update2(steps, h * (v - minv) / (maxv * 1.1 - minv))
        if (prevtext < t) {
            text.innerText = this.fmt(v, maxw, minv, maxv)
            const dx = navbar.offsetWidth - text.offsetWidth - closebtn.offsetWidth - 8
            if (dx < 0) {
                let z = ctx.getImageData(0, 0, w, h)
                canvas.width -= dx
                w = canvas.width
                clearCanvas()
                ctx.putImageData(z, -dx, 0)
            }
            prevtext = t + delay
        }
    }
}

