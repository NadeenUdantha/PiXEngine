







window.addEventListener('load', () => {
    window.Graphs = new (function Graphs() {
        this.graphs = []
        const graphtable = document.body.querySelector("#graphtable")
        const origin_point = { s: new Vec2(0, 0), v: new Vec2(0, 0), a: new Vec2(0, 0), r: 0 }
        this.init = () => renderer.postCalc.push(this.update)
        this.update = () => this.graphs.forEach(g => {
            if (!g.data.custom)
                g.update(1, getValueFuctions[g.data.type](g.data.obj,
                    g.data.relativeTo === 'Origin Point' ? origin_point : getObjectByName(g.data.relativeTo)))
        })
        this.getOptions = x => engine.objs.filter(z => x != z).map(z => `<option>${z.name}</option>`).join('')
        const getValueFuctions = [
            function Displacement(x, y) { return x.s.distance(y.s) - x.r - y.r },
            function Displacement_X(x, y) { return x.s.x - y.s.x - x.r - y.r },
            function Displacement_Y(x, y) { return x.s.y - y.s.y - x.r - y.r },
            function Velocity(x, y) { return x.v.distance(y.v) },
            function Velocity_X(x, y) { return x.v.x - y.v.x },
            function Velocity_Y(x, y) { return x.v.y - y.v.y },
            function Acceleration(x, y) { return x.a.distance(y.a) },
            function Acceleration_X(x, y) { return x.a.x - y.a.x },
            function Acceleration_Y(x, y) { return x.a.y - y.a.y },
            function Kinetic_Energy(x) { return x.m * pow2(x.v.distance()) / 2 },
            function Gravitational_Energy(x) { return x.gpe },
            function Frequency(x, y) { return x.freqs[y.name] }
        ]
        const typeNames = getValueFuctions.map(f => f.name.replace('_', ' '))
        this.typeNames = typeNames
        const precision = 2
        const createFormatFunction = (x) =>
            (v, vw, minv, maxv) =>
                `${roundTo(v, precision)} ${x} (min: ${roundTo(minv, precision)} ${x} - max: ${roundTo(maxv, precision)} ${x})`
        const formatFunctions = (() => {
            let x
            return [
                x = createFormatFunction('m'), x, x,
                x = createFormatFunction(str_MS1), x, x,
                x = createFormatFunction(str_MS2), x, x,
                x = createFormatFunction('J'), x,
                createFormatFunction('Hz')
            ]
        })()
        this.oninput1 = (ev) => {
            const t = ev.target.selectedIndex
            const a = ev.target.nextSibling.nextSibling
            const b = a.nextSibling.nextSibling
            a.innerText = typeNames[t] == 'Frequency' ? 'source' : 'relative to'
            const c = ['Kinetic Energy', 'Gravitational Energy'].includes(typeNames[t]) ? 'none' : ''
            a.style.display = c
            b.style.display = c
            ev.path[2].graph.data.type = t
        }
        this.oninput2 = (ev) => ev.path[2].graph.data.relativeTo = ev.target.selectedOptions[0].innerText
        this.onclick1 = (ev) => this.deleteGraph(ev.target.parentElement.graph)
        const tr1 = '<td><select oninput="Graphs.oninput1(event)">'
            + typeNames.map(t => `<option>${t}</option>`).join('')
            + '</select><br><span>relative to</span><br><select oninput="Graphs.oninput2(event)"><option>Origin Point</option>'
        const tr2 = '</select></td><td class="graph-del" onclick="Graphs.onclick1(event)">×</td></tr>'
        this.loadGraph = (x, g) => {
            const tr = document.createElement('tr')
            tr.innerHTML = tr1 + this.getOptions(x) + tr2
            graphtable.insertBefore(tr, graphtable.lastChild)
            g.data.tr = tr
            tr.graph = g
            let a, b
            [a, b] = tr.querySelectorAll('select')
            a.value = typeNames[g.data.type]
            b.value = g.data.relativeTo
        }
        this.open = (x) => {
            while (graphtable.childNodes.length > 1)
                graphtable.removeChild(graphtable.firstChild)
            x.graphs.forEach(g => this.loadGraph(x, g))
        }
        this.addGraph = (obj, type, relativeTo) => {
            const x = obj !== undefined ? obj : ObjectMenu.obj
            const g = new Graph(0, 0, function (v, vw, minv, maxv) {
                return formatFunctions[this.data.type](v, vw, minv, maxv)
            })
            g.data.type = type !== undefined ? type : 0
            g.data.obj = x
            g.data.relativeTo = relativeTo !== undefined ? relativeTo : 'Origin Point'
            x.graphs.push(g)
            this.loadGraph(x, g)
            this.appendChild(g)
        }
        this.deleteGraph = (g) => {
            this.removeChild(g)
            if (g.data.tr)
                graphtable.removeChild(g.data.tr)
            g.data.tr.graph = null
            g.data.tr = null
            this.graphs.remove(g.data.obj.graphs)
            g.data.obj = null
        }
        this.delete = (x) => x.graphs.forEach(g => this.closeGraph(0, g));
        const graphsdiv = document.querySelector("#graphs")
        let zindex = 1
        const onclick2 = function (g, ev) {
            g.style.zIndex = zindex++
        }
        this.appendChild = (g) => {
            g.view.addEventListener('mousedown', onclick2.bind(this, g.view))
            g.view.style.zIndex = zindex++
            if (graphsdiv.hasChildNodes()) {
                const r = graphsdiv.lastChild.getBoundingClientRect()
                g.view.style.left = r.right + 'px'
            }
            graphsdiv.appendChild(g.view)
            this.graphs.push(g)
        }
        this.removeChild = (g) => {
            this.graphs.remove(g)
            g.view.removeEventListener('mousedown', onclick2)
            graphsdiv.removeChild(g.view)
        }
        this.closeGraph = (gv, gg) => {
            const g = gg !== undefined ? gg : this.graphs.find(x => x.view === gv)
            this.removeChild(g)
            if (g.data.tr) {
                if (ObjectMenu.obj === g.data.obj)
                    graphtable.removeChild(g.data.tr)
                g.data.tr.graph = null
                g.data.tr = null;
            }
            if (g.data.obj) {
                this.graphs.remove(g.data.obj.graphs)
                g.data.obj = null
            }
        }
    })()
})