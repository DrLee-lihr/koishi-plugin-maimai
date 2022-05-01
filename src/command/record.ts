import { s } from "koishi";
import { Context } from "koishi";
import sharp from "sharp";
import { Config, maisonglist } from "..";
import { in_level, page_split, tts } from "../mai_tool";
import b40_func, { query_player, song_result } from "./b40";


interface records{
  additional_rating:number
  records:song_result[]
  username:string
}

export default function record(ctx: Context, config: Config) {

  if(config.token==undefined){
    console.error('未配置开发者 token，m.record 功能已关闭。')
    return
  }

  async function get_record(data:{username:string}):Promise<records>{
    return await ctx.http.get(
      'https://www.diving-fish.com/api/maimaidxprober/dev/player/records',
      {headers:{'developer-token':config.token},params:data}
      )
  }

  ctx.command('maimai')
    .subcommand('.record.level <level:string> [username:string] 获取对应标级的谱面的分数。')
    .option('page','-p <page:number> 当结果有多页时要输出的页码。')
    .action(async ({session,options},level,username)=>{
      
      if(username==undefined)username=(await query_player(session,username,ctx)).username

      let result=await get_record({username:username})
      let list=result.records.filter(v => in_level(v.ds,level))
        .sort()
        .map(
          v => `${v.achievements} ${v.rate}(Ra: ${v.ra}) `+
            maisonglist.id(v.song_id).charts[v.level_index].chart_summary_with_base
        )

      let text=page_split(list,config,options.page,`${username} 的 ${level} 分数列表：`)

      return s.image(Buffer.from(tts.getSVG(text)))

    })
    .shortcut(/^([1]?[0-9]\+?)分数列表(?: ([0-9]{1,}))?$/,{args:['$1'],options:{page:'$2'}})

  ctx.command('maimai')
    .subcommand('.record.base <base:number> [username:string] 获取对应定数的谱面的分数。')
    .option('page','-p <page:number> 当结果有多页时要输出的页码。')
    .action(async ({session,options},base,username)=>{

      if(username==undefined)username=(await query_player(session,username,ctx)).username

      let result=await get_record({username:username})
      let list=result.records.filter(v => v.ds==base)
        .sort()
        .map(
          v => `${v.achievements} ${v.rate}(Ra: ${v.ra}) `+
            maisonglist.id(v.song_id).charts[v.level_index].chart_summary_with_base
        )

      let text=page_split(list,config,options.page,`${username} 的 ${base} 分数列表：`)

      return s.image(Buffer.from(tts.getSVG(text)))
    })

}