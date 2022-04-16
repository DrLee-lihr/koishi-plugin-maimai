import { Context } from "koishi";
import { Config } from "..";
import maimai_song_list from "../maimai_song_list";
import { get_difficulty_id } from "../mai_tool";





export default function (ctx: Context, config: Config, maisonglist: maimai_song_list) {



  ctx.command('maimai')
    .subcommand('.calc.achieve <id:number> <difficulty:string> <achievement:number> ')
    .action((_, id, diff, achieve) => {
      let error='输入的参数无效。'

      let song = maisonglist.id(id)
      if(song==undefined)return error
      let chart = song.charts[get_difficulty_id(diff)]
      if(chart==undefined||achieve>101||achieve<0)return error
      

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
        `Break 50 落相当于${((0.5 / (2 * BREaK)) / (100 * 0.2 / tap_basic_num)).toFixed(4)}个 Tap Great (-${(0.5 / (2 * BREaK)).toFixed(4)}%)`,
        `${achieve}% 允许的最大 Tap Great 数量： ${(available / (100 * 0.2 / tap_basic_num)).toFixed(2)}`,
        `DX Rating： ${Math.floor(calculate_factor(achieve)[0]*chart.ds*Math.min(achieve,100.5)/100)}`
      ].join('\n')

    })
    .shortcut('分数线', { fuzzy: true })

  function calculate_factor(ach: number):[number,string] {
    if (ach < 50) return [0,'D']
    else if (ach < 60) return [5,'C']
    else if (ach < 70) return [6,'B']
    else if (ach < 75) return [7,'BB']
    else if (ach < 80) return [7.5,'BBB']
    else if (ach < 90) return [8,'A']
    else if (ach < 94) return [9,'AA']
    else if (ach < 97) return [10.5,'AAA']
    else if (ach < 98) return [12.5,'S']
    else if (ach < 99) return [12.75,'S+']
    else if (ach < 99.5) return [13,'SS']
    else if (ach < 100) return [13.25,'SS+']
    else if (ach < 100.5) return [13.5,'SSS']
    else return [14,'SSS+']
  }


  ctx.command('maimai')
    .subcommand('.calc.song <id:number> <difficulty:string> <achievement:number> 根据曲目id、难度及达成率计算DX Rating。')
    .action((_, id, diff, ach) => {

      let error='输入的参数无效。'

      let song = maisonglist.id(id)
      if(song==undefined)return error
      let chart = song.charts[get_difficulty_id(diff)]
      if(chart==undefined||ach>101||ach<0)return error

      let base=chart.ds
      let res=calculate_factor(ach)
      return [
        song.song_info_summary,
        chart.base_summary,
        `达成率： ${ach}% ${res[1]}`,
        `Rating = ${base}*${res[0]}*(${ach}/100) = ${Math.floor((base*res[0]*Math.min(ach,100.5)/100))}`
      ].join('\n')
    })

  ctx.command('maimai')
    .subcommand('.calc.base <base:number> <achievement:number> 根据定数及达成率计算DX Rating。')
    .action((_, base, ach) => {

      if(Math.floor(base*10)!=base*10||ach>101||ach<0)return '输入的参数无效。'

      let res=calculate_factor(ach)
      return [
        `定数： ${base}`,
        `达成率： ${ach}% ${res[1]}`,
        `Rating = ${base}*${res[0]}*(${Math.min(ach,100.5)}/100) = ${Math.floor((base*res[0]*Math.min(ach,100.5)/100))}`
      ].join('\n')

    })

}