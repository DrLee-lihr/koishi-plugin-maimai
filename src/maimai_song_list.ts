import { Context } from "koishi"
import maichart from "./maichart"
import maisong, { song_obj } from "./maisong"

export default class {
  jsonArray: song_obj[]
  list: maisong[]
  chart_list: maichart[]=[]
  promise: Promise<any>
  constructor(ctx: Context) {
    this.promise = ctx.http("GET", "https://www.diving-fish.com/api/maimaidxprober/music_data").then(
      (response) => {
        this.jsonArray = response
        this.list = this.jsonArray.map((i)=>new maisong(i))
        this.list.forEach((i)=>i.charts.forEach((v)=>{this.chart_list.push(v)}))
      }
    )
  }
  id(id: number) {
    return this.filt((s: maisong) => s.id == id)[0]
  }
  filt(filter: (i: maisong) => boolean){
    return this.list.filter(filter)
  }
  filt_chart(filter: (i: maichart) => boolean) {
    return this.chart_list.filter(filter)
  }
}