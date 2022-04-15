
import { Context, Schema } from 'koishi'
import maimai_song_list from "./maimai_song_list"

//command modules
import apply_mai_info from './command/info'
import apply_mai_alias from './command/alias'
import apply_mai_random from './command/random'
import apply_mai_b40 from './command/b40'
import apply_mai_music from './command/music'
import apply_mai_calculate from './command/calculate'


export const name = 'maimai'
export interface Config {
  result_num_max: number
  alias_result_num_max: number
}
export const schema = Schema.object({
  result_num_max: Schema.number().default(10).description("返回搜索结果时单次最多显示的结果数量。"),
  alias_result_num_max: Schema.number().default(3).description("返回别名搜索结果时最多显示的结果数量。")
})


export function apply(ctx: Context, config: Config) {

  var maisonglist = new maimai_song_list(ctx)
  maisonglist.promise.then(() => {
    apply_mai_info(ctx,config,maisonglist)
    apply_mai_alias(ctx,config,maisonglist)
    apply_mai_random(ctx,config,maisonglist)
    apply_mai_b40(ctx,config,maisonglist)
    apply_mai_music(ctx,config,maisonglist)
    apply_mai_calculate(ctx,config,maisonglist)
  })
}