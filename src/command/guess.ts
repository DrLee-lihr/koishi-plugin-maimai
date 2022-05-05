import { Context, s, Time } from "koishi";
import { Config, maisonglist } from "..";
import { diff, level_transform } from "../mai_tool";


export default function (ctx: Context, config: Config) {



  ctx.command('maimai')
    .subcommand('.guess 发起 maimai 猜歌。')
    .option('filter', '-f <filter:string> 给出一个要过滤的曲目的过滤器。', { authority: 3 })
    .action(async ({ session, options }) => {
      await session.send('猜歌开始，接下来我将依次给出7个条件，请你根据条件猜出这首歌的名字。\n英文至少五个字母匹配，其他最少三个字匹配。')

      let well_known_list = maisonglist.filter((i) => (i.has_rem && i.object.ds[diff.REMASTER] >= 13) ||
        i.object.ds[diff.MASTER] >= 13)
      try {
        if (options.filter != undefined) well_known_list = maisonglist.list.filter(eval(options.filter))
      }
      catch { return '参数错误。' }
      if (well_known_list == []) return '没有结果。'
      let song = well_known_list[Math.floor(Math.random() * 20000) % well_known_list.length]

      let info_list = [
        `这首曲目${song.has_rem ? '' : '没'}有白谱`,
        `这首曲目${song.is_sd ? '' : '不'}是标准谱`,
        `这首曲目紫谱定级是 ${level_transform(song.object.ds[diff.MASTER])}`,
        `这首曲目紫谱的谱师是 ${song.charts[diff.MASTER].object.charter}`,
        `这首曲目紫谱的绝赞个数是 ${song.charts[diff.MASTER].object.notes[song.is_sd ? 3 : 4]}`,
        `这首曲目紫谱在查分器中的 Tag 是 ${song.charts[diff.MASTER].stat.tag}`,
        `这首曲目属于 ${song.object.basic_info.genre} 分区`,
        `这首曲目属于 ${song.object.basic_info.from} 版本`,
        `这首曲目的 BPM 是 ${song.object.basic_info.bpm}`,
        `这首曲目的曲师是 ${song.object.basic_info.artist}`,
        `这首曲目的紫谱定数为 ${song.object.ds[diff.MASTER]}`,
      ]
      if (song.has_rem) {
        info_list.push(
          `这首曲目白谱定级是 ${level_transform(song.object.ds[diff.REMASTER])}`,
          `这首曲目白谱的谱师是 ${song.charts[diff.REMASTER].object.charter}`,
          `这首曲目白谱的绝赞个数是 ${song.charts[diff.REMASTER].object.notes[song.is_sd ? 3 : 4]}`,
          `这首曲目白谱在查分器中的 Tag 是 ${song.charts[diff.REMASTER].stat.tag}`,
          `这首曲目的白谱定数为 ${song.object.ds[diff.REMASTER]}`,
        )
      }

      [1, 2, 3, 4, 5, 6, 7].forEach(i => {
        let index = Math.floor(Math.random() * 100) % info_list.length
        let info = info_list[index]
        info_list.splice(index, 1)
        session.sendQueued(`${i}/7 ` + info, 20 * Time.second)
      });
      session.sendQueued(['很遗憾，没有人答对。答案：', song.song_info_summary, song.get_song_image()].join('\n'),
        40 * Time.second)
      //console.log('发完了')
      let midware = ctx.middleware((session_1, next) => {

        let judge = function (song_name: string, content: string) {
          if (RegExp(`^[a-zA-Z]{${Math.min(5, song.object.title.length)},}$`).test(content) &&
            song_name.toLowerCase().includes(content.toLowerCase())
          ) return true
          else if (
            !RegExp(`^[a-zA-Z]{${Math.min(3, song.object.title.length)},}$`).test(content) &&
            song_name.toLowerCase().includes(content.toLowerCase())
          ) return true
          else return false
        }

        if (judge(song.object.title, session_1.content)) {
          midware()

          //FIXME: it doesn't work properly -> bug confirmed; waiting for fix
          session.cancelQueued()

          return [s('at', { id: session_1.userId }) + ' 恭喜你答对了！', `答案：${song.song_info_summary}`,
          song.get_song_image()].join('\n')
        }
        else return next()
      }, true);


      setTimeout(midware, 170 * Time.second)
    })

}