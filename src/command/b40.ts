import * as fs from "fs";
import { Context } from "koishi";
import { Config } from "..";
import maimai_song_list from "../maimai_song_list";
import sharp from "sharp";
import text_to_svg from "text-to-svg"
import path from "path";
import { difficulty } from "../maichart";



export default function (ctx: Context, config: Config, maisonglist: maimai_song_list) {

  const resource_path = path.dirname(path.dirname(require.resolve('koishi-plugin-maimai'))) + '\\resources'
  const maimai_resource_path = `${resource_path}\\maimai`

  type fc = 'fc' | 'fcp' | 'ap' | 'app' | ''
  type fs = 'fs' | 'fsp' | 'fsd' | 'fsdp' | ''
  type song_result = {
    achievements: number,
    ds: number,
    dxScore: number,
    fc: fc,
    fs: fs,
    level: string,
    level_index: difficulty,
    level_label: 'BASIC' | 'ADVANCED' | 'EXPERT' | 'MASTER' | 'Re:MASTER',
    ra: number,
    rate: 'd' | 'c' | 'b' | 'bb' | 'bbb' | 'a' | 'aa' | 'aaa' | 's' | 'sp' | 'ss' | 'ssp' | 'sss' | 'sssp',
    song_id: number,
    title: string,
    type: "DX" | "SD"
  }

  async function draw_song(a: song_result, rank: number) {

    const tts_sync_fira = text_to_svg.loadSync(resource_path + '\\FiraCode-Medium.ttf')
    const tts_sync = text_to_svg.loadSync()

    async function text2svgbuffer(text: string, size: number, use_fira = true) {

      let gener_img = (i: text_to_svg) => {
        return sharp(Buffer.from(i.getSVG(text, {
          fontSize: size, anchor: 'left top', attributes: { fill: 'white' }
        })))
      }

      let text_img = gener_img(use_fira ? tts_sync_fira : tts_sync)

      if ((await text_img.metadata()).width > 380) return text_img.extract({ left: 0, top: 0, height: size, width: 400 }).toBuffer()
      else return text_img.toBuffer()
    }


    let id: number = a.song_id
    let base = sharp((fs.existsSync(`./cache/maimai/${id}.jpg`)) ?
      fs.readFileSync(`./cache/maimai/${id}.jpg`) :
      await (async () => {
        let buffer = await ctx.http("GET", `https://www.diving-fish.com/covers/${id}.jpg`,
          { responseType: "arraybuffer" });
        (async (buffer: Buffer) => {
          fs.writeFileSync(`./cache/maimai/${id}.jpg`, buffer)
        })(buffer)
        return buffer
      })())

    base = base.resize(400, 400).blur(10).modulate({ brightness: 0.9 })

    let composite_list = [
      {
        input: (await text2svgbuffer(a.title, 50, false)),
        left: 20, top: 20
      },
      {
        input: (await sharp(`${maimai_resource_path}\\${{
          0: 'basic', 1: 'advanced',
          2: 'expert', 3: 'master', 4: 'remaster'
        }[a.level_index]}.png`)
          .resize(null, 43)
          .toBuffer()),
        left: 20, top: 80
      },
      {
        input: (await sharp(`${maimai_resource_path}\\${a.rate}.png`)
          .resize(120)
          .toBuffer()),
        left: 20, top: 110
      },
      {
        input: (await text2svgbuffer(a.achievements.toFixed(4) + '%', 40)),
        left: 150, top: 130
      },
      {
        input: (await text2svgbuffer(`Base:${a.ds.toFixed(1)} -> ${a.ra}`, 34)),
        left: 20, top: 275
      },
      {
        input: (await text2svgbuffer(`#${rank + 1} (${a.type})`, 50)),
        left: 20, top: 330
      },
    ]


    if (a.fc != '') {
      composite_list.push({
        input: (await sharp(`${maimai_resource_path}\\${a.fc}.png`)
          .resize(84)
          .toBuffer()),
        left: 20, top: 180
      })
    }
    if (a.fs != '') {
      composite_list.push({
        input: (await sharp(`${maimai_resource_path}\\${a.fs}.png`)
          .resize(84)
          .toBuffer()),
        left: 140, top: 180
      })
    }

    base = base.composite(composite_list)

    return base
  }


  ctx.command("maimai")
    .subcommand(".b40 [username:string]")
    .action(({ session }, username) => {
      ctx.http.post("https://www.diving-fish.com/api/maimaidxprober/query/player",
        (username == undefined) ? { qq: session.userId } : { username: username })
        .then((result) => {
          //console.log(result)
          draw_song(result.charts.sd[0], 0)
          //throw Error("todo")
        })
    })



  ctx.http.post("https://www.diving-fish.com/api/maimaidxprober/query/player", { qq: 465993851 })
    .then((result) => {
      //console.log(result)
      draw_song(result.charts.sd[0], 0)
      //throw Error("todo")
    })

}