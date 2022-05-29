



window.addEventListener('load', () => {
    window.Settings = new (function Settings() {
        this.settings = {}
        this.set = (k, v) => this.settings[k] = v
        this.get = (k) => this.settings[k]
        this.reset = () => {
            this.settings = {
                simulation_speed: 1,
                G: CONSTANTS.G,
                show_names: 0,
                names_alpha: 0,
                editor_mode: 1,
                running: 0,
                selected_obj: null,
                showvaF_alpha: 0,
                centerx: 1 / 2,
                centery: 1 / 2,
                listener_obj: null,
                freqz_max: 20,
                sound_speed: 340
            }
        }
        const settingsdiv = document.querySelector('.settings')
        const settingsbtn = document.querySelector('.settings-btn')
        settingsbtn.addEventListener('click', () => {
            if (this.isOpened())
                this.close()
            else
                this.open()
        })
        document.querySelectorAll('.settings div input')
            .forEach(x => x.addEventListener('input',
                () => this.set(x.name,
                    x.type === 'number' ? x.valueAsNumber : (x.type === 'checkbox' ? x.checked : x.value)
                )))
        this.isOpened = () => settingsbtn.classList.contains('open')
        this.show = () => settingsbtn.classList.add('show')
        this.hide = () => settingsbtn.classList.remove('show')
        this.open = () => {
            settingsbtn.innerText = '≫';
            settingsbtn.classList.add('open')
            settingsdiv.classList.add('open')
            ObjectMenu2.update()
            engine.onObjectsChange.push(ObjectMenu2.update)
        }
        this.close = () => {
            settingsbtn.innerText = '≪';
            settingsbtn.classList.remove('open')
            settingsdiv.classList.remove('open')
            engine.onObjectsChange.remove(ObjectMenu2.update)
        }
    })()
})
