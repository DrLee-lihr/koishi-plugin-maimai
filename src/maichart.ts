import maisong from './maisong'
import { difficulty_name, difficulty_full_name, level_transform } from './mai_tool'

export type difficulty = 0 | 1 | 2 | 3 | 4

export interface chart_obj {
  notes: number[],
  charter: string
}

export interface chart_stat {
  count: number,
  avg: number,
  sssp_count: number,
  tag: 'Very Easy' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard',
  v: number,
  t: number
}
export type song_stat = [chart_stat, chart_stat, chart_stat, chart_stat, chart_stat | {}]
export interface chart_stats {
  [k: number]: song_stat
}

export default class maichart {
  public song: maisong
  public object: chart_obj
  public difficulty: difficulty
  public ds: number
  public chart_summary: string
  public base_summary: string
  public chart_summary_with_base: string
  public note_summary: string
  public stat:chart_stat
  public stat_summary:string
  public constructor (object: chart_obj, song: maisong, difficulty: difficulty, stat:chart_stat) {
    this.object = object
    this.song = song
    this.difficulty = difficulty
    this.ds = song.object.ds[difficulty]
    this.chart_summary = `${song.song_info_summary}[${difficulty_name[difficulty]}]`
    this.chart_summary_with_base = `${this.chart_summary}(${this.ds.toFixed(1)})`
    this.base_summary = `${difficulty_full_name[difficulty]} ${level_transform(this.ds)}(${this.ds.toFixed(1)})`

    const note_list = [`TAP: ${object.notes[0]}`, `HOLD: ${object.notes[1]}`,
    `SLIDE: ${object.notes[2]}`]
    note_list.push(`${song.is_sd ? 'BREAK' : 'TOUCH'}: ${object.notes[3]}`)
    if (!song.is_sd) note_list.push(`BREAK: ${object.notes[4]}`)
    note_list.push(`charter: ${object.charter}`)

    this.note_summary = note_list.join('\n')

    this.stat = stat
    this.stat_summary = [
      `tag:${stat.tag}`,
      `共有${stat.count}名玩家游玩了该谱面，平均达成率：${stat.avg}`,
      `其中${stat.sssp_count}人（${Math.floor((stat.sssp_count / stat.count) * 10000) / 100}%）达成 SSS`,
      `SSS人数在同级别曲目中排名：（${stat.v + 1}/${stat.t}）`
    ].join('\n')
  }
}
