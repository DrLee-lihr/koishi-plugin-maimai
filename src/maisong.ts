import { segment } from 'koishi'
import maichart, { chart_obj, chart_stat, difficulty, song_stat } from './maichart'

interface basic_info {
  title: string,
  artist: string,
  genre: string,
  bpm: number,
  release_date: string,
  /**
   * 曲目版本
   */
  from: string,
  is_new: boolean
}

export interface song_obj {
  id: string,
  title: string,
  type: 'SD' | 'DX',
  ds: number[],
  level: string[],
  cids: number[],
  charts: chart_obj[],
  basic_info: basic_info
}

export default class maisong {
  public id: number
  public object: song_obj
  public charts: maichart[]
  public has_rem: boolean
  public is_sd: boolean
  public type: string
  public song_info_summary: string
  public song_ds_summary: string
  public basic_info_summary: string
  public constructor(object: song_obj, stat: song_stat) {
    this.id = parseInt(object.id)
    this.object = object
    this.has_rem = object.charts.length === 5
    this.is_sd = object.type === 'SD'
    this.type = object.type
    this.song_info_summary = `${this.id}.${object.title}(${this.type})`
    this.song_ds_summary = object.ds.map((i) => i.toFixed(1)).join('/')
    this.basic_info_summary = [
      `artist: ${object.basic_info.artist}`,
      `genre: ${object.basic_info.genre}`,
      `bpm: ${object.basic_info.bpm}`,
      `version: ${object.basic_info.from}`].join('\n')
    this.charts = object.charts.map(
      (element, index) => new maichart(element, this, index as difficulty, stat[index] as chart_stat))
  }

  public get_song_image() {
    return segment('image', { url: 'https://www.diving-fish.com/covers/' + this.id + '.jpg' })
  }
}
