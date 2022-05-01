import { Context } from "koishi"
import maichart, { chart_stats } from "./maichart"
import maisong, { song_obj } from "./maisong"

export default class {
  jsonArray: song_obj[]
  list: maisong[]
  chart_list: maichart[]=[]
  promise: Promise<any>
  constructor(ctx: Context) {
    this.promise = Promise.all([
      ctx.http("GET", "https://www.diving-fish.com/api/maimaidxprober/music_data"),
      ctx.http('GET', 'https://www.diving-fish.com/api/maimaidxprober/chart_stats')
    ]).then(
      ([response_1,response_2]) => {
        this.jsonArray = response_1
        this.list=this.jsonArray.map((i)=>new maisong(i,(response_2 as chart_stats)[i.id]))
        this.list.forEach((i)=>i.charts.forEach(v=>this.chart_list.push(v)))
      }
    )
  }
  id(id: number|string) {
    if(typeof id=='string')id=Number.parseInt(id)
    return this.filter((s: maisong) => s.id == id)[0]
  }
  filter(filter: (i: maisong) => boolean){
    return this.list.filter(filter)
  }
  filter_chart(filter: (i: maichart) => boolean) {
    return this.chart_list.filter(filter)
  }
}