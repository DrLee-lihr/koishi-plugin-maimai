import { Context } from "koishi";
import { Config } from "..";
import maimai_song_list from "../maimai_song_list";
import { in_level, difficulty_trans_table, version_transform_table } from "../mai_tool";


export default function (ctx: Context, config: Config, maisonglist: maimai_song_list) {


  ctx.command("maimai")
    .subcommand(".random.chart 随机谱面。")
    .option("level", "-l [level:string] 谱面标级。", { fallback: "歌" })
    .option("artist", "-a [artist:string] 曲师。", { fallback: "" })
    .option("charter", "-c [charter:string] 谱师。", { fallback: "" })
    .option("difficulty", "-d [difficulty:string] 谱面颜色。")
    .option("type", "-t [type:string] 谱面类型（标准/DX）。", { fallback: "" })
    .option("version", "-v [version:string] 谱面版本。", { fallback: "" })
    .action(({ options }) => {
      var result = maisonglist.filt_chart((chart) => 
        ((options.level != "歌") ? (in_level(chart.ds, options.level)) : true) &&
        (chart.song.object.basic_info.title.toLowerCase().includes(options.artist.toLowerCase())) &&
        (chart.object.charter.toLowerCase().includes(options.charter.toLowerCase())) &&
        (options.difficulty == "" ? true : (chart.difficulty == difficulty_trans_table[options.difficulty])) &&
        (options.type != "" ? ((chart.song.is_sd ? "标准" : "DX") == options.type) : true) &&
        (options.version != "" ? (chart.song.object.basic_info.from 
          == version_transform_table[options.version]) : true)
      )
      var chart = result[Math.floor(Math.random() * 10000) % result.length]
      return [`从${result.length}个符合条件的结果中随机：`, chart.chart_summary,
      chart.song.get_song_image(), chart.base_summary].join("\n")
    })
    .shortcut(
      /^随个(?:([^写代0-9.+歌]*?)的)?(?:([^代的0-9.+歌]*?)写的)?(?:([^写的0-9.+歌])代的)?(标准|DX)?(绿|黄|红|紫|白)?([0-9\.+歌]{1,4})(?:[给要当].*)?$/,
      { options: { artist: "$1", charter: "$2", version: "$3", type: "$4", difficulty: "$5", level: "$6" } })
    .shortcut(
      /^随个(?:([^代的0-9.+歌]*?)写的)?(?:([^写代0-9.+歌]*?)的)?(?:([^写的0-9.+歌])代的)?(标准|DX)?(绿|黄|红|紫|白)?([0-9\.+歌]{1,4})(?:[给要当].*)?$/,
      { options: { artist: "$1", charter: "$2", version: "$3", type: "$4", difficulty: "$5", level: "$6" } })
    .example("m.random -l 14+ -c @dp -a t+pazolite -v 辉 -d 3 -t 标准  随机一张由@DP写的、t+pazolite作曲的、FiNALE版本的标准紫14+谱面。")
    .example("随个Tsukasa的玉子豆腐写的真代的标准白14.5")
    .example("随个Frums的白代歌")
    .usage("注意：在使用正则快速调用时，参数需要按以下顺序排列：\n([曲师]/[谱师])[版本][标准|DX][颜色][标级]\n曲师和谱师可以调换位置。\n" +
      "前四项参数可以省略；当不想对标级进行过滤时，使用“歌”来替代。")


  ctx.command("maimai")
    .subcommand(".random.song 随机歌曲。")
    .option("artist", "-a [artist:string] 曲师。", { fallback: "" })
    .option("version", "-v [version:string] 谱面版本。", { fallback: "" })
    .action(({ options }) => {
      var result = maisonglist.filt((song) => 
        (song.object.basic_info.artist.toLowerCase().includes(options.artist.toLowerCase())) &&
        (options.version != "" ? (song.object.basic_info.from 
          == version_transform_table[options.version]) : true)
      )
      var song = result[Math.floor(Math.random() * 10000) % result.length]
      return [`从${result.length}个符合条件的结果中随机：`, song.song_info_summary,
      song.get_song_image(), song.song_ds_summary].join("\n")
    })
    .shortcut(/^.*mai什么.*$/)
    .example("今天mai什么")
}