




class Entity {
    constructor(name, x, y, mass, radius) {
        this.name = name
        this.s = new Vec2(x ? x : 0, y ? y : 0)
        this.v = new Vec2()
        this.a = new Vec2()
        this.m = mass
        this.r = radius
        this.cor = .2
        this.freq = 0
        this.freqs = {}
        this.freqn = 0
        this.freqz = []
        this.intensity = 1
        this.gpe = 0
        this.collision = true
        this.collisions = new Set()
        this.trails = []
        this.trails.skip = 0
        this.graphs = []
        this.showv = false
        this.showa = false
        this.showF = false
    }
    setParams(x) {
        for (const y in x)
            if (x.hasOwnProperty(y))
                this[y] = x[y]
        return this
    }
}
function PhysicsEngine() {
    this.objs = []
    this.onObjectsChange = []
    this.onObjectsChanged = () => this.onObjectsChange.forEach(x => x())
    const detectCollision = (a, b) => a.s.distance(b.s) < (a.r + b.r)
    this.handleCollisions = (dt) => {
        this.objs.forEach((x, xi) => {
            if (!x.collision)
                return
            for (let yi = xi + 1; yi < this.objs.length; yi++) {
                const y = this.objs[yi]
                if (!y.collision)
                    continue
                if (x.collisions.has(y)) {
                    if (detectCollision(x, y)) {
                        x.s.mulAdd(x.v, -dt)
                        y.s.mulAdd(y.v, -dt)
                    }
                    else {
                        x.collisions.delete(y)
                        y.collisions.delete(x)
                    }
                } else if (detectCollision(x, y)) {
                    AudioPlayer.play('collision', .5)
                    x.collisions.add(y)
                    y.collisions.add(x)
                    x.s.mulAdd(x.v, -dt)
                    y.s.mulAdd(y.v, -dt)
                    const m1 = x.m
                    const m2 = y.m
                    const v1 = x.v.distance()
                    const v2 = y.v.distance()
                    const t1 = x.v.angle()
                    const t2 = y.v.angle()
                    const p = atan2(x.s.y - y.s.y, x.s.x - y.s.x)
                    x.v.x = (1 - x.cor) * (v1 * cos(t1 - p) * (m1 - m2) + 2 * m2 * v2 * cos(t2 - p)) * cos(p) / (m1 + m2) + v1 * sin(t1 - p) * cos(p + PI / 2)
                    x.v.y = (1 - x.cor) * (v1 * cos(t1 - p) * (m1 - m2) + 2 * m2 * v2 * cos(t2 - p)) * sin(p) / (m1 + m2) + v1 * sin(t1 - p) * sin(p + PI / 2)
                    y.v.x = (1 - y.cor) * (v2 * cos(t2 - p) * (m2 - m1) + 2 * m1 * v1 * cos(t1 - p)) * cos(p) / (m1 + m2) + v2 * sin(t2 - p) * cos(p + PI / 2)
                    y.v.y = (1 - y.cor) * (v2 * cos(t2 - p) * (m2 - m1) + 2 * m1 * v1 * cos(t1 - p)) * sin(p) / (m1 + m2) + v2 * sin(t2 - p) * sin(p + PI / 2)
                }
            }
        })
    }
    let tmpvecx, tmpvecy
    this.update = (dt) => {
        const G = -Settings.get('G')
        this.objs.forEach(x => {
            tmpvecx = 0, tmpvecy = 0
            x.gpe = 0
            this.objs.forEach(y => {
                if (x != y && !(x.collisions.has(y))) {
                    const th = atan2(x.s.y - y.s.y, x.s.x - y.s.x)
                    const r = x.s.distance(y.s)
                    x.gpe += y.m / r
                    const f = G * y.m / r / r
                    tmpvecx += f * cos(th), tmpvecy += f * sin(th)
                }
            })
            x.gpe *= -G * x.m
            x.a.x = tmpvecx, x.a.y = tmpvecy
            x.v.mulAdd(x.a, dt)
            x.s.mulAdd(x.v, dt)
        })
    }
    this.step = (dt) => {
        this.update(dt)
        this.handleCollisions(dt)
    }
}