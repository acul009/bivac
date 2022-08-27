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
        const lines = atob(res.data).split("\n")
        let headerLine = lines[0]

        const indices = this.getIndicesFromHeader(headerLine)
        const parsedHeader = this.splitUsingIndices(headerLine, indices)

        const data = lines.slice(2,-3).map((line) => {
            return this.splitUsingIndices(line, indices)
        })

        const table: {[key:string]: string}[] = []
        for(const item of data) {
            const row: {[key:string]: string} = {}
            for(const [index,col] of parsedHeader.entries()) {
                row[col] = typeof item[index] === 'undefined' ? '' : item[index]
            }
            table.push(row)
        }
        return table
    }

    private getIndicesFromHeader(header: string) {
        let searchStart = 0
        const colsIndex: number[] = []
        while (searchStart >= 0) {
            let colStart: number = searchStart
            while (colStart < header.length) {
                if(header.charAt(colStart++) !== ' ') {
                    break
                }
            }
            colsIndex.push(colStart -1)
            searchStart = header.indexOf('  ', colStart)
        }
        return colsIndex
    }

    private splitUsingIndices(line: string, indices: number[]) {
        const cols = []
        for(let i = 0; i < indices.length - 1; i++) {
            cols.push(line.substring(indices[i], indices[i+1]))
        }
        cols.push(line.substring(indices[indices.length-1]))
        return cols.map((col) => {
            return col.trim()
        })
    }

    public async snapshots(volume: string) {
        return this.table(volume, ['snapshots'])
    }

}