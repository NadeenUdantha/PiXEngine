



window.addEventListener('load', () => {
    window.ObjectMenu = new (function ObjectMenu() {
        this.obj = null
        const root = document.querySelector('.ObjectMenu')
        const view1 = root.querySelector('.ObjectMenu1')
        const view2 = root.querySelector('.ObjectMenu2')
        let canvas1, canvas2
        [canvas1, canvas2] = view2.querySelectorAll('canvas');
        const ins = [...view1.querySelectorAll(".tb1 input")]
        const fnames = ['name', 'm', 'r', 'cor', 'freq', 'intensity']
        this.closeSubMenu = () => view2.style.display = 'none'
        ins.slice(0, fnames.length).forEach((i, ii) =>
            i.addEventListener('input', (ev) => {
                ev.preventDefault()
                this.obj[fnames[ii]] = (ii === 0) ? ev.target.value : ev.target.valueAsNumber
            })
        )
        ins.slice(fnames.length, fnames.length + 2).forEach((i, ii) =>
            i.addEventListener('input', (ev) => {
                ev.preventDefault()
                if (ii === 0)
                    this.obj.s.setX(i.valueAsNumber)
                else
                    this.obj.s.setY(i.valueAsNumber)
            })
        )
        view1.addEventListener('keydown', ev => {
            if (ev.keyCode === 13) {
                ev.preventDefault()
                const i = ins.indexOf(ev.target)
                if (i === ins.length - 1)
                    this.close()
                else
                    ins[i + 1].focus()
            }
        })
        ins.forEach(i => i.addEventListener('focus', () => this.closeSubMenu()))
        view1.querySelector("#graphtable").addEventListener('focus', () => this.closeSubMenu());
        ins[ins.length - 2].addEventListener('focus', (e) => {
            this.openSubMenu(e.target)
            e.target.blur()
        })
        this.wasRunning = false;
        this.arrowTo = (ctx, x, y) => {
            const t = atan2(y, x)
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(x, y)
            ctx.lineTo(x - cos(t - PIdiv6) * 10, y - sin(t - PIdiv6) * 10)
            ctx.moveTo(x, y)
            ctx.lineTo(x - cos(t + PIdiv6) * 10, y - sin(t + PIdiv6) * 10)
            ctx.moveTo(x, y)
            ctx.stroke()
        }
        {
            let ctx = canvas1.getContext('2d')
            ctx.translate(100, 190)
            this.arrowTo(ctx, 0, -150)
            ctx.translate(-100, -190)
            ctx.translate(10, 115)
            this.arrowTo(ctx, 180, 0)
            ctx = canvas2.getContext('2d');
            let ix, iy
            [ix, iy] = view2.querySelectorAll('input')
            let vscale = 0
            this.redraw = () => {
                ctx.clearRect(0, 0, 200, 200)
                ctx.translate(100, 115)
                const t = this.obj.v.angle()
                this.arrowTo(ctx, max(20, min(80, abs(this.obj.v.x * vscale))) * cos(t), max(20, min(80, abs(this.obj.v.y * vscale))) * sin(t))
                ctx.translate(-100, -115)
            }
            this.openSubMenu = () => {
                vscale = 10 / this.obj.v.distance()
                ix.value = this.obj.v.x
                iy.value = this.obj.v.y
                this.redraw()
                view2.style.display = 'block'
            }
            [ix, iy].forEach((x, i) => {
                x.addEventListener('input', (ev) => {
                    if (i === 0)
                        this.obj.v.x = ev.target.valueAsNumber
                    else
                        this.obj.v.y = ev.target.valueAsNumber
                    const v = this.obj.v.distance()
                    vscale = 10 / v
                    ins[ins.length - 2].value = v
                    this.redraw()
                })
            })
            let mousedown = false
            canvas2.addEventListener('mousedown', () => mousedown = true)
            canvas2.addEventListener('mouseout', () => mousedown = false)
            canvas2.addEventListener('mouseup', () => mousedown = false)
            canvas2.addEventListener('mousemove', (e) => {
                if (mousedown) {
                    this.obj.v.x = ix.value = (e.offsetX - 100) / vscale
                    this.obj.v.y = iy.value = (e.offsetY - 100) / vscale
                    this.redraw()
                }
            })
        }
        this.isOpened = () => this.obj != null
        this.open = (x, y, e) => {
            this.obj = e;
            [e.name, e.m, e.r, e.cor, e.freq, e.intensity, e.s.x, e.s.y, e.v.distance(), e.a.distance()]
                .forEach((n, i) => ins[i].value = n);
            Graphs.open(e)
            root.style.display = 'block'
            root.style.left = x + 'px'
            root.style.top = y + 'px'
        }
        this.close = () => {
            this.closeSubMenu()
            if (this.obj != null) {
                if (this.wasRunning)
                    Settings.set('running', 1)
                this.obj = null
                root.style.display = 'none'
            }
        }
        this.delete = (x) => {
            if (x === undefined)
                x = this.obj
            this.close()
            deleteObject(x)
        }
    })
})

