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

export default class maisong implements song_obj {
  public id: string
  public title: string
  public type: 'SD'|'DX'
  public ds: number[]
  public level: string[]
  public cids: number[]
  public charts: maichart[]
  public basic_info: basic_info

  public has_rem: boolean
  public is_sd: boolean

  public song_info_summary: string
  public song_ds_summary: string
  public basic_info_summary: string

  public constructor(object: song_obj, stat: song_stat) {
    this.id = object.id
    this.title = object.title
    this.type = object.type
    this.ds = object.ds
    this.level = object.level
    this.cids = object.cids
    this.basic_info = object.basic_info

    this.has_rem = object.charts.length === 5
    this.is_sd = object.type === 'SD'

    this.song_info_summary = `${this.id}.${this.title}(${this.type})`
    this.song_ds_summary = object.ds.map((i) => i.toFixed(1)).join('/')
    this.basic_info_summary = [
      `artist: ${object.basic_info.artist}`,
      `genre: ${object.basic_info.genre}`,
      `bpm: ${object.basic_info.bpm}`,
      `version: ${object.basic_info.from}`].join('\n')

    // chart 初始化放在最后 是因为 chart 的构造函数会用到 song 前面处理的参数
    this.charts = object.charts.map(
      (element, index) => new maichart(element, this, index as difficulty, stat[index] as chart_stat),
    )
  }

  public get_song_image() {
    return segment('image', { url: `https://www.diving-fish.com/covers/${this.id}.jpg` })
  }
}
