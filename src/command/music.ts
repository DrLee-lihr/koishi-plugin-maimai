import { Context } from "koishi";
import { Config } from "..";
import maimai_song_list from "../maimai_song_list";
import maisong from "../maisong";
import { alias_get } from "./alias";


export default function (ctx: Context, config: Config, maisonglist: maimai_song_list) {

  ctx.command("maimai")
    .subcommand(".music <id:number> 根据id点歌。")
    .action(async (_, id) => {
      var music_cmd = ctx.getCommand("music")
      if (music_cmd == undefined) return "未安装此功能的依赖插件 koishi-plugin-music，请确保此插件已安装且被正确加载。"
      else {
        var song_info = maisonglist.id(id).object["basic_info"]
        console.log(song_info)
        var res = await music_cmd.execute(
          { args: [`${song_info["title"]} ${song_info["artist"]}`], options: { platform: "netease" } })
      }
      if (res == "点歌失败，请尝试更换平台。")
        res = await music_cmd.execute(
          { args: [song_info["title"]], options: { platform: "netease" } }
        )
      return res
    })


  ctx.command("maimai")
    .subcommand(".music.alias <alias:text> 根据别名点歌。")
    .action(async (_, alias) => {
      let songs=maisonglist.filt((i)=>i.object["basic_info"]["title"].toLowerCase()==alias.toLowerCase())
      if(songs.length!=0){
        return await ctx.command("maimai.music").execute({args:[songs[0].id.toString()]})
      }
      try{
        var res=await alias_get(alias,ctx,config,maisonglist)
      }
      catch (_) {
        return "结果过多，请尝试使用更准确的别名进行搜索。"
      }
      if(res==undefined){
        return "没有找到您想要的乐曲。"
      }
      try{
        let f=<maisong>res
      }
      catch{
        res=res[0]
      }
      return await ctx.command("maimai.music").execute({args:[(<maisong>res).id.toString()]})
    })
    .shortcut(/^来一首(.*)$/, { args: ["$1"] })
    .usage("来一首监狱")
}