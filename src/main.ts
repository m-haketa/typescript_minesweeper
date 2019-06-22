import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
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
    }
  },
  methods: {
    init: function() {
      let mineArr = []
      this.cells = []

      for (var i = 0; i < this.maxX * this.maxX; i++) {
        this.cells = Array.apply(null, {
          length: this.maxX * this.maxY
        } as any).map(function(_value: any, index: number) {
          return index
        })
      }
    }
  }
})
