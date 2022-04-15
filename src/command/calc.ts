import { Argv } from "koishi";
import { Context } from "koishi";
import { Config } from "..";
import { difficulty } from "../maichart";
import maimai_song_list from "../maimai_song_list";
import { difficulty_trans_table, get_difficulty_id } from "../mai_tool";





export default function (ctx: Context, config: Config, maisonglist: maimai_song_list) {



  ctx.command('maimai')
    .subcommand('.calc.achieve <id:number> <difficulty:string> <achievement:number>')
    .action((_, id, diff, achieve) => {
      
      let song = maisonglist.id(id)
      let chart = song.charts[get_difficulty_id(diff)]
      let notes = chart.object.notes


      let max_combo = 0
      notes.forEach((m) => max_combo += m)

      let BREaK = song.is_sd ? notes[3] : notes[4] //break是保留字 xs
      let touch = song.is_sd ? 0 : notes[3]
      let tap_basic_num = notes[0] + notes[1] * 2 + notes[2] * 3 + (song.is_sd ? (notes[3] * 5) : (notes[3] + notes[4] * 5))

      let available = 101 - achieve
      return [
        `${song.song_info_summary} ${chart.base_summary}`,
        `物量：${max_combo}，基础计算物量：${tap_basic_num}`,
        `1个 Tap Great -${(100 * 0.2 / tap_basic_num).toFixed(4)}%`,
        `Break 50 落相当于${((0.5 / (2 * BREaK)) / (100 * 0.2 / tap_basic_num)).toFixed(4)}个 Tap Great (-${
          (0.5 / (2 * BREaK)).toFixed(4)}%)`,
        `${achieve}% 允许的最大 Tap Great 数量： ${(available / (100 * 0.2 / tap_basic_num)).toFixed(2)}`
      ].join('\n')

    })
    .shortcut('分数线',{fuzzy:true})

    

}