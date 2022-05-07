
import { Context, Schema } from 'koishi'
import maimai_song_list from './maimai_song_list'

// command modules
import mai_info from './command/info'
import mai_alias from './command/alias'
import mai_random from './command/random'
import mai_b40 from './command/b40'
import mai_music from './command/music'
import mai_calc from './command/calc'
import mai_guess from './command/guess'
import mai_record from './command/record'

export const name = 'maimai'
export interface Config {
  result_num_max: number
  alias_result_num_max: number
}
export const schema = Schema.object({
  result_num_max: Schema.number().default(10).description('返回搜索结果时单次最多显示的结果数量。'),
  alias_result_num_max: Schema.number().default(3).description('返回别名搜索结果时最多显示的结果数量。')
})

export const using = ['database'] as const

export let maisonglist: maimai_song_list

export function apply (ctx: Context, config: Config) {
  maisonglist = new maimai_song_list(ctx)
  maisonglist.promise.then(() => {
    [
      mai_info,
      mai_alias,
      mai_random,
      mai_b40,
      mai_music,
      mai_calc,
      mai_guess,
      mai_record
    ].forEach(i => ctx.plugin(i, config))
  })
}
