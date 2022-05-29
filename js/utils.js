



'sin,cos,atan2,pow,sqrt,min,max,random,round,floor,abs,PI,log,sign,E,atan'
    .split(',')
    .forEach(n => window[n] = Math[n]);
const pow2 = (x) => x * x
const PI2 = PI * 2
const PIdiv6 = PI / 6
const PIdiv2 = PI / 2

const roundTo = (x, y) => round(x * pow(10, y)) / pow(10, y)
const sum = x => x.reduce((a, b) => a + b, 0)
const average = x => sum(x) / x.length

const mapToRange = (v, smin, smax, dmin, dmax) =>
    (v - smin) / (smax - smin) * (dmax - dmin) + dmin

Array.prototype.remove = function (x) {
    if ((x = this.indexOf(x)) != -1)
        this.splice(x)
    return this
}

const getNextRandomName = (() => {
    let lastNames = {}
    return (prefix) =>
        prefix + (lastNames[prefix] = (lastNames[prefix] || 0) + 1)
})()

const getNextNewObjectName = getNextRandomName.bind(null, 'Object')

String.prototype.replaceAll = function (search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement)
}

const deleteObject = (x) => {
    Graphs.delete(x)
    engine.objs = engine.objs.filter(z => z != x)
    engine.onObjectsChanged()
}

const isInside = (v, x, y) => v.s.distancexy(x, y) <= v.r

const sphereVolume = (r) => (r * r * r * 4 * PI / 3)

const i2str = (i, d) => {
    i = (d ? (i <= pow(10, d)) : 1e-6) && (i >= 1e5) ? i.toExponential() : i.toString()
    let id = i.indexOf('.')
    if (id != -1) {
        let ie = i.indexOf('e')
        return i.substring(0, id + 1 + Math.min(d ? d : 6, (ie > 0 ? ie : i.length) - id)) + (ie > 0 ? i.substring(ie) : '')
    }
    return i
}

const rotateAround = (a, b) => {
    const r = sqrt(Settings.get('G') * b.m / a.s.distance(b.s))
    a.v.set(b.v.x, b.v.y - r)
}

const makeDraggable = (e) => {
    let x, y, z = false
    const mousemove = (ev) => {
        if (z) {
            e.style.left = ev.x - x + 'px'
            e.style.top = ev.y - y + 'px'
        }
    }
    const mouseup = (ev) => {
        if (ev.button === 0) {
            z = false
            document.removeEventListener('mousemove', mousemove)
            document.removeEventListener('mouseup', mouseup)
        }
    }
    e.addEventListener('mousedown', (ev) => {
        if (ev.button === 0) {
            x = ev.x - e.offsetLeft
            y = ev.y - e.offsetTop
            z = true
            document.addEventListener('mousemove', mousemove)
            document.addEventListener('mouseup', mouseup)
        }
    })
}


const removeDebuggingGraphs = () => {
    if (window.DebuggingGraphs && window.DebuggingGraphs.length > 0) {
        window.DebuggingGraphs.forEach(Graphs.removeChild.bind(Graphs))
        window.DebuggingGraphs = []
    }
}

const addDebuggingGraphs = () => {
    const fpsmeter = new Graph(1, 500, function (v, m) {
        return roundTo(v, 2) + ' FPS'
    }, '#00ff00', '#000800', '#990099')
    const msmeter = new Graph(0, 500, function (v, m) {
        return roundTo(v, 2) + ' MS'
    }, '#ff0088', '#080004', '#009911')
    const memmeter = new Graph(0, 500, function (v, m) {
        return bytes2str(v, 1) + ' / ' + bytes2str(m, 1)
    }, '#00ffff', '#000000', '#555555')
    fpsmeter.data.custom = true
    msmeter.data.custom = true
    memmeter.data.custom = true
    Graphs.appendChild(fpsmeter)
    Graphs.appendChild(msmeter)
    Graphs.appendChild(memmeter)
    {
        let t = undefined
        let tz = 0
        renderer.postRender.push(() => {
            const tt = performance.now()
            if (tz++ > 11) {
                fpsmeter.update(1, 1000 / (tt - t))
                memmeter.update(1, performance.memory.usedJSHeapSize, 0, performance.memory.totalJSHeapSize)
                tz = 9
            }
            tz++
            t = tt
        })
    }
    {
        let t = 0
        renderer.preCalc.push(() => t = performance.now())
        renderer.postCalc.push(() => {
            msmeter.update(1, performance.now() - t)
            Graphs.update()
        })
    }
    window.DebuggingGraphs = [fpsmeter, msmeter, memmeter]
}

const getObjectByName = (name) => engine.objs.find(x => x.name === name)

const bytes2str = (x, y) =>
    (
        (z) => round(x / pow(1024, z) * pow(10, y)) / pow(10, y) + ' ' + (x < 1024 ? '' : ('KMGTPEZY'[z - 1])) + 'B'
    )(floor(log(x) / log(1024)))

// ⁺⁻⁰¹²³⁴⁵⁶⁷⁸⁹
const str_MS1 = ' ms⁻¹', str_MS2 = ' ms⁻²'

const solarSystemObjectList = 'sun,mercury,venus,earth,moon,mars,jupiter,saturn,uranus,neptune'.split(',')

const CONSTANTS = {
    G: 6.67408e-11,
    solarSystem: {
        mass: {// 10^24 kg
            sun: 1988500,
            mercury: 0.33,
            venus: 4.87,
            earth: 5.97,
            moon: 0.073,
            mars: 0.642,
            jupiter: 1898,
            saturn: 568,
            uranus: 86.8,
            neptune: 102
        },
        diameter: {// km
            sun: 1391000,
            mercury: 4879,
            venus: 12104,
            earth: 12748,
            moon: 3475,
            mars: 6792,
            jupiter: 142984,
            saturn: 120536,
            uranus: 51118,
            neptune: 49528
        },
        distance_from_sun: {// 10^6 km
            sun: 0,
            mercury: 57.9,
            venus: 108.2,
            earth: 149.6,
            moon: 149.984,
            mars: 227.9,
            jupiter: 778.6,
            saturn: 1433.5,
            uranus: 2872.5,
            neptune: 4495.1
        },
        orbital_velocity: {// km/s
            sun: 0,
            mercury: 47.4,
            venus: 35.0,
            earth: 29.8,
            moon: 1.0,
            mars: 24.1,
            jupiter: 13.1,
            saturn: 9.7,
            uranus: 6.8,
            neptune: 5.4
        }
    }
}

const randomColor = () => {
    return `rgb(${64 + Math.round(Math.random() * 128)},${64 + Math.round(Math.random() * 128)},${64 + Math.round(Math.random() * 128)})`
}
