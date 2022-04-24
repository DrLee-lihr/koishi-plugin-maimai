import { Context } from "koishi";
import { Config, maisonglist } from "..";
import maimai_song_list from "../maimai_song_list";
import maisong from "../maisong";


export default function (ctx: Context, config: Config) {
  
  ctx.command("maimai")
    .subcommand(".alias.get <id:number> 获取id对应乐曲的别名。")
    .action(async (_, id) => {
      return await ctx.http("GET", "https://maimai.ohara-rinne.tech/api/alias/" + id).then((response) => {
        return (maisonglist.id(id).song_info_summary + "有如下别名：\n" +
          (<string[]><any>response["data"]).join("\n"))
      })
    })
    .shortcut(/^([0-9]*)有什么别名$/, { args: ["$1"] })


  ctx.command("maimai")
    .subcommand(".alias.lookup <alias:text> 根据别名查询乐曲。")
    .action(async (argv, alias) => {
      try {
        var res = await alias_get(alias, ctx, config, maisonglist)
      }
      catch (_) {
        return "结果过多，请尝试使用更准确的别名进行搜索。"
      }

      switch (typeof res) {
        case 'undefined': {
          return "没有找到您想找的乐曲。"
        }
        case 'object': {
          try {
            let f = res as maisong
            if(f.is_sd==undefined)throw Error()
          }
          catch {
            let a = ["您要找的可能是以下曲目中的一首："];
            (<any>res).forEach((element: { song_info_summary: string; }) => {
              a.push(element.song_info_summary)
            });
            return a.join("\n")
          }
          res =res as maisong
          return ["您要找的可能是：", res.song_info_summary, res.get_song_image(),
            res.song_ds_summary].join("\n")
        }
      }
    })
    .shortcut(/^(.*)是什么歌$/, { args: ["$1"] })
}

export async function alias_get(alias: string, ctx: Context, config:Config, maisonglist:maimai_song_list) {
  var response = await ctx.http("GET", encodeURI("https://maimai.ohara-rinne.tech/api/alias/query/" + alias))
  if (response["data"].length == 0) {
    return undefined
  }
  else if (response["data"].length > config.alias_result_num_max) {
    throw Error("结果过多")
  }
  else if (response["data"].length > 1) {
    for (let i of response["data"]) {
      if (i["alias"] == alias) {
        return maisonglist.id(i["musicId"])
      }
    }
    var res: maisong[] = []
    response["data"].forEach((element: JSON) => {
      res.push(maisonglist.id(element["musicId"]))
    })
    return res
  }
  else {
    return maisonglist.id(response["data"][0]["musicId"])
  }
}