import { Context } from "koishi";
import { Config } from "..";


export default function record(ctx: Context, config: Config) {

  ctx.command('maimai')
    .subcommand('.record.level <level:string> 获取对应标级的谱面的分数。')
    .action((_,level)=>{
      //TODO:
    })

  ctx.command('maimai')
    .subcommand('.record.base <base:number> 获取对应定数的谱面的分数。')
    .action((_,base)=>{
      //TODO:
    })

}