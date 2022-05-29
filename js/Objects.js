


window.Objects = new (function Objects() {
    this.serializeVec2 = v => [v.x, v.y]
    this.deserializeVec2 = (v, z) => z.set(v[0], v[1])
    this.serializeGraph = g => ({
        type: g.data.type,
        relativeTo: g.data.relativeTo
    })
    this.deserializeGraph = (x, g) => Graphs.addGraph(x, g.type, g.relativeTo)
    this.serializeObject = x => ({
        name: x.name,
        s: this.serializeVec2(x.s),
        v: this.serializeVec2(x.v),
        a: this.serializeVec2(x.a),
        m: x.m,
        r: x.r,
        cor: x.cor,
        graphs: x.graphs.map(this.serializeGraph)
    })
    this.deserializeObject = x => {
        const z = new Entity(x.name, 0, 0, x.m, x.r)
        this.deserializeVec2(x.s, z.s)
        this.deserializeVec2(x.v, z.v)
        this.deserializeVec2(x.a, z.a)
        z.cor = x.cor
        z.color = randomColor()
        z.color2 = randomColor()
        if (x.graphs)
            z.graphs = x.graphs.map(this.deserializeGraph.bind(this, z))
        return z
    }
    this.getUserName = () => {
        const x = localStorage.getItem('username')
        return x !== null ? x : 'Anonymous ' + round(random() * 1e6)
    }
    this.setUserName = (x) => {
        localStorage.setItem('username', x)
        return x
    }
    this.exportToJson = () => ({
        name: prompt('Please enter name for this simulation', 'Untitled ' + round(random() * 1e6)),
        author: this.setUserName(prompt('Please enter your name', this.getUserName())),
        time: new Date(),
        settings: Settings.settings,
        objs: engine.objs.map(this.serializeObject)
    })
    this.loadFromJson = (j) => {
        Settings.settings = j.settings
        engine.objs = j.objs ? j.objs.map(this.deserializeObject) : []
        engine.onObjectsChanged()
        Settings.set('running', 0)
    }
    this.exportToFile = () => {
        const j = this.exportToJson()
        const a = document.createElement('a')
        a.download = `pixengine-${j.name}-${j.author}.json`
        a.href = URL.createObjectURL(new Blob([JSON.stringify(j)], { type: 'application/json' }))
        a.click()
    }
    this.importFromFile = e => {
        const fs = e.target.files
        if (fs && fs.length === 1) {
            var reader = new FileReader()
            reader.onload = ev => this.loadFromJson(JSON.parse(ev.target.result))
            reader.readAsText(fs[0])
        }
    }
})()

