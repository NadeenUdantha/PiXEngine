




window.addEventListener('load', () => {
    window.Camera = new (function Camera() {
        {
            let trackingObj = null
            let trackanim = { valid: false }
            const scaleanim = { valid: false }
            const tmpvec = new Vec2()
            this.getTrackingObject = () => trackingObj
            this.init = () => renderer.preRender.push(() => {
                if (trackingObj) {
                    if (trackanim.valid) {
                        const t = performance.now() - trackanim.start
                        if (t > trackanim.time)
                            trackanim.valid = false
                        else {
                            renderer.getCameraPosition(tmpvec)
                            const tt = 60 / trackanim.time * t / 100
                            tmpvec.x += (trackingObj.s.x - tmpvec.x) * tt
                            tmpvec.y += (trackingObj.s.y - tmpvec.y) * tt
                            renderer.setCameraPosition(tmpvec.x, tmpvec.y)
                        }
                    }
                    else
                        renderer.setCameraPosition(trackingObj.s.x, trackingObj.s.y)
                }
                if (scaleanim.valid) {
                    const t = performance.now() - scaleanim.start
                    if (t > scaleanim.time)
                        scaleanim.valid = false
                    else
                        renderer.scale = mapToRange(scaleanim.timing(t / scaleanim.time), 0, 1, scaleanim.from, scaleanim.to)
                }
            })
            this.track = x => {
                this.stopTrackingRandomObjects()
                trackingObj = x, trackanim.valid = false
            }
            this.smoothTrack = (x, time) => {
                trackingObj = x
                trackanim.time = time
                trackanim.start = performance.now()
                trackanim.valid = true
                this.smoothScaleTo(20 / x.r, time * .5, t => t * t * t)
            }
            this.randomObjectsTrackId = null
            this.trackRandomObjects = (t1, t2) => {
                this.stopTrackingRandomObjects()
                let z = () => this.smoothTrack(engine.objs[floor(random() * engine.objs.length)], t2)
                this.randomObjectsTrackId = setInterval(z, t1)
                z()
            }
            this.stopTrackingRandomObjects = () => {
                if (this.randomObjectsTrackId !== null) {
                    clearInterval(this.randomObjectsTrackId)
                    this.randomObjectsTrackId = null
                    this.track(null)
                }
            }
            this.setScale = (scale) => {
                scaleanim.valid = false
                renderer.scale = scale
            }
            this.jumpToScale = () => {
                if (scaleanim.valid)
                    this.setScale(scaleanim.to)
            }
            this.smoothScaleTo = (scale, time, timing) => {
                scaleanim.from = renderer.scale
                scaleanim.to = scale
                scaleanim.time = time
                scaleanim.timing = timing
                scaleanim.start = performance.now()
                scaleanim.t = 0
                scaleanim.valid = true
            }
        }
    })()
})





