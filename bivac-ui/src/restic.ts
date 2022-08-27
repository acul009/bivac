import type { bivac } from "./bivac";



export default class restic {

    private bivac: bivac

    constructor(bivac: bivac) {
        this.bivac = bivac
    }

    public async stats(volume: string) {
        const res = await this.bivac.rawRestic(volume, ['stats'])
        if (res.type !== 'success') {
            return {}
        }
        const lines = atob(res.data).split("\n").slice(2, -1).map((line) => {
            return line.split(':').map((element) => {
                return element.trim()
            })
        })
        const stats: { [key: string]: string } = {}
        for(const parsedLine of lines) {
            stats[parsedLine[0]] = parsedLine[1]
        }
        return stats
    }

    private async table(volume: string, command: string[]): Promise<{[key:string]: string}[]> {
        const res = await this.bivac.rawRestic(volume, command)
        if (res.type !== 'success') {
            return []
        }
        const lines = atob(res.data).split("\n").map((line) => {
            return line.split('  ').filter((element) => {
                return element.length > 0
            })
        })
        console.log(lines)
        const header = lines[0]
        const data = lines.slice(2,-3)
        const table: {[key:string]: string}[] = []
        for(const item of data) {
            const row: {[key:string]: string} = {}
            for(const [index,col] of header.entries()) {
                row[col] = item[index]
            }
            table.push(row)
        }
        return table
    }

    public async snapshots(volume: string) {
        return this.table(volume, ['snapshots'])
    }

}