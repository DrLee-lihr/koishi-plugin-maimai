import { Argv } from "koishi";
import { Context } from "koishi";
import { Config } from "..";
import maimai_song_list from "../maimai_song_list";
import { difficulty_trans_table } from "../mai_tool";



declare module 'koishi' {
  namespace Argv {
    interface Domain {
      difficulty: any
    }
  }
}





export default function (ctx: Context, config: Config, maisonglist: maimai_song_list) {

  Argv.createDomain('difficulty', (source) => {
    switch(typeof source){
      case 'number':{

      }
    }
  })

  ctx.command('maimai')
    .subcommand('calculate <id:number> <difficulty:string|number> <achievement>')
    .action((_,id,diff,achieve)=>{
      difficulty_trans_table[diff]
    })
    .alias('calc')



}