import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const MINECHAR = '＊'

interface CellData {
  display: any
  kind: any
}

type finishStatus = 'Success' | 'Exploded' | 'Suspended' | ''

const vm = new Vue({
  el: '#app',
  data: {
    maxX: 10,
    maxY: 5,
    NumberOfMine: 5,
    initialized: false,
    finished: '' as finishStatus,
    NumberOfOpenCell: 0,
    cells: [] as CellData[],
    debugMode: false
  },

  computed: {
    fieldWidthPx: function(): string {
      return this.maxX * 31 + 'px'
    },
    maxNo: function(): number {
      return this.maxX * this.maxY
    }
  },
  methods: {
    init: function() {
      this.cells = Array.apply(null, {
        length: this.maxX * this.maxY
      } as any).map(function(_value: any, index: number) {
        return { display: '', kind: 0 }
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
      this.finished = ''
      this.NumberOfOpenCell = 0
    },

    suspend: function() {
      this.initialized = false
      this.finished = ''
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

    getStyle: function(no: number): string {
      const display = this.cells[no].display
      if (display >= 0 && display <= 8) {
        return 'a' + display
      } else {
        return 'aMine'
      }
    },

    getBgClass: function(no: number): string {
      if (this.cells[no].display === '') {
        return ''
      } else if (this.cells[no].display === MINECHAR) {
        return 'mine'
      } else {
        return 'opened'
      }
    },

    //再帰的に呼び出される。返り値がtrueのときには処理を中断する
    openCell: function(no: number): boolean {
      this.cells[no].display = this.cells[no].kind

      if (this.cells[no].kind === MINECHAR) {
        this.openAllCell()
        this.finished = 'Exploded'
        return true
      }

      //他のセルを開けても支障がない場合。※ここの条件は後で変える
      if (this.cells[no].kind === 0) {
        const cellAround = this.getCellAround(no)
        cellAround.some(
          (no): boolean => {
            //まだ開けていないセルに対して処理をする
            if (this.cells[no].display === '') {
              return this.openCell(no)
            }
            return false
          }
        )
      }

      this.NumberOfOpenCell += 1

      if (this.NumberOfOpenCell + this.NumberOfMine === this.maxNo) {
        this.openAllCell()
        this.finished = 'Success'
        return true
      }

      return false
    },

    openAllCell: function(): void {
      for (let no = 0; no < this.maxNo; no++) {
        if (this.cells[no].display === '') {
          this.openCell(no)
        }
      }
    }
  }
})
