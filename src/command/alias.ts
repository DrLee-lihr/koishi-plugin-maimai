import { Context } from 'koishi'
import { Config, maisonglist } from '..'
import maisong from '../maisong'

/**
 * 别名 => 乐曲
 * @param alias 要查询的别名
 * @param ctx 上下文，一个上下文到处传（
 * @param config 设置对象
 * @returns `undefined | maisong | maisong[]` （undefined 指无结果）
 * @throws 网络问题 或 由于别名结果过多抛出异常，需要自行 catch 并看 Error 的 text 判断
 */
export async function alias_get(alias: string, ctx: Context, config?: Config) {
  const response = await ctx.http('GET', encodeURI(`https://maimai.ohara-rinne.tech/api/alias/query/${alias}`))
  if (response.data.length === 0) {
    return undefined
  }
  if (response.data.length > config.alias_result_num_max ?? 5) {
    throw Error('结果过多')
  }
  else if (response.data.length > 1) {
    for (const i of response.data) {
      if (i.alias === alias) {
        return maisonglist.id(i.musicId)
      }
    }
    const res: maisong[] = []
    response.data.forEach((element: { musicId: string | number }) => {
      res.push(maisonglist.id(element.musicId))
    })
    return res
  }
  else {
    return maisonglist.id(response.data[0].musicId)
  }
}

export default function cmd_alias(ctx: Context, config: Config) {
  ctx.command('maimai')
    .subcommand('.alias.get <id:number> 获取id对应乐曲的别名。')
    .action(async (_, id) => ctx.http('GET', `https://maimai.ohara-rinne.tech/api/alias/${id}`).then((response) => (`${maisonglist.id(id).song_info_summary}有如下别名：\n${
      (response.data as string[]).join('\n')}`)).catch(() => '别名服务暂时不可用，请稍后再试。'))
    .shortcut(/^([0-9]*)有什么别名$/, { args: ['$1'] })

  ctx.command('maimai')
    .subcommand('.alias.lookup <alias:text> 根据别名查询乐曲。')
    .action(async (_argv, alias) => {
      let res: maisong | maisong[]
      try {
        res = await alias_get(alias, ctx, config)
      }
      catch (e) {
        // console.log(e.message)
        if (e.message === 'Request failed with status code 502') return '别名服务暂时不可用，请稍后再试。'
        return '结果过多，请尝试使用更准确的别名进行搜索。'
      }

      switch (typeof res) {
        case 'undefined': {
          return '没有找到您想找的乐曲。'
        }
        case 'object': {
          try {
            if ((res as maisong).is_sd === undefined) throw Error()
          }
          catch {
            const a = ['您要找的可能是以下曲目中的一首：'];
            (res as Array<maisong>).forEach((element: maisong) => {
              a.push(element.song_info_summary)
            })
            return a.join('\n')
          }
          res = res as maisong
          return ['您要找的可能是：', res.song_info_summary, res.get_song_image(),
            res.song_ds_summary].join('\n')
        }
        default:
          return undefined
      }
    })
    .shortcut(/^(.*)是什么歌$/, { args: ['$1'] })
}
