import { Context } from "koishi";
import { Config, maisonglist } from "..";
import maichart, { difficulty } from "../maichart";
import { get_difficulty_id, identify, page_split, version_transform_table } from "../mai_tool";
import { fc, fs } from "./b40";
import maisong from "../maisong";


type record = {
  achievements: number,
  fc: fc,
  fs: fs,
  id: number,
  level: string,
  level_index: difficulty,
  title: string,
  type: "DX" | "SD"
}
interface version_list {
  verlist: record[]
}

export async function get_record(ctx: Context, data: { qq: number } | { username: string }): Promise<version_list> {
  data['version'] = Object.values(version_transform_table)
  //console.log(Object.defineProperty(data,'version',Object.values(version_transform_table)))
  return await
    ctx.http.post('https://www.diving-fish.com/api/maimaidxprober/query/plate', data).catch(console.log)
}

async function get_version_record(ctx: Context, data: { qq: number } | { username: string }, version: string): Promise<version_list> {
  data['version'] = [version]
  return await ctx.http.post('https://www.diving-fish.com/api/maimaidxprober/query/plate', data).catch(console.log)
}

export default function record(ctx: Context, config: Config) {

  ctx.command('maimai')
    .subcommand('.record.level <level:string> [username:string] 获取对应标级的谱面的分数。')
    .option('page', '-p <page:number> 当结果有多页时要输出的页码。', { fallback: 1 })
    .action(async ({ session, options }, level, username) => {

      let data: { qq: number } | { username: string }
      if (username == undefined) {
        if (session.platform != 'onebot') return '请提供用户名。'
        else data = { qq: Number.parseInt(session.userId) }
      }
      else data = { username: username }
      let result = await get_record(ctx, data)
      let list = result.verlist.filter(v => v.level == level)
        .sort((a, b) => b.achievements - a.achievements)

      return page_split<record>(
        list, config, options.page,
        `${username ?? session.username} 的 ${level} 分数列表：`,
        v => `${v.achievements}% ` +
          maisonglist.id(v.id).charts[v.level_index].chart_summary_with_base
      )
    })
    .shortcut(/^((?:[1-9])|(?:1[0-5])\+?)分数列表(?: ([0-9]{1,}))?$/,
      { args: ['$1'], options: { page: '$2' } })

  ctx.command('maimai')
    .subcommand('.record.base <base:number> [username:string] 获取对应定数的谱面的分数。')
    .option('page', '-p <page:number> 当结果有多页时要输出的页码。', { fallback: 1 })
    .action(async ({ session, options }, base, username) => {

      let data: { qq: number } | { username: string }
      if (username == undefined) {
        if (session.platform != 'onebot') return '请提供用户名。'
        else data = { qq: Number.parseInt(session.userId) }
      }
      else data = { username: username }
      let result = await get_record(ctx, data)

      let res: string[] = []

      result.verlist.sort((a, b) => b.achievements - a.achievements).forEach(
        (v) => {
          let song = maisonglist.id(v.id)
          if (song.charts[v.level_index].ds == base)
            res.push(
              `${v.achievements}% ` +
              maisonglist.id(v.id).charts[v.level_index].chart_summary_with_base
            )
        }
      )
      return page_split(
        res, config, options.page, `${username ?? session.username} 的 ${base} 分数列表：`
      )
    })
    .shortcut(/^((?:[1-9])|(?:1[0-5]).[0-9])分数列表(?: ([0-9]{1,}))?$/,
      { args: ['$1'], options: { page: '$2' } })

  ctx.command('maimai')
    .subcommand('.record.song <identifier:string> <difficulty:string> [username:string] 获取谱面的达成分数。')
    .action(async ({ session }, identifier, difficulty, username) => {
      let diff_index=get_difficulty_id(difficulty)
      let data: { qq: number } | { username: string }
      if (username == undefined) {
        if (session.platform != 'onebot') return '请提供用户名。'
        else data = { qq: Number.parseInt(session.userId) }
      }
      let song: maisong = undefined
      try { song = await identify(identifier, ctx) }
      catch { return '曲目信息过于模糊，请使用更准确的说法。' }
      
      let result=(await get_version_record(ctx,data,song.object.basic_info.from))
        .verlist.filter(v=>v.id==song.id&&diff_index==v.level_index)
      let song_data=result[0]
      if (result.length==0) return '未获取到分数，请确认查分器上有对应谱面的数据。'
      
      else return [
          song.song_info_summary,
          (song.charts[difficulty] as maichart).base_summary,
          song_data.achievements+'%',
          `${song_data.fc==''?'无':song_data.fc}/${song_data.fs==''?'无':song_data.fs}`,
        ].join('\n')
    })
    .shortcut(/^(绿|红|黄|紫|白)(.*?)分数(?: (.*))?$/,
      {args:['$2','$1','$3']})
}