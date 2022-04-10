import { Context } from "koishi";
import { Config } from "..";
import maimai_song_list from "../maimai_song_list";
import { difficulty_id, page_split } from "../mai_tool";


export default function (ctx: Context, config: Config, maisonglist: maimai_song_list) {
  ctx.command("maimai <id:number> [diff:string] 根据id或难度查询乐曲或谱面信息。")
    .action((argv, id, diff) => {
      var song = maisonglist.id(id)
      if (song == undefined) {
        return "未找到乐曲。"
      }
      else if (diff == undefined) {
        return [song.song_info_summary, song.get_song_image(), song.song_ds_summary, song.basic_info_summary].join("\n")
      }
      else {
        var diffid = 5
        for (var i = 0; i <= 4; i++) {
          for (var j = 0; j < difficulty_id[i].length; j++) {
            if (diff == difficulty_id[i][j]) {
              diffid = <number>difficulty_id[i][0]
              break
            }
          }
        }
        var chart = song.charts[diffid]
        chart.get_probe_data(ctx).then(() => {
          argv.session.send([song.song_info_summary,
          song.get_song_image(), chart.base_summary, chart.note_summary, chart.probe_summary].join("\n"))
        })
        return
      }
    })
    .alias("m")

  ctx.command("maimai")
    .subcommand(".base <base:number> 根据给出的定数查找曲目。")
    .action((_, base) => {
      var result: string[] = []
      maisonglist.filt_chart((chart) => chart.ds == base)
        .forEach(element => {
          result.push(element.chart_summary_with_base)
        })
      return result.join("\n")
    })

  ctx.command("maimai")
    .subcommand(".search <content:text> 根据给出的曲名查找曲目。")
    .action((_, content) => {
      var result: string[] = []
      maisonglist.filt((i) => i.object["title"].toLowerCase().includes(content.toLowerCase()))
        .forEach(element => {
          result.push(element.song_info_summary)
        })
      if (result.length > config.result_num_max) {
        return `搜索结果过多（大于${config.result_num_max}条），请尝试使用更准确的内容进行搜索。`
      }
      if (result.length == 0) return "无搜索结果。"
      else return result.join("\n")
    })


  ctx.command("maimai")
    .subcommand(".artist <artist:string> 搜索对应曲师的曲目。")
    .option("page", "-p [page:number] 当结果有多页时设定要输出的页码。", { fallback: 1 })
    .action(({ options }, artist) => {
      var list = maisonglist.filt((i) => i.object["basic_info"]["artist"].toLowerCase().includes(artist.toLowerCase()))
      if (list.length == 0) return "未找到结果，请尝试使用曲师的名义原文本进行搜索。"
      var temp: string[] = []
      list.forEach((element) => { temp.push(element.song_info_summary) })
      return page_split(temp, config, options.page)
    })


  ctx.command("maimai")
    .subcommand(".charter <charter:string>  搜索对应谱师创作的谱面（定数降序排序）。")
    .option("page", "-p [page:number] 当结果有多页时设定要输出的页码。", { fallback: 1 })
    .action(({ options }, charter) => {
      var list = maisonglist.filt_chart((i) => i.object["charter"].toLowerCase().includes(charter.toLowerCase()))
      if (list.length == 0) return "未找到结果，请尝试使用谱师的名义原文本进行搜索。"
      list.sort((a, b) => b.ds - a.ds)
      var temp: string[] = []
      list.forEach((element) => { temp.push(element.chart_summary_with_base) })
      return page_split(temp, config, options.page)
    })
    .shortcut(/^我要大战([^\s]*)$/, { args: ["$1"] })
    .shortcut(/^我要大战([^\s]*) ([0-9]*)$/, { args: ["$1"], options: { page: "$2" } })


  ctx.command("maimai")
    .subcommand(".bpm <bpm1:number> [bpm2:number] 获取给定BPM的（或给定BPM区间内）的曲目。")
    .option("page", "-p [page:number] 当结果有多页时设定要输出的页码。", { fallback: 1 })
    .action((_, bpm1, bpm2) => {
      if (bpm2 == undefined) {
        var result: string[] = []
        maisonglist.filt((song) => song.object["basic_info"]["bpm"] == bpm1)
          .forEach((element) => result.push(element.song_info_summary))
        return page_split(result, config)
      }
      else {
        var result: string[] = []
        maisonglist.filt((song) => (song.object["basic_info"]["bpm"] >= bpm1 && song.object["basic_info"]["bpm"] <= bpm2) ||
          (song.object["basic_info"]["bpm"] <= bpm1 && song.object["basic_info"]["bpm"] >= bpm2))
          .forEach((element) => result.push(element.song_info_summary))
        return page_split(result, config)
      }
    })


  ctx.command("maimai")
    .subcommand(".music <id:number>")
    .action((_, id) => {
      var music_cmd = ctx.getCommand("music")
      if (music_cmd == undefined) return "未安装此功能的依赖插件 koishi-plugin-music，请确保此插件已安装且被正确加载。"
      else return music_cmd.execute({ args: [maisonglist.id(id).object["basic_info"]["title"]], options: { platform: "netease" } })
    })
}