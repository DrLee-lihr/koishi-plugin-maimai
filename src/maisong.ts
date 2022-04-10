import { segment } from "koishi"
import maichart from "./maichart"



export default class {
  id: number
  object: JSON
  charts: maichart[]
  has_rem: boolean
  is_sd: boolean
  type: string
  song_info_summary: string
  song_ds_summary: string
  basic_info_summary: string
  constructor(object: JSON) {
    this.id = object["id"]
    this.object = object
    this.has_rem = object["charts"].length == 5
    this.is_sd = object["type"] == "SD"
    this.type = object["type"]
    this.song_info_summary = `${this.id}.${object["title"]}(${this.type})`
    var k: string[] = []
    object["ds"].forEach((it: number) => k.push(it.toFixed(1)))
    this.song_ds_summary = k.join("/")
    this.basic_info_summary = [`artist: ${this.object["basic_info"]["artist"]}`, `genre: ${this.object["basic_info"]["genre"]}`,
    `bpm: ${this.object["basic_info"]["bpm"]}`, `version: ${this.object["basic_info"]["from"]}`].join("\n")
    this.charts = []
    for (var i = 0; i < object["charts"].length; i++) {
      var chart = new maichart(object["charts"][i], this, i)
      this.charts.push(chart)
    }
  }
  get_song_image() {
    return segment("image", { url: "https://www.diving-fish.com/covers/" + this.id + ".jpg" })
  }
}