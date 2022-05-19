import { Context } from 'koishi'
import { Config, maisonglist } from '..'
import { get_difficulty_id, identify, page_split, payload_data, version_transform_table } from '../mai_tool'
import { song_result } from './b40'
import maisong from '../maisong'

type record = Pick<song_result, 'achievements'|'fc'|'fs'|'level'|'level_index'|'title'|'type'> & { id: number }

interface version_list {
  verlist: record[]
}

type res_data = payload_data & { version?:string[] }

export async function get_record(ctx: Context, data: res_data): Promise<version_list> {
  data.version = Object.values(version_transform_table)
  // console.log(Object.defineProperty(data,'version',Object.values(version_transform_table)))
  return ctx.http.post('https://www.diving-fish.com/api/maimaidxprober/query/plate', data)
}

async function get_version_record(ctx: Context, data: res_data, version: string): Promise<version_list> {
  data.version = [version]
  return ctx.http.post('https://www.diving-fish.com/api/maimaidxprober/query/plate', data)
}

export default function cmd_record(ctx: Context, config: Config) {
  ctx.command('maimai')
    .subcommand('.record.level <level:string> [username:string] 获取对应标级的谱面的分数。')
    .option('page', '-p <page:number> 当结果有多页时要输出的页码。', { fallback: 1 })
    .action(async ({ session, options }, level, username) => {
      let data: payload_data
      if (username === undefined) {
        if (session.platform !== 'onebot') return '请提供用户名。'
        data = { qq: Number.parseInt(session.userId, 10) }
      }
      else data = { username }
      let result: version_list
      try {
        result = await get_record(ctx, data)
      }
      catch (e) {
        if (e.response.data.message === 'user not exist') return '用户不存在。'
        return e.message
      }
      const list = result.verlist.filter((v) => v.level === level)
        .sort((a, b) => b.achievements - a.achievements)

      return page_split<record>(
        list,
        config,
        options.page,
        `${username ?? session.username} 的 ${level} 分数列表：`,
        (v) => `${v.achievements.toFixed(4)}% ${
          maisonglist.id(v.id).charts[v.level_index].chart_summary_with_base}`
      )
    })
    .shortcut(
      /^((?:[1-9])|(?:1[0-5])\+?)分数列表(?: ([0-9]{1,}))?$/,
      { args: ['$1'], options: { page: '$2' } }
    )

  ctx.command('maimai')
    .subcommand('.record.base <base:number> [username:string] 获取对应定数的谱面的分数。')
    .option('page', '-p <page:number> 当结果有多页时要输出的页码。', { fallback: 1 })
    .action(async ({ session, options }, base, username) => {
      let data: payload_data
      if (username === undefined) {
        if (session.platform !== 'onebot') return '请提供用户名。'
        data = { qq: Number.parseInt(session.userId, 10) }
      }
      else data = { username }
      let result: version_list
      try {
        result = await get_record(ctx, data)
      }
      catch (e) {
        if (e.response.data.message === 'user not exist') return '用户不存在。'
        return e.message
      }
      const res: string[] = []

      result.verlist.sort((a, b) => b.achievements - a.achievements).forEach(
        (v) => {
          const song = maisonglist.id(v.id)
          if (song.charts[v.level_index].ds === base) {
            res.push(
              `${v.achievements.toFixed(4)}% ${
                maisonglist.id(v.id).charts[v.level_index].chart_summary_with_base}`
            )
          }
        }
      )
      return page_split(res, config, options.page, `${username ?? session.username} 的 ${base} 分数列表：`)
    })
    .shortcut(
      /^((?:[1-9])|(?:1[0-5]).[0-9])分数列表(?: ([0-9]{1,}))?$/,
      { args: ['$1'], options: { page: '$2' } }
    )

  ctx.command('maimai')
    .subcommand('.record.song <identifier:string> [difficulty:string] [username:string] 获取谱面的达成分数。')
    .action(async ({ session }, identifier, difficulty, username) => {
      const diff_index = get_difficulty_id(difficulty)
      // console.log(diff_index)
      let data: payload_data
      if (username === undefined) {
        if (session.platform !== 'onebot') return '请提供用户名。'
        data = { qq: Number.parseInt(session.userId, 10) }
      }
      else data = { username }

      let song: maisong
      try { song = await identify(identifier, ctx) }
      catch (e) {
        if (e.message === 'Request failed with status code 502') return '别名服务暂时不可用，请稍后再试。'
        return '曲目信息过于模糊，请使用更准确的说法。'
      }

      let result: record[]
      try {
        result = (await get_version_record(ctx, data, song.basic_info.from))
          .verlist.filter((v) => v.id.toString() === song.id && diff_index === v.level_index)
      }
      catch (e) {
        if (e.response.data.message === 'user not exist') return '用户不存在。'
        return e.message
      }
      const song_data = result[0]
      if (result.length === 0) return '未获取到分数，请确认查分器上有对应谱面的数据。'

      return [
        song.song_info_summary,
        song.charts[diff_index].base_summary,
        `${song_data.achievements.toFixed(4)}%`,
        `${song_data.fc === '' ? '无' : song_data.fc} / ${song_data.fs === '' ? '无' : song_data.fs}`
      ].join('\n')
    })
    .shortcut(
      /^(绿|红|黄|紫|白)?(.*?)(?:打多少分|分数)(?: (.*))?$/,
      { args: ['$2', '$1', '$3'] }
    )
}
