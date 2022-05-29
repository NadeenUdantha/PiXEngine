

window.AudioPlayer = new (function AudioPlayer() {
    const ctx = new AudioContext()
    const resumeContext = () => {
        if (ctx.state === 'suspended')
            ctx.resume()
    }
    const sources = {}
    const addObjectSound = (x) => {
        const z = ctx.createOscillator()
        const g = ctx.createGain()
        g.gain.setValueAtTime(1, ctx.currentTime)
        sources[x.name] = { o: z, g: g, gv: 1 }
        z.type = 'sine'
        if (isInFreqRange(x.freq))
            z.frequency.setValueAtTime(x.freq, ctx.currentTime)
        z.connect(g)
        g.connect(ctx.destination)
        z.start()
    }
    const removeObjectSound = (x) => {
        const s = sources[x.name]
        s.o.stop()
        s.o.disconnect()
        s.g.stop()
        s.g.disconnect()
        delete sources[x.name]
    }
    this.setGain = (x, g) => {
        if (sources[x.name])
            sources[x.name].gv = g
    }
    this.setFrequency = (x, f) => {
        if (sources[x.name] && isInFreqRange(f))
            sources[x.name].o.frequency.setValueAtTime(f, ctx.currentTime)
    }
    this.init = () => {
        engine.onObjectsChange.push(() => {
            const ns = engine.objs.map(x => x.name)
            Object.keys(sources).forEach(x => {
                if (!ns.includes(x))
                    removeObjectSound({ name: x })
            })
        })
        renderer.postCalc.push((dt) => {
            const t = performance.now()
            const freqz_max = Settings.get('freqz_max') - 1
            const sound_speed = Settings.get('sound_speed')
            engine.objs.forEach(x => {
                if (x.freq > 0) {
                    x.freqz.forEach(f => f[2] += (sound_speed / x.freq) * 100 * dt)
                    if (x.freqn === 0) {
                        addObjectSound(x)
                        x.freqn = t
                    }
                    if (isInFreqRange(x.freq))
                        sources[x.name].o.frequency.setValueAtTime(x.freq, ctx.currentTime + dt)
                    if (x.freqn <= t) {
                        x.freqn = t + 300
                        if (x.freqz.length >= freqz_max)
                            x.freqz.splice(0, x.freqz.length - freqz_max)
                        x.freqz.push([x.s.x, x.s.y, x.r])
                    }
                } else if (x.freqz.length > 0) {
                    if (x.freqn === 0) {
                        removeObjectSound(x)
                        x.freqn = t
                    }
                    if (x.freqn <= t) {
                        x.freqn = t + 300
                        x.freqz.splice(0, 1)
                    }
                }
            })
            let x = Settings.get('receiver')
            if (x) {
                x = getObjectByName(x)
                engine.objs.forEach(y => {
                    if (x !== y && y.freq > 0) {
                        const t = atan2(x.s.y - y.s.y, x.s.x - y.s.x)
                        const vr = x.v.x * cos(t) + x.v.y * sin(t)
                        const vs = y.v.x * cos(t) + y.v.y * sin(t)
                        const f2 = y.freq * (sound_speed + vr) / (sound_speed - vs)
                        x.freqs[y.name] = f2
                        const s = sources[y.name]
                        s.g.gain.setTargetAtTime(s.gv / pow2(x.s.distance(y.s)), ctx.currentTime, dt)
                        if (isInFreqRange(f2))
                            s.o.frequency.setTargetAtTime(f2, ctx.currentTime, dt)
                    }
                })
            }
        })
    }
    const isInFreqRange = (f) => f > 0 && f < 24000
    const buffers = {}
    this.load = (path, name, onload) => {
        FileLoader.loadAsync(path, (path, data) =>
            ctx.decodeAudioData(data, function (buf) {
                buffers[name] = buf
                if (onload)
                    onload()
            }), undefined, 'arraybuffer')
    }
    this.play = (name) => {
        resumeContext()
        const src = ctx.createBufferSource()
        src.buffer = buffers[name]
        src.connect(ctx.destination)
        src.start(0)
    }
})()














