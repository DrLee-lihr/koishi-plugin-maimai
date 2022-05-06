import { Context } from 'koishi'
import { Config, maisonglist } from '..'
import maichart from '../maichart'
import maisong from '../maisong'
import { get_difficulty_id, page_split } from '../mai_tool'

export default function cmd_info (ctx: Context, config: Config) {
  ctx.command('maimai <id:number> [diff:string] 根据id或难度查询乐曲或谱面信息。')
    .action(async (_, id, diff) => {
      const song = maisonglist.id(id)
      if (song === undefined) {
        return '未找到乐曲。'
      }
      else if (diff === undefined) {
        return [song.song_info_summary, song.get_song_image(), song.song_ds_summary, song.basic_info_summary].join('\n')
      }
      else {
        const chart:maichart = song.charts[get_difficulty_id(diff)]
        const k = [song.song_info_summary,
          song.get_song_image(), chart.base_summary, chart.note_summary, chart.stat_summary]
        return k.join('\n')
      }
    })
    .alias('m')

  ctx.command('maimai')
    .subcommand('.filter <filter:string> 根据给出的过滤器过滤曲目。', { authority: 3 })
    .option('page', '-p <page:number>', { fallback: 1 })
    .action(({ options }, filter) => {
      let list: maisong[]
      try {
        // eslint-disable-next-line no-eval
        list = maisonglist.filter(eval(filter))
      }
      catch (e) { return e.message }
      if (list.length === 0) return '未找到结果。'
      return page_split(list.map((i) => i.song_info_summary), config, options.page)
    })

  ctx.command('maimai')
    .subcommand('.base <base:number> 根据给出的定数查找曲目。')
    .action((_, base) =>
      maisonglist.filter_chart((chart) => chart.ds === base)
        .map(element => element.chart_summary_with_base).join('\n')
    )

  ctx.command('maimai')
    .subcommand('.search <content:text> 根据给出的曲名查找曲目。')
    .action((_, content) => {
      const result: string[] =
        maisonglist.filter((i) => i.object.title.toLowerCase().includes(content.toLowerCase()))
          .map(element => element.song_info_summary)
      if (result.length > config.result_num_max) {
        return `搜索结果过多（大于${config.result_num_max}条），请尝试使用更准确的内容进行搜索。`
      }
      if (result.length === 0) return '无搜索结果。'
      else return result.join('\n')
    })

  ctx.command('maimai')
    .subcommand('.artist <artist:string> 搜索对应曲师的曲目。')
    .option('page', '-p [page:number] 当结果有多页时设定要输出的页码。', { fallback: 1 })
    .action(({ options }, artist) => {
      const list = maisonglist.filter((i) => i.object.basic_info.artist
        .toLowerCase().includes(artist.toLowerCase()))
      if (list.length === 0) return '未找到结果，请尝试使用曲师的名义原文本进行搜索。'
      return page_split(list.map((i) => i.song_info_summary), config, options.page)
    })

  ctx.command('maimai')
    .subcommand('.charter <charter:string>  搜索对应谱师创作的谱面（定数降序排序）。')
    .option('page', '-p [page:number] 当结果有多页时设定要输出的页码。', { fallback: 1 })
    .action(({ options }, charter) => {
      const list = maisonglist.filter_chart((i) => i.object.charter
        .toLowerCase().includes(charter.toLowerCase()))
      if (list.length === 0) return '未找到结果，请尝试使用谱师的名义原文本进行搜索。'
      list.sort((a, b) => b.ds - a.ds)
      return page_split(list.map((i) => i.chart_summary_with_base), config, options.page)
    })
    .shortcut(/^我要大战([^\s]*)$/, { args: ['$1'] })
    .shortcut(/^我要大战([^\s]*) ([0-9]*)$/, { args: ['$1'], options: { page: '$2' } })

  ctx.command('maimai')
    .subcommand('.bpm <bpm1:number> [bpm2:number] 获取给定BPM的（或给定BPM区间内）的曲目。')
    .option('page', '-p [page:number] 当结果有多页时设定要输出的页码。', { fallback: 1 })
    .action(({ options }, bpm1, bpm2) => {
      if (bpm2 === undefined) {
        return page_split(
          maisonglist.filter((song) => song.object.basic_info.bpm === bpm1)
            .map((element) => element.song_info_summary),
          config, options.page)
      }
      else {
        if (bpm1 > bpm2) { const k = bpm1; bpm1 = bpm2; bpm2 = k }
        return page_split(
          maisonglist.filter((song) => song.object.basic_info.bpm >= bpm1 &&
            song.object.basic_info.bpm <= bpm2)
            .map((element) => element.song_info_summary),
          config, options.page)
      }
    })
}
