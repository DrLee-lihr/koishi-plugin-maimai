import { Context, segment } from 'koishi'
import { Config } from '..'
import { identify } from '../mai_tool'

export default function cmd_music (ctx: Context, config: Config) {
  ctx.command('maimai')
    .subcommand('.music <identifier:string> 点歌。')
    .action(async (_, identifier) => {
      /*
      forked from koishi-plugin-music (modified by DrLee-lihr)
      Copyright 2022 Shigma
      MIT License
      https://github.com/koishijs/koishi-plugin-music
      */
      async function netease (title: string, keyword: string, ctx: Context) {
        const data = await ctx.http.get('http://music.163.com/api/cloudsearch/pc', {
          params: { s: keyword, type: 1, offset: 0, limit: 1 }
        })
        if (data.code !== 200 ||
          data.result.songCount === 0 ||
          !data.result.songs[0].name.includes(title)) return undefined
        return {
          type: '163',
          id: data.result.songs[0].id
        }
      }
      // fork end

      const song_info = (await identify(identifier, ctx)).object.basic_info
      const templates = [
        `${song_info.title} ${song_info.artist} `,
        `${song_info.title}`
      ]
      let a: { type: string; id: any; }
      for (const i of templates) {
        a = await netease(song_info.title, i, ctx)
        if (a !== undefined) break
      }
      if (a === undefined) {
        return '点歌失败，请尝试换一首歌或检查网络。'
      }
      return segment('music', a)
    })
    .shortcut(/^来一首(.*)$/, { args: ['$1'] })
    .usage('来一首监狱')
}
