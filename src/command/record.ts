import { s } from "koishi";
import { Context } from "koishi";
import sharp from "sharp";
import { Config, maisonglist } from "..";
import { difficulty } from "../maichart";
import { page_split, processed_page_split, tts, version_transform_table } from "../mai_tool";
import { fc, fs, query_player } from "./b40";
import TextToSvg from 'text-to-svg'


type record={
  achievements: number,
  fc: fc,
  fs: fs,
  id: number,
  level: string,
  level_index: difficulty,
  title: string,
  type: "DX" | "SD"
}
interface version_list {
  verlist: record[]
}

export default function record(ctx: Context, config: Config) {

  async function get_record(data:{qq:number}|{username:string}):Promise<version_list> {
    data['version']=Object.values(version_transform_table)
    console.log(Object.defineProperty(data,'version',Object.values(version_transform_table)))
    return await 
      ctx.http.post('https://www.diving-fish.com/api/maimaidxprober/query/plate',
        data
    ).catch(console.log)
  }

  let gener_img = (i: TextToSvg,text:string) => {
    //FIXME: 文字不会换行
    return sharp(Buffer.from(i.getSVG(text, {
      fontSize: 50, anchor: 'left top', attributes: { fill: 'black' }
    })))
  }

  ctx.command('maimai')
    .subcommand('.record.level <level:string> [username:string] 获取对应标级的谱面的分数。')
    .option('page', '-p <page:number> 当结果有多页时要输出的页码。')
    .action(async ({ session, options }, level, username) => {

      let data:{qq:number}|{username:string}
      if (username == undefined) {
        if(session.platform!='onebot')return '请提供用户名。'
        else data={qq:Number.parseInt(session.userId)}
      }
      else data={username:username}
      let result = await get_record(data)
      let list = result.verlist.filter(v => v.level == level)
        .sort((a,b)=>b.achievements-a.achievements)

      let text = processed_page_split<record>(
        list, config, options.page, `${username??session.username} 的 ${level} 分数列表：`,
        v => `${v.achievements}% ` +
            maisonglist.id(v.id).charts[v.level_index].chart_summary_with_base
        )
      
      
  
      return s.image(await gener_img(tts,text).toBuffer())

    })
    .shortcut(/^((?:[1-9])|(?:1[0-5])\+?)分数列表(?: ([0-9]{1,}))?$/, 
      { args: ['$1'], options: { page: '$2' } })

  ctx.command('maimai')
    .subcommand('.record.base <base:number> [username:string] 获取对应定数的谱面的分数。')
    .option('page', '-p <page:number> 当结果有多页时要输出的页码。')
    .action(async ({ session, options }, base, username) => {

      let data:{qq:number}|{username:string}
      if (username == undefined) {
        if(session.platform!='onebot')return '请提供用户名。'
        else data={qq:Number.parseInt(session.userId)}
      }
      else data={username:username}
      let result = await get_record(data)

      let res:string[]=[]

      let list = result.verlist.sort((a,b)=>b.achievements-a.achievements).forEach(
        (v)=>{
          let song=maisonglist.id(v.id)
          if(song.charts[v.level_index].ds==base)
            res.push(
              `${v.achievements}% ` +
              maisonglist.id(v.id).charts[v.level_index].chart_summary_with_base
            )
        }
      )


      let text =  page_split(
        res, config, options.page, `${username??session.username} 的 ${base} 分数列表：`
        )

      return s.image(await gener_img(tts,text).toBuffer())
    })

}