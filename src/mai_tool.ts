/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
import path from 'path'
import text_to_svg from 'text-to-svg'
import { Context } from 'koishi'
import { Config, maisonglist } from '.'
import { difficulty } from './maichart'
import maisong from './maisong'
import { alias_get } from './command/alias'

export const resource_path = `${path.dirname(path.dirname(require.resolve('koishi-plugin-maimai')))}\\resources`
export const maimai_resource_path = `${resource_path}\\maimai`

export const tts_fira = text_to_svg.loadSync(`${resource_path}\\FiraCode-Medium.ttf`)
export const tts = text_to_svg.loadSync()

export const diff = {
  BASIC: 0,
  ADVANCED: 1,
  EXPERT: 2,
  MASTER: 3,
  REMASTER: 4,
}

export type payload_data = { qq: number | string } | { username: string }

const difficulty_id: string[][] = [
  ['0', '绿', 'bsc', 'basic', 'bas'],
  ['1', '黄', 'adv', 'advanced'],
  ['2', '红', 'exp', 'expert'],
  ['3', '紫', 'mas', 'master', 'mst'],
  ['4', '白', 'rem', 'remaster', 're:master', 'remas', 'remst'],
]

export function get_difficulty_id(s: string): difficulty { // TODO:什么时候能把这个改一改 太不优雅了
  let diffid = 3
  for (let i = 0; i <= 4; i += 1) {
    for (const k of difficulty_id[i]) {
      if (s === k) {
        diffid = i
        break
      }
    }
  }
  return diffid as difficulty
}

export const difficulty_trans_table = {
  绿: 0, 黄: 1, 红: 2, 紫: 3, 白: 4,
}
export function in_level(pred: number, level: string) {
  if (level.includes('.')) {
    return Number.parseFloat(level) === pred
  }
  if (level.includes('+')) {
    return Number.parseInt(level.split('+')[0], 10) + 0.65 <= pred && pred <= Number.parseInt(level.split('+')[0], 10) + 0.95
  }
  return Number.parseInt(level, 10) - 0.05 <= pred && pred <= Number.parseInt(level, 10) + 0.65
}

/**
 * 分页消息
 * @param list 要分页的字符串列表
 * @param config 插件设置项
 * @param page_num 获取的页的页码
 * @param result_prefix 结果前缀信息
 */
export function page_split(list: string[], config: Config, page_num: number, result_prefix?: string):string

/**
 * 分页消息（经处理）
 * @param list 要分页的对象列表
 * @param config 插件设置项
 * @param page_num 获取的页的页码
 * @param result_prefix 结果前缀信息
 * @param converter 把对象转成字符串的函数
 */
export function page_split<T>(list: T[], config: Config, page_num: number, result_prefix: string,
  converter: (v: T) => string):string

export function page_split<T = string>(
  list: string[] | T[],
  config: Config,
  page_num = 1,
  result_prefix = '查询结果：',
  converter:(v:T)=>string = (v:T) => v.toString(),
) {
  const page = page_num === undefined ? 0 : page_num - 1
  const list_num = Math.floor(list.length / config.result_num_max) + ((list.length % config.result_num_max) === 0 ? 0 : 1)
  if (list_num <= page || page < 0) { return `所请求的页不存在（共${list_num}页）。` }

  if (typeof list[0] === 'string') {
    return `${result_prefix}\n${list.slice(page * 10, Math.min(page * 10 + 10, list.length))
      .join('\n')}\n第${page + 1}页，共${list_num}页`
  }

  const res = (list as T[]).slice(page * 10, Math.min(page * 10 + 10, list.length)).map(converter)
  return `${result_prefix}\n${res.join('\n')}\n第${page + 1}页，共${list_num}页`
}

export async function identify(identifier:string, ctx:Context):Promise<maisong> {
  let result:maisong
  let id:number
  try {
    id = Number.parseInt(identifier, 10)
    result = maisonglist.id(id)
    if (result === undefined) throw Error()
    else return result
  }
  catch {
    let res = maisonglist.filter((v) => v.title === identifier)
    if (res.length !== 0) return res[0]
    res = maisonglist.filter((v) => v.title.toLowerCase().includes(identifier.toLowerCase()))
    if (res.length === 1) return res[0]
    const alias = await alias_get(identifier, ctx)
    if (alias === undefined) throw Error()
    try {
      (alias as maisong).get_song_image()
      return alias as maisong
    }
    catch { throw Error() }
  }
}

export const version_transform_table = {
  真: 'maimai PLUS',
  超: 'maimai GreeN',
  檄: 'maimai GreeN PLUS',
  橙: 'maimai ORANGE',
  晓: 'maimai ORANGE PLUS',
  桃: 'maimai PiNK',
  樱: 'maimai PiNK PLUS',
  紫: 'maimai MURASAKi',
  堇: 'maimai MURASAKi PLUS',
  白: 'maimai MiLK',
  雪: 'MiLK PLUS', // sic
  辉: 'maimai FiNALE',
  熊: 'maimai でらっくす',
  华: 'maimai でらっくす',
  爽: 'maimai でらっくす Splash',
  煌: 'maimai でらっくす Splash',
}

export const difficulty_name: string[] = ['BSC', 'ADV', 'EXP', 'MAS', 'ReM']
export const difficulty_full_name: string[] = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']
export const level_transform = (i: number) => {
  if (i < 7) return Math.floor(i)
  if (i - Math.floor(i) > 0.65) return `${Math.floor(i)}+`
  return Math.floor(i)
}
