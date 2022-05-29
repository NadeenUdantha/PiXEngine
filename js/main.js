


const hideMenu = () => {
    document.querySelector('.main-explore').classList.remove('show')
    const cl = document.querySelector('div.main-menu').classList
    cl.remove('show')
    cl.add('hide')
    document.querySelector('div.main-menu').style.display = 'none'
}

const backToMainMenu = () => {
    renderer.disableEvents()
    if (ObjectMenu.isOpened())
        ObjectMenu.close()
    engine.objs.forEach(x => Graphs.delete(x))
    Settings.close()
    Settings.hide()
    Settings.set('show_names', 0)
    Settings.set('names_alpha', 0)
    document.querySelectorAll('div.main-btns div')
        .forEach(x => x.removeEventListener('click', onClickManuItem))
    const cl = document.querySelector('div.main-menu').classList
    cl.remove('hide')
    cl.remove('show')
    startIntro()
}

const hideMenuAndInit = () => {
    Settings.show()
    Settings.set('centerx', .5)
    Settings.set('centery', .5)
    hideMenu()
    renderer.enableEvents()
    clearTimeout(mainRandomTimeoutId)
    Camera.stopTrackingRandomObjects()
    Camera.jumpToScale()
}

let mainRandomTimeoutId
window.addEventListener('load', () => {
    const mainSubView = document.querySelector('.main-subview')
    window.onClickManuItem = (ev) => {
        const t = ev.target.innerText;
        if (t === 'Explore') {
            mainSubView.classList.add('show')
            document.querySelector('.main-explore').classList.add('show')
            return
        }
        else
            hideMenuAndInit()
        if (t === 'Sandbox') {
            Camera.track(null)
            renderer.removeAllObjects()
        }
        else if (t === 'Solar System') {
            Camera.smoothTrack(getObjectByName('sun'), 1000)
            setTimeout(() => Camera.track(null), 1000)
        }
        else if (t === 'Earth') {
            Camera.track(null)
            const earth = getObjectByName('earth')
            renderer.removeAllObjects()
            earth.trails = []
            earth.m = CONSTANTS.solarSystem.mass.earth * 1e24
            earth.r = CONSTANTS.solarSystem.diameter.earth * 1000 / 2
            {
                const x = .007
                earth.r *= x
                earth.m *= x * x
            }
            earth.v.set(0, 0)
            earth.s.set(0, earth.r)
            renderer.setCameraPosition(0, 0)
            renderer.addObject(earth)
            Camera.setScale(4e-6)
            Camera.smoothScaleTo(1e-2, 2000, t => t * t * t * t)
            setTimeout(() => Camera.smoothScaleTo(10, 1000, t => t * t), 2000)
        }
    }
})


const startIntro = () => {
    setTimeout(() => {
        const z = document.querySelector('div.main-menu')
        z.style.display = 'block'
        z.classList.add('show')
        setTimeout(
            () => document.querySelectorAll('div.main-btns div').forEach(
                x => x.addEventListener('click', onClickManuItem)), 2000)
    }, 3000)
    Settings.set('centerx', .55)
    Settings.set('centery', .60)
    renderer.removeAllObjects()
    const rs = [075, 15, 15, 26, 10, 19, 37, 17, 21, 16]
    const ds = [100, 27, 50, 30, 35, 46, 41, 37, 34, 20]
    let d = 0
    solarSystemObjectList.forEach((x, i) => {
        if (x != 'moon')
            renderer.addObject(new Entity(x, d, 0, CONSTANTS.solarSystem.mass[x] * 1e11, rs[i]))
                .setParams({ color: document.getElementById('img_' + x), color2: randomColor() })
        d += ds[i] * 2
    });
    solarSystemObjectList.forEach((x, i) => {
        if (x != 'moon' && x != 'sun')
            rotateAround(getObjectByName(x), getObjectByName('sun'))
    })
    for (let x = 0; x < 50; x++) {
        const z = 300 + 2000 * random()
        const t = random() * PI2
        const v = 1000 + 2000 * random()
        renderer.addObject(new Entity('zobj_' + x, z * cos(t), z * sin(t), 1, 20 + 50 * random()))
            .setParams({ color: randomColor(), color2: randomColor(), collision: false })
            .v.set(v * cos(t), v * sin(t))
    }
    renderer.trails_skip = 3
    renderer.trails_scale = .9
    Camera.setScale(1e-5)
    Camera.smoothScaleTo(.8, 6000, t => t * t * t)
    setTimeout(() => {
        engine.objs = engine.objs.filter(x => !x.name.startsWith('zobj_'))
        engine.objs.forEach(x => x.showa = true)
        engine.onObjectsChanged()
    }, 4000)
    setTimeout(() => {
        let a = performance.now() + 1500
        Settings.set('show_names', 1)
        Settings.set('names_alpha', 0)
        const pr = () => {
            const z = performance.now()
            if (a > z) {
                renderer.trails_scale = mapToRange(a - z, 0, 1500, .1, .9)
                const zz = mapToRange(a - z, 0, 1500, 1, 0)
                Settings.set('names_alpha', zz)
                Settings.set('showvaF_alpha', zz)
            }
            else
                renderer.preRender.remove(pr)
        }
        renderer.preRender.push(pr)
    }, 4000)
    Camera.track(getObjectByName('earth'))
    mainRandomTimeoutId = setTimeout(Camera.trackRandomObjects.bind(Camera, 3000, 2000), 7000)
}






