




window.CanvasRenderer = (() => {
    function addEventListeners() {
        const contextmenu = (() => {
            const tmpvec = new Vec2()
            return e => {
                if (this.editingDisabled())
                    return
                e.preventDefault()
                ObjectMenu.close(this)
                if (!engine.objs.some(x => {
                    tmpvec.set((e.x - this.screenPos.x) / this.scale, (e.y - this.screenPos.y) / this.scale)
                    if (x.s.distance(tmpvec) < x.r) {
                        ObjectMenu.open(e.x, e.y, x)
                        return 1
                    }
                    return 0
                }))
                    Settings.set('running', ObjectMenu.wasRunning)
            }
        })()
        this.canvas.addEventListener('mousedown', e => {
            if (this.editingDisabled())
                return
            ObjectMenu.close(this)
            if (e.button === 0) {
                const x = (e.x - this.screenPos.x) / this.scale
                const y = (e.y - this.screenPos.y) / this.scale
                if (!engine.objs.some(z => isInside(z, x, y)))
                    this.editing_obj = {
                        v: new Entity(getNextNewObjectName(), x, y, 1, 5 / this.scale)
                            .setParams({ color: randomColor() }),
                        x: x,
                        y: y
                    }
            }
            else {
                if (!ObjectMenu.isOpened())
                    ObjectMenu.wasRunning = Settings.get('running')
                if (Settings.get('running'))
                    Settings.set('running', 0)
            }
        })
        this.canvas.addEventListener('mousemove', e => {
            if (this.editingDisabled())
                return
            const x = (e.x - this.screenPos.x) / this.scale
            const y = (e.y - this.screenPos.y) / this.scale
            if (this.editing_obj) {
                this.editing_obj.x = x
                this.editing_obj.y = y
            }
            else if (!engine.objs.some(z => {
                if (isInside(z, x, y)) {
                    Settings.set('selected_obj', z)
                    return 1
                }
                return 0
            }))
                Settings.set('selected_obj', null)
        })
        this.canvas.addEventListener('mouseup', e => {
            if (this.editingDisabled())
                return
            if (e.button === 0) {
                const t = this.editing_obj
                this.editing_obj = null
                if (t) {
                    t.v.v.x = t.v.s.x - t.x
                    t.v.v.y = t.v.s.y - t.y
                    this.addObject(t.v)
                }
            }
        })
        this.canvas.addEventListener('mouseout', e => {
            if (this.editingDisabled())
                return
            if (this.editing_obj)
                this.editing_obj = null
        })
        const mousewheel = (() => {
            return e => {
                if (ObjectMenu.isOpened() || Settings.isOpened())
                    return
                this.scale *= 1 + min(10, max(-10, e.deltaY)) / 100
                this.scale = max(1e-7, min(1e2, this.scale))
            }
        })()
        const KEYCODE_SPACE = 32
        const KEYCODE_LEFT = 37
        const KEYCODE_UP = 38
        const KEYCODE_RIGTH = 39
        const KEYCODE_DOWN = 40
        const KEYCODE_PLUS = 107
        const KEYCODE_MINUS = 109
        const keydown = e => {
            if (ObjectMenu.isOpened() || Settings.isOpened())
                return
            if (e.keyCode === KEYCODE_LEFT)
                this.screenPosSpeed.x = 1000
            else if (e.keyCode === KEYCODE_RIGTH)
                this.screenPosSpeed.x = -1000
            if (e.keyCode === KEYCODE_UP)
                this.screenPosSpeed.y = 1000
            else if (e.keyCode === KEYCODE_DOWN)
                this.screenPosSpeed.y = -1000
            if (e.keyCode === KEYCODE_PLUS)
                this.simulation_speedSpeed = 10
            else if (e.keyCode === KEYCODE_MINUS)
                this.simulation_speedSpeed = -10
        }
        const keyup = e => {
            if (e.keyCode === KEYCODE_LEFT || e.keyCode === KEYCODE_RIGTH)
                this.screenPosSpeed.x = 0
            else if (e.keyCode === KEYCODE_UP || e.keyCode === KEYCODE_DOWN)
                this.screenPosSpeed.y = 0
            else if (e.keyCode === KEYCODE_PLUS || e.keyCode === KEYCODE_MINUS)
                this.simulation_speedSpeed = 0
        }
        const keypress = e => {
            if (ObjectMenu.isOpened() || Settings.isOpened())
                return
            if (e.keyCode === KEYCODE_SPACE)
                Settings.set('running', !Settings.get('running'))
        }
        this.enableEvents = () => {
            window.addEventListener('contextmenu', contextmenu)
            window.addEventListener('mousewheel', mousewheel)
            window.addEventListener('keydown', keydown)
            window.addEventListener('keyup', keyup)
            window.addEventListener('keypress', keypress)
        }
        this.disableEvents = () => {
            window.removeEventListener('contextmenu', contextmenu)
            window.removeEventListener('mousewheel', mousewheel)
            window.removeEventListener('keydown', keydown)
            window.removeEventListener('keyup', keyup)
            window.removeEventListener('keypress', keypress)
        }
    }
    return function CanvasRenderer(canvas) {
        this.canvas = canvas
        this.trails_globalmax = 1024
        this.trails_max = 64
        this.trails_skip = 5
        this.trails_scale = 1
        this.simulation_speedSpeed = 0
        this.lastTime = -1
        this.scale = 1
        this.screenPos = new Vec2()
        this.screenPosSpeed = new Vec2()
        this.ctx = canvas.getContext('2d')
        this.editing_obj = null
        this.preRender = []
        this.postRender = []
        this.preCalc = []
        this.postCalc = []
        this.editingDisabled = () => !Settings.get('editor_mode')
        addEventListeners.call(this)
        this.removeAllObjects = () => {
            engine.objs = []
            engine.onObjectsChanged()
        }
        this.addObject = x => {
            this.trails_max = min(64, floor(this.trails_globalmax / engine.objs.length))
            engine.objs.push(x)
            engine.onObjectsChanged()
            return x
        }
        const camPos = new Vec2()
        this.getCameraPosition = (v) => v.set(camPos.x, camPos.y)
        this.setCameraPosition = (x, y) => {
            camPos.set(x, y)
            this.screenPos.x = this.canvas.width * Settings.get('centerx') - this.scale * x
            this.screenPos.y = this.canvas.height * Settings.get('centery') - this.scale * y
        }
        const arc = (x, y, r, a, b) => {
            this.ctx.arc(this.screenPos.x + x * this.scale, this.screenPos.y + y * this.scale, r * this.scale, a, b)
        }
        const circle = (x, y, r) => {
            this.ctx.arc(this.screenPos.x + x * this.scale, this.screenPos.y + y * this.scale, r * this.scale, 0, PI2)
        }
        this.drawObject = (obj, x, y, stroke, color) => {
            x = x ? x : obj.s.x
            y = y ? y : obj.s.y
            color = color ? color : obj.color
            const r = obj.r
            if (typeof color === 'string') {
                if (!stroke) {
                    try {
                        const rg = this.ctx.createRadialGradient(
                            this.screenPos.x + this.scale * x, this.screenPos.y + this.scale * y, this.scale * r / 100,
                            this.screenPos.x + this.scale * x, this.screenPos.y + this.scale * y, this.scale * r)
                        rg.addColorStop(0, 'white')
                        rg.addColorStop(1, color ? color : obj.color)
                        this.ctx.fillStyle = rg
                    }
                    catch (e) {
                        //console.error(x, y)
                        this.ctx.fillStyle = color ? color : obj.color
                    }
                }
                else
                    this.ctx.strokeStyle = color
                this.ctx.beginPath()
                circle(x, y, r)
                if (stroke)
                    this.ctx.stroke()
                else
                    this.ctx.fill()
            }
            else {
                this.ctx.save()
                this.ctx.beginPath()
                circle(x, y, r)
                this.ctx.closePath()
                this.ctx.clip()
                this.ctx.drawImage(color, 0, 0, color.width, color.height, this.screenPos.x + (x - r) * this.scale, this.screenPos.y + (y - r) * this.scale, r * this.scale * 2, r * this.scale * 2)
                this.ctx.restore()
            }
        }
        this.arrowTo = (x, y, d, t, s) => {
            this.ctx.beginPath()
            this.ctx.moveTo(x, y)
            const dx = x + d * cos(t)
            const dy = y + d * sin(t)
            d /= 5
            this.ctx.lineTo(dx, dy)
            this.ctx.lineTo(dx - cos(t - PIdiv6) * d, dy - sin(t - PIdiv6) * d)
            this.ctx.moveTo(dx, dy)
            this.ctx.lineTo(dx - cos(t + PIdiv6) * d, dy - sin(t + PIdiv6) * d)
            this.ctx.moveTo(dx, dy)
            this.ctx.stroke()
            this.ctx.fillText(s, x - this.ctx.measureText(s).width / 2 + d * 5 * cos(t), y + d * 5 * sin(t))
        }
        const drawArrow = (x, y, d, t, s) =>
            this.arrowTo(this.screenPos.x + x * this.scale, this.screenPos.y + y * this.scale, d * this.scale, t, s)
        const drawVector = (x, v, d, s) => {
            drawArrow(x.s.x, x.s.y, sign(v.x) * x.r * d, 0, i2str(abs(v.x), 1) + s)
            drawArrow(x.s.x, x.s.y, -sign(v.y) * x.r * d, -PIdiv2, i2str(abs(v.y), 1) + s)
            drawArrow(x.s.x, x.s.y, x.r * d * .8, atan2(v.y, v.x), i2str(abs(v.distance()), 1) + s)
            this.ctx.beginPath()
            const t = atan2(v.y, v.x)
            //let tt = -t * 180 / PI
            //if (tt < 0)tt += 360 
            //console.log(t * 180 / PI, tt)
            //if (t > 0 && t < PIdiv2)
            //arc(x.s.x, x.s.y, x.r * d * .55, 0, tt * PI / 180)
            arc(x.s.x, x.s.y, x.r * d * .55, t, 0)
            this.ctx.stroke()
        }
        const drawArrow2 = (x, y, a, b, d, t, s) => {
            this.arrowTo(this.screenPos.x + x * this.scale, this.screenPos.y + y * this.scale, d * this.scale, t, s)
            this.ctx.moveTo(this.screenPos.x + x * this.scale, this.screenPos.y + y * this.scale)
            this.ctx.lineTo(this.screenPos.x + a * this.scale, this.screenPos.y + b * this.scale)
            this.ctx.stroke()
        }
        const drawObjectInfo = x => {
            if (!canSee(x.r))
                return
            this.ctx.globalAlpha = Settings.get('showvaF_alpha')
            if (x.showv) {
                this.ctx.strokeStyle = 'green'
                this.ctx.font = '14px sans-serif'
                this.ctx.fillStyle = 'lime'
                drawVector(x, x.v, 2, str_MS1)
            }
            if (x.showa) {
                this.ctx.strokeStyle = 'red'
                this.ctx.font = '14px sans-serif'
                this.ctx.fillStyle = 'orange'
                drawVector(x, x.a, 4, str_MS2)
            }
            if (x.showF) {
                this.ctx.strokeStyle = 'blue'
                this.ctx.font = '14px sans-serif'
                this.ctx.fillStyle = 'skyblue'
                const G = -Settings.get('G')
                engine.objs.forEach(y => {
                    if (x != y) {
                        const t = atan2(y.s.y - x.s.y, y.s.x - x.s.x)
                        const d = x.s.distance(y.s)
                        const f = G * x.m * y.m / pow2(d)
                        drawArrow2(y.s.x, y.s.y, x.s.x, x.s.y, -d / 4, t, i2str(-f, 1) + ' N')
                    }
                })
            }
            this.ctx.globalAlpha = 1
        }
        const highlightObject = (x) => {
            this.ctx.globalAlpha = Settings.get('showvaF_alpha')
            this.ctx.strokeStyle = 'red'
            this.ctx.lineWidth = 1.4
            this.ctx.beginPath()
            circle(x.s.x, x.s.y, x.r + .2)
            this.ctx.stroke()
            this.ctx.lineWidth = 1
            this.ctx.globalAlpha = 1
        }
        const text = (x, y, str, color, font, sz) => {
            this.ctx.font = sz + 'px ' + font
            this.ctx.fillStyle = color
            this.ctx.fillText(str, this.screenPos.x + this.scale * x - this.ctx.measureText(str).width / 2, this.screenPos.y + this.scale * y + sz)
        }
        const canSee = (r) => r / this.scale < 2000 && r / this.scale > 1e-2
        this.draw = (delta) => {
            this.screenPos.mulAdd(this.screenPosSpeed, delta)
            Settings.set('simulation_speed', Settings.get('simulation_speed') + this.simulation_speedSpeed * delta)
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            engine.objs.forEach(x => {
                const r = x.r
                x.trails.forEach(([sx, sy], i) => {
                    this.ctx.globalAlpha = i / x.trails.length / 10 * 9 + .1
                    x.r = r * this.trails_scale * i / x.trails.length
                    this.drawObject(x, sx, sy, 0, x.color2)
                })
                x.r = r
                if (x.trails.length >= this.trails_max)
                    x.trails.splice(0, x.trails.length - this.trails_max)
                if (x.trails.skip++ === this.trails_skip) {
                    x.trails.skip = 0
                    const t = [x.s.x, x.s.y]
                    if (x.trails.length) {
                        const tt = x.trails[x.trails.length - 1]
                        if (t[0] === tt[0] && t[1] === tt[1])
                            return
                    }
                    x.trails.push(t)
                }
            })
            this.ctx.globalAlpha = 1
            {
                engine.objs.forEach(z =>
                    z.freqz.forEach((f, i) => {
                        this.ctx.strokeStyle = 'lime'
                        this.ctx.beginPath()
                        circle(f[0], f[1], f[2])
                        this.ctx.stroke()
                    })
                )
            }
            engine.objs.forEach(x => this.drawObject(x))
            {
                let x = Settings.get('selected_obj')
                if (x || (x = Camera.getTrackingObject())) {
                    highlightObject(x)
                    drawObjectInfo(x)
                }
                else
                    engine.objs.forEach(v => drawObjectInfo(v))
            }
            if (Settings.get('show_names')) {
                this.ctx.globalAlpha = Settings.get('names_alpha')
                engine.objs.forEach(x => {
                    if (canSee(x.r))
                        text(x.s.x, x.s.y + x.r, x.name, 'white', 'sans-serif', 20)
                })
            }
            this.ctx.globalAlpha = 1
            if (this.editing_obj) {
                const x = this.editing_obj
                this.drawObject(x.v)
                if (x.v.s.distance(new Vec2(x.x, x.y)) / this.scale < x.v.r) {
                    x.v.r += 20 * delta / this.scale
                    x.v.m = sphereVolume(x.v.r)
                }
                else {
                    this.ctx.strokeStyle = 'white'
                    this.ctx.beginPath()
                    const moveTo = (x, y) => this.ctx.moveTo(this.screenPos.x + this.scale * x, this.screenPos.y + this.scale * y)
                    const lineTo = (x, y) => this.ctx.lineTo(this.screenPos.x + this.scale * x, this.screenPos.y + this.scale * y)
                    const s = x.v.s
                    moveTo(x.x, x.y)
                    //const t = atan2(x.y - s.y, x.x - s.x)
                    lineTo(s.x, s.y)
                    //text(x.x, x.y, 'helloo ' + t, 'white', '20px sans-serif')
                    this.ctx.stroke()
                }
            }
        }
        this.render = (now => {
            now = now === undefined ? now : performance.now()
            const delta = (now - this.lastTime) / 1000
            if (Settings.get('running') && delta < 0.05) {
                let z = min(100, max(1, floor(Settings.get('simulation_speed'))))
                while (z-- > 0) {
                    this.preCalc.forEach(x => x(delta))
                    engine.step(delta)
                    this.postCalc.forEach(x => x(delta))
                }
            }
            this.preRender.forEach(x => x(delta))
            this.draw(delta)
            this.postRender.forEach(x => x(delta))
            this.lastTime = now
            requestAnimationFrame(this.render)
        }).bind(this)
        this.begin = () => {
            Settings.set('running', 1)
            requestAnimationFrame(this.render)
        }
    }
})()