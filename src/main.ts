import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const MINECHAR = '＊'

interface CellData {
  display: string
  kind: any
}

const vm = new Vue({
  el: '#app',
  data: {
    maxX: 10,
    maxY: 5,
    NumberOfMine: 5,
    initialized: false,
    cells: [] as CellData[]
  },
  computed: {
    fieldWidthPx: function(): string {
      return this.maxX * 30 + 25 + 'px'
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
        //後で配列をShuffleするため、ここでのindexは仮。
        //後でindexを振り直す
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
    },

    end: function() {
      this.initialized = false
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

      console.log(cellAround)

      return cellAround
    },
    openCell: function(no: number): void {
      this.cells[no].display = this.cells[no].kind
    }
  }
})
