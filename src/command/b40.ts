import * as fs from "fs";
import { Context, segment } from "koishi";
import { Config } from "..";
import sharp from "sharp";
import text_to_svg from "text-to-svg"
import path from "path";
import { difficulty } from "../maichart";



export default function (ctx: Context, config: Config) {

  if (!fs.existsSync('./cache/maimai'))  //希望不要deprecated 谢谢
    fs.mkdirSync('./cache/maimai', { recursive: true })

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

  const tts_sync_fira = text_to_svg.loadSync(resource_path + '\\FiraCode-Medium.ttf')
  const tts_sync = text_to_svg.loadSync()
  async function text2svgbuffer(text: string, size: number, use_fira = true, use_extract = true,
    color = 'white') {

    let gener_img = (i: text_to_svg) => {
      return sharp(Buffer.from(i.getSVG(text, {
        fontSize: size, anchor: 'left top', attributes: { fill: color }
      })))
    }

    let text_img = gener_img(use_fira ? tts_sync_fira : tts_sync)

    if (use_extract && (await text_img.metadata()).width > 190)
      return text_img.extract({ left: 0, top: 0, height: size, width: 200 }).toBuffer()
    else return text_img.toBuffer()
  }

  async function draw_song(a: song_result, rank: number) {

    let id: number = a.song_id
    let cachePath = path.resolve(`./cache/maimai/${id}.jpg`)
    let base = sharp((fs.existsSync(cachePath)) ?
      fs.readFileSync(cachePath) :
      await (async () => {
        let response_failed = false
        let buffer = await ctx.http("GET", `https://www.diving-fish.com/covers/${id}.jpg`,
          { responseType: "arraybuffer" }).catch((_) => { response_failed = true; return undefined }) ??
          fs.readFileSync(path.resolve(maimai_resource_path, "no_image.png"))
        if (!response_failed) {
          (async (buffer: Buffer) => {
            fs.writeFileSync(cachePath, buffer)
          })(buffer)
        }
        return buffer
      })())

    base = base.resize(200, 200).blur(10).modulate({ brightness: 0.9 })

    let composite_list = [
      {
        input: (await text2svgbuffer(a.title, 25, false)),
        left: 10, top: 10
      },
      {
        input: (await sharp(`${maimai_resource_path}\\${{
          0: 'basic', 1: 'advanced',
          2: 'expert', 3: 'master', 4: 'remaster'
        }[a.level_index]}.png`)
          .resize(null, 21)
          .toBuffer()),
        left: 10, top: 40
      },
      {
        input: (await sharp(`${maimai_resource_path}\\${a.rate}.png`)
          .resize(60)
          .toBuffer()),
        left: 10, top: 55
      },
      {
        input: (await text2svgbuffer(a.achievements.toFixed(4) + '%', 20)),
        left: 75, top: 65
      },
      {
        input: (await text2svgbuffer(`Base:${a.ds.toFixed(1)} -> ${a.ra}`, 17)),
        left: 10, top: 138
      },
      {
        input: (await text2svgbuffer(`#${rank + 1} (${a.type})`, 25)),
        left: 10, top: 165
      },
    ]


    if (a.fc != '') {
      composite_list.push({
        input: (await sharp(`${maimai_resource_path}\\${a.fc}.png`)
          .resize(42)
          .toBuffer()),
        left: 10, top: 90
      })
    }
    if (a.fs != '') {
      composite_list.push({
        input: (await sharp(`${maimai_resource_path}\\${a.fs}.png`)
          .resize(42)
          .toBuffer()),
        left: 70, top: 90
      })
    }

    base = base.composite(composite_list)

    return base.toBuffer()
  }

  ctx.command("maimai")
    .subcommand(".b40 [username] 根据用户名/QQ号获取b40图片。")
    .action(async ({ session }, username) => {
      session.send("处理中，请稍候……")

      return await ctx.http.post("https://www.diving-fish.com/api/maimaidxprober/query/player",
        (username == undefined) ?
          { qq: session.userId } :
          (/^\[CQ:at,id=([0-9]*)]$/.test(username) ?
            { qq: username.match(/^\[CQ:at,id=([0-9]*)]$/)[1] } :
            { username: username })
      )
        .then(async (result) => {

          let background = sharp(`${maimai_resource_path}\\b40.png`)

          let composite_list = [
            {
              input: (await text2svgbuffer(
                result.rating.toString().padStart(4, ' ') + '+' +
                result.additional_rating.toString().padStart(4, ' ') + '='
                + (result.rating + result.additional_rating).toString(), 50, true, false, 'black'
              )),
              left: 400, top: 24
            },
            {
              input: (await text2svgbuffer(
                result["nickname"], 80, true, false, 'black'
              )),
              left: 400, top: 100
            }
          ]

          if (result.plate != '' && result.plate != null) {
            composite_list.push({
              input: (await text2svgbuffer(result.plate, 160, false, false, 'black'
              )),
              left: 1000, top: 20
            })
          }

          for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
              composite_list.push(
                {
                  input: await draw_song(result.charts.sd[i * 5 + j], i * 5 + j),
                  left: 10 + j * 225, top: 220 + i * 225
                }
              )
            }
            for (var j = 0; j < 3; j++) {
              composite_list.push(
                {
                  input: await draw_song(result.charts.dx[i * 3 + j], i * 3 + j),
                  left: 1160 + j * 225, top: 220 + i * 225
                }
              )
            }
          }
          return (segment.image(await background.composite(composite_list).toBuffer()))

        }).catch((e) => {
          console.log(e)
          if (e.message == 'Request failed with status code 400') return '用户未找到，请确保'
            + (username == undefined ? '用户已在查分器中绑定QQ号。' : '输入的用户名正确。')
          if (e.message == 'Request failed with status code 403') return '该用户禁止了其他人获取数据。'
        })
    })
}