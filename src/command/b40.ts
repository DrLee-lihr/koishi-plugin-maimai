import { Context } from "koishi";
import { Config } from "..";
import maimai_song_list from "../maimai_song_list";


export default function (ctx: Context, config: Config, maisonglist: maimai_song_list) {
  function draw_song(a:object){
    
  }
  ctx.command("maimai")
    .subcommand(".b40 [username:string]")
    .action(({ session }, username) => {
      ctx.http.post("https://www.diving-fish.com/api/maimaidxprober/query/player",
        (username == undefined) ? { qq: session.userId } : { username: username })
        .then((result) => {
          console.log(result)
          throw Error("todo")
        })
    })
}