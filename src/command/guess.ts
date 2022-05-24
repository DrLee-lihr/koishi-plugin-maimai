import { Context, s, Time } from 'koishi'
import { Config, maisonglist } from '..'
import { diff, level_transform } from '../mai_tool'

declare module 'koishi' {
  // eslint-disable-next-line no-unused-vars
  interface Channel {
    /**
     * 1: 在猜
     * 0: 没猜
     */
    maimai_is_guessing: number
  }
}

export default function cmd_guess(ctx: Context, config: Config) {
  ctx.model.extend('channel', { maimai_is_guessing: { type: 'integer', initial: 0 } })

  ctx.command('maimai')
    .subcommand('.guess 发起 maimai 猜歌。')
    .channelFields(['maimai_is_guessing'])
    .option('filter', '-f <filter:string> 给出一个要过滤的曲目的过滤器。', { authority: 3 })
    .action(async ({ session, options }) => {
      const guess = { is_guessing: 1, not_guessing: 0 }
      const set_guessing = () => { session.channel.maimai_is_guessing = 1 }
      const unset_guessing = () => { session.channel.maimai_is_guessing = 0 }

      if (session.channel.maimai_is_guessing === guess.is_guessing) return '单个群聊同时只能进行一组猜歌。'
      set_guessing()

      await session.send('猜歌开始，接下来我将依次给出7个条件，请你根据条件猜出这首歌的名字。\n英文至少五个字母匹配，其他最少三个字匹配。')

      let well_known_list = maisonglist.filter((i) => (i.has_rem && i.ds[diff.REMASTER] >= 13)
        || i.ds[diff.MASTER] >= 13)
      try {
        // eslint-disable-next-line no-eval
        if (options.filter !== undefined) well_known_list = maisonglist.list.filter(eval(options.filter))
      }
      catch (e) { unset_guessing(); return `参数错误:\n${e.message}` }
      if (well_known_list.length === 0) { unset_guessing(); return '没有结果。' }
      const song = well_known_list[Math.floor(Math.random() * 20000) % well_known_list.length]

      const info_list = [
        `这首曲目${song.has_rem ? '' : '没'}有白谱`,
        `这首曲目${song.is_sd ? '' : '不'}是标准谱`,
        `这首曲目紫谱定级是 ${level_transform(song.ds[diff.MASTER])}`,
        `这首曲目紫谱的谱师是 ${song.charts[diff.MASTER].charter}`,
        `这首曲目紫谱的绝赞个数是 ${song.charts[diff.MASTER].notes[song.is_sd ? 3 : 4]}`,
        `这首曲目紫谱在查分器中的 Tag 是 ${song.charts[diff.MASTER].stat.tag}`,
        `这首曲目属于 ${song.basic_info.genre} 分区`,
        `这首曲目属于 ${song.basic_info.from} 版本`,
        `这首曲目的 BPM 是 ${song.basic_info.bpm}`,
        `这首曲目的曲师是 ${song.basic_info.artist}`,
        `这首曲目的紫谱定数为 ${song.ds[diff.MASTER]}`,
      ]
      if (song.has_rem) {
        info_list.push(
          `这首曲目白谱定级是 ${level_transform(song.ds[diff.REMASTER])}`,
          `这首曲目白谱的谱师是 ${song.charts[diff.REMASTER].charter}`,
          `这首曲目白谱的绝赞个数是 ${song.charts[diff.REMASTER].notes[song.is_sd ? 3 : 4]}`,
          `这首曲目白谱在查分器中的 Tag 是 ${song.charts[diff.REMASTER].stat.tag}`,
          `这首曲目的白谱定数为 ${song.ds[diff.REMASTER]}`,
        )
      }

      [1, 2, 3, 4, 5, 6, 7].forEach((i) => {
        const index = Math.floor(Math.random() * 100) % info_list.length
        const info = info_list[index]
        info_list.splice(index, 1)
        session.sendQueued(`${i}/7 ${info}`, 20 * Time.second)
      })
      session.sendQueued(
        ['很遗憾，没有人答对。答案：', song.song_info_summary, song.get_song_image()].join('\n'),
        40 * Time.second,
      )
      // console.log('发完了')
      const midware = ctx.middleware((session_1, next) => {
        function judge(song_name: string, content: string) {
          if (RegExp(`^[a-zA-Z]{${Math.min(5, song.title.length)},}$`).test(content)
            && song_name.toLowerCase().includes(content.toLowerCase())
          ) return true
          if (
            !RegExp(`^[a-zA-Z]{${Math.min(3, song.title.length)},}$`).test(content)
            && song_name.toLowerCase().includes(content.toLowerCase())
          ) return true
          return false
        }

        if (judge(song.title, session_1.content)) {
          midware()
          unset_guessing()

          // FIXME: it doesn't work properly -> bug confirmed; waiting for fix
          session.cancelQueued()

          return [`${s('at', { id: session_1.userId })} 恭喜你答对了！`, `答案：${song.song_info_summary}`,
            song.get_song_image()].join('\n')
        }
        return next()
      }, true)

      setTimeout(() => { midware(); unset_guessing() }, 170 * Time.second)
    })
}
