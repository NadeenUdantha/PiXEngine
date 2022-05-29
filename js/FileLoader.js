


window.FileLoader = new (function FileLoader() {
    this.loadAsync = (path, load, progress, type) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', path, 1)
        xhr.responseType = type === undefined ? 'blob' : type
        xhr.addEventListener('loadend', (ev) => load(path, xhr.response, xhr, ev))
        if (progress !== undefined)
            xhr.addEventListener('progress', (ev) => progress(path, ev.total, ev.loaded, xhr, ev))
        xhr.send()
        return xhr
    }
    this.loadAllAsync = (paths, load, progress) => {
        let n = paths.length
        paths.forEach(path => {
            this.loadAsync(path, (path, data) => {
                load(path, data)
                if (--n === 0)
                    load()
            }, progress)
        });
    }
})()

