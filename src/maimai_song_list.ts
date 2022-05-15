import { Context } from 'koishi'
import maichart, { chart_stats } from './maichart'
import maisong, { song_obj } from './maisong'

export default class maimai_song_list {
  public list: maisong[]
  public chart_list: maichart[] = []
  public promise: Promise<void>
  private jsonArray: song_obj[]

  public constructor(ctx: Context) {
    this.promise = Promise.all([
      ctx.http('GET', 'https://www.diving-fish.com/api/maimaidxprober/music_data'),
      ctx.http('GET', 'https://www.diving-fish.com/api/maimaidxprober/chart_stats'),
    ]).then(
      ([response_1, response_2]) => {
        this.jsonArray = response_1
        this.list = this.jsonArray.map((i) => new maisong(i, (response_2 as chart_stats)[i.id]))
        this.list.forEach((i) => i.charts.forEach((v) => this.chart_list.push(v)))
      }
    )
  }

  public id(id: number | string) {
    let num_id: number
    if (typeof id === 'string') num_id = Number.parseInt(id, 10)
    else num_id = id
    const res = this.filter((s: maisong) => s.id === num_id)
    return res[0]
  }

  public filter(filter: (i: maisong) => boolean) {
    return this.list.filter(filter)
  }

  public filter_chart(filter: (i: maichart) => boolean) {
    return this.chart_list.filter(filter)
  }
}
