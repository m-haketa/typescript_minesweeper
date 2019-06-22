import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const MINECHAR = '＊'

interface CellData {
  display: any
  kind: any
  marked: boolean
}

interface CellAttrData {
  style: string
  bgClass: string
}

interface CellAttr {
  [cellKind: string]: CellAttrData
}

const CELLATTR = {
  '0': { style: 'a0', bgClass: 'bgopened' },
  '1': { style: 'a1', bgClass: 'bgopened' },
  '2': { style: 'a2', bgClass: 'bgopened' },
  '3': { style: 'a3', bgClass: 'bgopened' },
  '4': { style: 'a4', bgClass: 'bgopened' },
  '5': { style: 'a5', bgClass: 'bgopened' },
  '6': { style: 'a6', bgClass: 'bgopened' },
  '7': { style: 'a7', bgClass: 'bgopened' },
  '8': { style: 'a8', bgClass: 'bgopened' },
  '＊': { style: 'amine', bgClass: 'bgmine' }
} as CellAttr

interface ClassObject {
  [key: string]: boolean
}

const vm = new Vue({
  el: '#app',
  data: {
    maxX: 10,
    maxY: 5,
    NumberOfMine: 5,
    FlagSet: 0,
    initialized: false,
    finished: false,
    NumberOfOpenCell: 0,
    cells: [] as CellData[],
    debugMode: false,
    startTimeSerial: 0,
    elapsedTime: 0
  },

  computed: {
    fieldWidthPx: function(): string {
      return this.maxX * 31 + 'px'
    },
    maxNo: function(): number {
      return this.maxX * this.maxY
    },
    mineRemained: function(): number {
      return this.NumberOfMine - this.FlagSet
    }
  },
  methods: {
    init: function() {
      this.cells = Array.apply(null, {
        length: this.maxX * this.maxY
      } as any).map(function(_value: any, index: number) {
        return { display: '', kind: 0, marked: false }
      })

      //地雷をセット
      for (let no = 0; no < this.NumberOfMine; no++) {
        this.cells[no].kind = MINECHAR
      }

      const _ = require('underscore')

      //地雷をシャッフル
      this.cells = _.shuffle(this.cells)

      //周りにある地雷をカウント
      for (let no = 0; no < this.maxNo; no++) {
        if (this.cells[no].kind === MINECHAR) {
          //地雷マスの周りのセルに1を足す
          const cellAround = this.getCellAround(no)

          // 地雷マスをfilterで除き、それ以外のセルに1を足していく
          cellAround
            .filter(
              (no): boolean => {
                return this.cells[no].kind !== MINECHAR
              }
            )
            .forEach(
              (no): void => {
                this.cells[no].kind += 1
              }
            )
        }
      }
      this.initialized = true
      this.finished = false
      this.NumberOfOpenCell = 0
      this.startTimeSerial = new Date().getTime()
      this.elapsedTime = 0

      setTimeout(this.getElapsedTime, 500)
    },

    getElapsedTime: function(): void {
      if (this.finished) {
        return
      }

      this.elapsedTime = Math.floor(
        (new Date().getTime() - this.startTimeSerial) / 1000
      )

      setTimeout(this.getElapsedTime, 500)
    },

    suspend: function() {
      this.initialized = false
      this.finished = true
    },

    getCellAround: function(no: number): number[] {
      //上下は、無条件に追加（範囲外チェックは後で行う）
      let cellAround = [no - this.maxX, no + this.maxX] as number[]

      //一番左の列でなければ、左上、左、左下を追加
      if (no % this.maxX !== 0) {
        cellAround.push(no - this.maxX - 1, no - 1, no + this.maxX - 1)
      }

      //一番右の列でなければ、右上、右、右下を追加
      if (no % this.maxX !== this.maxX - 1) {
        cellAround.push(no - this.maxX + 1, no + 1, no + this.maxX + 1)
      }

      //範囲外チェック
      cellAround = cellAround.filter(
        (no: number): boolean => {
          return no >= 0 && no < this.maxNo
        }
      )

      return cellAround
    },

    getStyle: function(no: number): ClassObject {
      let ret = {} as ClassObject

      //0～9と＊の表示
      const display = String(this.cells[no].display)
      if (display !== '') {
        ret[CELLATTR[display].style] = true
      }

      if (this.cells[no].marked === true) {
        ret.amarked = true
      }
      return ret
    },

    //再帰的に呼び出される。返り値がtrueのときには処理を中断する
    openCell: function(no: number, allOpen: boolean = false): boolean {
      if (this.cells[no].marked === true && !allOpen) {
        return false
      }

      this.cells[no].display = this.cells[no].kind

      if (allOpen) {
        return true
      }

      if (this.cells[no].kind === MINECHAR) {
        this.openAllCell()
        this.finished = true
        return true
      }

      //他のセルを開けても支障がない場合。※ここの条件は後で変える
      if (this.cells[no].kind === 0) {
        const cellAround = this.getCellAround(no)
        cellAround.some(
          (no): boolean => {
            //まだ開けていないセルに対して処理をする
            if (this.cells[no].display === '') {
              return this.openCell(no, allOpen)
            }
            return false
          }
        )
      }

      this.NumberOfOpenCell += 1
      this.checkFinished()

      return false
    },

    markCell: function(no: number): void {
      if (this.cells[no].display !== '') {
        return
      }

      this.cells[no].marked = !this.cells[no].marked
      if (this.cells[no].marked) {
        this.FlagSet++
      } else {
        this.FlagSet--
      }

      this.checkFinished()
    },

    openAllCell: function(): void {
      for (let no = 0; no < this.maxNo; no++) {
        if (this.cells[no].display === '') {
          this.openCell(no, true)
        }
      }
    },

    checkFinished: function(): void {
      if (
        this.mineRemained === 0 &&
        this.NumberOfOpenCell + this.NumberOfMine === this.maxNo
      ) {
        this.finished = true
        window.confirm(
          `おめでとうございます！経過時間は${this.elapsedTime}秒です`
        )
      }
    }
  }
})
