








window.addEventListener('load', () => {
    window.ObjectMenu2 = new (function ObjectMenu2() {
        const list = document.querySelector('.ObjectMenu3')
        const objselect = document.querySelector('#tracing-obj')
        const objselect2 = document.querySelector('#receiver-obj')
        this.trackObjChange = () => {
            if (objselect.selectedOptions.length === 0) {
                objselect.value === 'None'
                Camera.track(null)
            }
            else if (objselect.value === 'None')
                Camera.track(null)
            else {
                if (objselect.value === 'Random')
                    Camera.trackRandomObjects(3000, 1500)
                else {
                    const z = getObjectByName(objselect.value)
                    Camera.stopTrackingRandomObjects()
                    if (z != Camera.trackingObj)
                        Camera.smoothTrack(z, 2000)
                }
            }
        }
        this.update = () => {
            const s = objselect.selectedOptions.length === 1 ? objselect.value : null
            const s2 = objselect2.selectedOptions.length === 1 ? objselect2.value : null
            const objz = engine.objs.map(x => `<option>${x.name}</option>`).join('')
            objselect.innerHTML = '<option>None</option><option>Random</option>' + objz
            objselect2.innerHTML = objz
            objselect.value = s
            objselect2.value = s2
            this.trackObjChange()
            list.innerHTML = engine.objs.map(
                x =>
                    `<div onmouseover="ObjectMenu2.onmouseover(event)" onmouseout="ObjectMenu2.onmouseout(event)" onclick="ObjectMenu2.onclick2(event)"><span>`
                    + `${x.name}</span><input type="checkbox" onchange="ObjectMenu2.onchange(event,0)"${x.showv ? ' checked' : ''}><input type="checkbox" onchange="ObjectMenu2.onchange(event,1)"${x.showa ? ' checked' : ''}><input type="checkbox" onchange="ObjectMenu2.onchange(event,2)"${x.showF ? ' checked' : ''}><span class="objmenu3-del" onclick="ObjectMenu2.onclick(event)">delete</span></div>`
            ).join('')
        }
        {
            const xnames = 'vaF'.split('').map(x => 'show' + x)
            this.onchange = (e, n) =>
                getObjectByName(e.target.parentElement.children[0].innerText)[xnames[n]] = e.target.checked
        }
        this.onmouseover = e => {
            Settings.set('selected_obj', getObjectByName(
                e.target.tagName === 'DIV' ? e.target.children[0].innerText : e.target.parentElement.children[0].innerText
            ))
        }
        this.onmouseout = e => {
            if (e.target.tagName === 'DIV')
                Settings.set('selected_obj', null)
        }
        this.onclick = ev => {
            const x = ev.target.parentElement.children[0].innerText
            console.log(ev, x)
            engine.objs = engine.objs.filter(z => z.name != x)
            engine.onObjectsChanged()
        }
        this.onclick2 = ev => {
            if (ev.target.children.length > 0) {
                objselect.value = ev.target.children[0].innerText
                this.trackObjChange()
            }
        }
    })()
})


