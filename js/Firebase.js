



window.addEventListener('load', () => {
    window.Firebase = new (function Firebase() {
        const rooturl = 'https://nadeenpixengine.firebaseio.com'
        const request = (method, path, opt) => {
            return fetch(rooturl + path, Object.assign({ method: method }, opt))
        }
        const results = document.querySelector('.firebase-search-results')
        this.last = {}
        this.open = k => {
            hideMenuAndInit()
            Camera.track(null)
            console.log(k,this.last,this.last[k])
            Objects.loadFromJson(this.last[k])
        }
        this.upload = () => {
            request('POST', '/.json', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Objects.exportToJson())
            }).then(x => alert('Upload completed!'))
        }
        this.search = x => {
            request('GET', x ? `/.json?orderBy="n"&startAt="${x}"&endAt="${x}\\uf8ff"` : '/.json?orderBy="n"&limitTolast=100')
                .then(res => res.json())
                .then(j => {
                    this.last = j
                    let z = ''
                    for (const k in j)
                        if (j.hasOwnProperty(k)) {
                            const v = j[k]
                            z += `<div onclick="Firebase.open('${k}')"><b>${v.name}</b> by <i>${v.author}</i> @${new Date(v.time).toLocaleString()} <small>${v.objs.length} objects</small></div>`
                        }
                    results.innerHTML = z
                })
        }
    })()
})
