import { Context } from "koishi"
import maichart from "./maichart"
import maisong, { song_obj } from "./maisong"

export default class {
  jsonArray: JSON[]
  list: maisong[]
  chart_list: maichart[]
  promise: Promise<any>
  constructor(ctx: Context) {
    this.promise = ctx.http("GET", "https://www.diving-fish.com/api/maimaidxprober/music_data").then(
      (response) => {
        this.jsonArray = response
        this.chart_list = []
        this.list = []
        for (var i = 0; i < this.jsonArray.length; i++) {
          var song = new maisong(this.jsonArray[i] as object as song_obj)
          for (var j = 0; j <= (song.has_rem ? 4 : 3); j++)
            this.chart_list.push(song.charts[j])
          this.list.push(song)
        }
      }
    )
  }
  id(id: number) {
    return this.filt((s: maisong) => s.id == id)[0]
  }
  filt(filter: (i: maisong) => boolean) {
    var result: maisong[] = []
    for (var i = 0; i < this.list.length; i++) {
      if (filter(this.list[i])) {
        result.push(this.list[i])
      }
    }
    return result
  }
  filt_chart(filter: (i: maichart) => boolean) {
    var result: maichart[] = []
    for (var i = 0; i < this.chart_list.length; i++) {
      if (filter(this.chart_list[i])) {
        result.push(this.chart_list[i])
      }
    }
    return result
  }
}