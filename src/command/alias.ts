import { Context } from "koishi";
import { Config } from "..";
import maimai_song_list from "../maimai_song_list";


export default function (ctx: Context, config: Config, maisonglist: maimai_song_list) {
  ctx.command("maimai")
    .subcommand(".alias.get <id:number> 获取id对应乐曲的别名。")
    .action((argv, id) => {
      ctx.http("GET", "https://maimai.ohara-rinne.tech/api/alias/" + id).then((response) => {
        argv.session.send(maisonglist.id(id).song_info_summary + "有如下别名：\n" + (<string[]><any>response["data"]).join("\n"))
      })
    })
    .shortcut(/^([0-9]*)有什么别名$/, { args: ["$1"] })


  ctx.command("maimai")
    .subcommand(".alias.lookup <alias:text> 根据别名查询乐曲。")
    .action((argv, alias) => {
      ctx.http("GET", encodeURI("https://maimai.ohara-rinne.tech/api/alias/query/" + alias)).then((response) => {
        if (response["data"].length == 0) {
          argv.session.send("没有找到您想找的乐曲。")
          return
        }
        else if (response["data"].length > config.alias_result_num_max) {
          argv.session.send(`搜索结果过于宽泛（大于${config.alias_result_num_max}条），请尝试使用更准确更大众的别名进行搜索。`)
          return
        }
        else if (response["data"].length > 1) {
          var res: string[] = []
          response["data"].forEach((element: JSON) => {
            res.push(maisonglist.id(element["musicId"]).song_info_summary)
          })
          argv.session.send("您要找的可能是以下歌曲中的一首：\n" + res.join("\n"))
          return
        }
        else {
          var song = maisonglist.id(response["data"][0]["musicId"])
          argv.session.send(`您要找的是不是：\n${song.song_info_summary}` + song.get_song_image() + song.song_ds_summary)
        }
      })
    })
    .shortcut(/^(.*)是什么歌$/, { args: ["$1"] })
}