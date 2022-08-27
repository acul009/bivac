import { ref, type Ref } from 'vue'
import type { MatcherLocationAsPath } from 'vue-router'
import restic from './restic'

export class bivac {
    private apiKey: string | null = null
    public volumes: Ref<{ [key: string]: { [key: string]: any } }> = ref({})
    public restic: restic

    constructor() {
        this.autoreload(() => this.loadVolumes())
        this.restic = new restic(this)
    }

    public setApiKey(apiKey: string): void {
        this.apiKey = apiKey
        this.loadVolumes()
    }

    private api(path: string, method: string = 'GET', body: string | object | null = null): Promise<Response> {
        //console.log('requesting: ' + path)
        const options: { [key: string]: any } = {
            method: method.toUpperCase(),
            headers: {
                Authorization: "Bearer " + this.apiKey
            }
        }
        if (body !== null) {
            options.body = body
        }
        return fetch(path, options)
    }

    private async get(path: string) {
        return await this.api(path).then(res => res.json())
    }

    private async post(path: string, body: any = null) {
        return await this.api(path, 'POST', JSON.stringify(body)).then(res => res.json())
    }

    public autoreload(handler: Function) {
        const container = {
            timer: 0,
            async reload() {
                try {
                    await handler()
                } catch (e) {
                    console.log(e)
                }
                container.timer = setTimeout(() => { container.reload(); }, 5000)
            },
            cancel() {
                clearTimeout(container.timer)
            }
        }
        container.reload()
        return container
    }

    public secondsToReadableTime(seconds: number): string {
        const roundedSeconds = seconds > 1 ? Math.round(seconds) : 1
        const minutes = Math.floor(roundedSeconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        let suffix = 'second'
        let value = roundedSeconds

        if (days > 0) {
            value = days
            suffix = 'day'
        } else if (hours > 0) {
            value = hours
            suffix = 'hour'
        } else if (minutes > 0) {
            value = minutes
            suffix = 'minute'
        }

        if (value > 1) {
            suffix += 's'
        }
        return value + ' ' + suffix
    }

    public async ping(): Promise<number> {
        const response = await this.api('/ping');
        if (response.status === 200) {
            const parsed = await response.json()
            if (typeof parsed === 'object' && typeof parsed.type === 'string' && parsed.type === 'pong') {
                return 200;
            }
            return 500;
        }
        return response.status
    }

    public async info() {
        return await this.get('/info').then(res => res.data)
    }

    public async loadVolumes() {
        if (this.apiKey !== null) {
            const volumesArray: { [key: string]: any }[] = await this.get('/volumes')
            volumesArray.sort((a, b) => {
                return a.ID.localeCompare(b.ID);
            })
            const volumes: { [key: string]: { [key: string]: any } } = {}
            for (const vol of volumesArray) {
                this.formatVolume(vol)
                volumes[vol.ID] = vol;
            }
            this.volumes.value = volumes
        }
    }

    private formatVolume(volume: { [key: string]: any }): void {
        volume.lastBackupDate = this.dateToLocal(volume.lastBackupDate)
    }

    private dateToLocal(dateString: string): string {
        const date = new Date(dateString)
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
        return date.toLocaleString()
    }

    public async backup(id: string, force: boolean = false) {
        return await this.post('/backup/' + encodeURIComponent(id) + '?force=' + JSON.stringify(force))
    }

    public async rawRestic(volume: string, command: string[]) {
        return this.post(
            '/restic/' + encodeURIComponent(volume),
            {
                cmd: command
            }
        )
    }

}

export default new bivac()