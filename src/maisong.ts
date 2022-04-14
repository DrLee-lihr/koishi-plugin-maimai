import { DiffieHellman } from "crypto"
import { segment } from "koishi"
import maichart, { chart_obj, difficulty } from "./maichart"



type basic_info={
  title:string,
  artist:string,
  genre:string,
  bpm:number,
  release_date:string,
  from:string,//version
  is_new:boolean
}

export type song_obj = { 
  id: string,
  title: string, 
  type: 'SD'|'DX', 
  ds:number[], 
  level: string[], 
  cids:number[], 
  charts: chart_obj[],
  basic_info:basic_info
}


export default class {
  id: number
  object: song_obj
  charts: maichart[]
  has_rem: boolean
  is_sd: boolean
  type: string
  song_info_summary: string
  song_ds_summary: string
  basic_info_summary: string
  constructor(object: song_obj) {
    this.id = parseInt(object.id)
    this.object = object
    this.has_rem = object.charts.length == 5
    this.is_sd = object.type == "SD"
    this.type = object.type
    this.song_info_summary = `${this.id}.${object.title}(${this.type})`
    var k: string[] = []
    object.ds.forEach((it: number) => k.push(it.toFixed(1)))
    this.song_ds_summary = k.join("/")
    this.basic_info_summary = [
      `artist: ${object.basic_info.artist}`, 
      `genre: ${object.basic_info.genre}`,
      `bpm: ${object.basic_info.bpm}`, 
      `version: ${object.basic_info.from}`].join("\n")
    this.charts = []
    for (var i: difficulty = 0; i < (this.has_rem ? 5 : 4); i++) {
      var chart = new maichart(object.charts[i], this, <difficulty>i)
      this.charts.push(chart)
    }
  }
  get_song_image() {
    return segment("image", { url: "https://www.diving-fish.com/covers/" + this.id + ".jpg" })
  }
}