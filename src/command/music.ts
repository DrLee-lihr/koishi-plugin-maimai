import { Context, segment } from "koishi";
import { Config, maisonglist } from "..";
import maisong from "../maisong";
import { alias_get } from "./alias";


export default function (ctx: Context, config: Config) {

  ctx.command("maimai")
    .subcommand(".music <id:number> 根据id点歌。")
    .action(async (_, id) => {

      /*
      forked from koishi-plugin-music (modified by DrLee-lihr)
      Copyright 2022 Shigma
      MIT License
      https://github.com/koishijs/koishi-plugin-music
      */
      async function netease(title: string, keyword: string, ctx: Context) {
        const data = await ctx.http.get('http://music.163.com/api/cloudsearch/pc', {
          params: { s: keyword, type: 1, offset: 0, limit: 1 },
        })
        if (data.code !== 200 ||
          data.result.songCount == 0 ||
          !data.result.songs[0].name.includes(title)) return undefined
        return {
          type: '163',
          id: data.result.songs[0].id,
        }
      }
      //fork end

      let song_info = maisonglist.id(id).object.basic_info
      var templates = [
        `${song_info.title} ${song_info.artist} `,
        `${song_info.title}`
      ]
      let a: { type: string; id: any; };
      for (let i of templates) {
        a = await netease(song_info.title, i, ctx)
        if (a != undefined) break
      }
      if (a == undefined) {
        return "点歌失败，请尝试更换平台或检查网络。"
      }
      return segment('music', a)
    })


  ctx.command("maimai")
    .subcommand(".music.alias <alias:text> 根据别名点歌。")
    .action(async (_, alias) => {
      let songs = maisonglist.filt((i) => i.object.basic_info.title.toLowerCase() == alias.toLowerCase())
      if (songs.length != 0) {
        return await ctx.command("maimai.music").execute({ args: [songs[0].id.toString()] })
      }
      try {
        var res = await alias_get(alias, ctx, config, maisonglist)
      }
      catch (_) {
        return "结果过多，请尝试使用更准确的别名进行搜索。"
      }
      if (res == undefined) {
        return "没有找到您想要的乐曲。"
      }
      try {
        let f = <maisong>res
      }
      catch {
        res = res[0]
      }
      return await ctx.command("maimai.music").execute({ args: [(<maisong>res).id.toString()] })
    })
    .shortcut(/^来一首(.*)$/, { args: ["$1"] })
    .usage("来一首监狱")
}