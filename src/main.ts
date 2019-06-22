import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

const vm = new Vue({
  el: '#app',
  data: {
    maxX: 10,
    maxY: 5,
    NumberOfMine: 5,
    cells: [] as any[]
  },
  computed: {
    initialized: function() {
      return this.cells.length > 0
    },
    fieldWidthPx: function() {
      return this.maxX * 30 + 25 + 'px'
    }
  },
  methods: {
    init: function() {
      this.cells = Array.apply(null, {
        length: this.maxX * this.maxY
      } as any).map(function(_value: any, index: number) {
        return { display: '*', kind: '' }
      })
    }
  }
})
