"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = void 0;
const koishi_1 = require("koishi");
exports.name = 'maimai';
exports.schema = koishi_1.Schema.object({
    result_num_max: koishi_1.Schema.number().default(10).description("返回搜索结果时单次最多显示的结果数量。"),
    alias_result_num_max: koishi_1.Schema.number().default(3).description("返回别名搜索结果时最多显示的结果数量。")
});
var difficulty_name = ["BSC", "ADV", "EXP", "MAS", "ReM"];
var difficulty_full_name = ["Basic", "Advanced", "Expert", "Master", "Re:Master"];
var level_transform = (i) => {
    if (i < 7)
        return Math.floor(i);
    else if (i - Math.floor(i) > 0.65)
        return `${Math.floor(i)}+`;
    else
        return Math.floor(i);
};
var difficulty_id = [
    [0, "绿", "bsc", "basic", "bas"],
    [1, "黄", "adv", "advanced"],
    [2, "红", "exp", "expert"],
    [3, "紫", "mas", "master", "mst"],
    [4, "白", "rem", "remaster", "re:master", "remas", "remst"]
];
class maichart {
    constructor(object, song, difficulty) {
        this.object = object;
        this.song = song;
        this.difficulty = difficulty;
        this.ds = song.object["ds"][difficulty];
        this.chart_summary = `${song.song_info_summary}[${difficulty_name[difficulty]}]`;
        this.chart_summary_with_base = `${this.chart_summary}(${this.ds})`;
        this.base_summary = `${difficulty_full_name[difficulty]} ${level_transform(this.ds)}(${this.ds})`;
        var note_list = [`TAP: ${object["notes"][0]}`, `HOLD: ${object["notes"][1]}`,
            `SLIDE: ${object["notes"][2]}`];
        note_list.push(`${song.is_sd ? "BREAK" : "TOUCH"}: ${object["notes"][3]}`);
        if (!song.is_sd)
            note_list.push(`BREAK: ${object["notes"][4]}`);
        note_list.push(`charter: ${object["charter"]}`);
        this.note_summary = note_list.join("\n");
    }
    get_probe_data(ctx) {
        return ctx.http("GET", `https://maimai.ohara-rinne.tech/api/chart/${this.song.id}/${this.difficulty}`).then((response) => {
            var object = response["data"];
            this.probe_summary = [`tag:${object["tag"]}`,
                `共有${object["playerCount"]}名玩家游玩了该谱面，平均达成率：${object["average"]}`,
                `其中${object["ssscount"]}人（${Math.floor((object["ssscount"] / object["playerCount"]) * 10000) / 100}%）达成SSS`,
                `SSS人数在同级别曲目中排名：（${object["difficultyRankInSameLevel"] + 1}/${object["songCountInSameLevel"]}）`].join("\n");
        });
    }
}
class maisong {
    constructor(object) {
        this.id = object["id"];
        this.object = object;
        this.has_rem = object["charts"].length == 5;
        this.is_sd = object["type"] == "SD";
        this.type = object["type"];
        this.song_info_summary = `${this.id}.${object["title"]}(${this.type})`;
        this.song_ds_summary = object["ds"].join("/");
        this.basic_info_summary = [`artist: ${this.object["basic_info"]["artist"]}`, `genre: ${this.object["basic_info"]["genre"]}`,
            `bpm: ${this.object["basic_info"]["bpm"]}`, `version: ${this.object["basic_info"]["from"]}`].join("\n");
        var templist = [];
        for (var i = 0; i < object["charts"].length; i++) {
            var chart = new maichart(object["charts"][i], this, i);
            templist.push(chart);
        }
        this.charts = templist;
    }
    get_song_image() {
        return (0, koishi_1.segment)("image", { url: "https://www.diving-fish.com/covers/" + this.id + ".jpg" });
    }
}
class maimai_song_list {
    constructor(ctx) {
        ctx.http("GET", "https://www.diving-fish.com/api/maimaidxprober/music_data").then((response) => {
            this.jsonArray = response;
            this.chart_list = [];
            var templist = [];
            for (var i = 0; i < this.jsonArray.length; i++) {
                var song = new maisong(this.jsonArray[i]);
                for (var j = 0; j <= (song.has_rem ? 4 : 3); j++)
                    this.chart_list.push(song.charts[j]);
                templist.push(song);
            }
            this.list = templist;
        });
    }
    id(id) {
        return this.filt((s) => s.id == id)[0];
    }
    filt(filter) {
        var result = [];
        for (var i = 0; i < this.list.length; i++) {
            if (filter(this.list[i])) {
                result.push(this.list[i]);
            }
        }
        return result;
    }
    filt_chart(filter) {
        var result = [];
        for (var i = 0; i < this.chart_list.length; i++) {
            if (filter(this.chart_list[i])) {
                result.push(this.chart_list[i]);
            }
        }
        return result;
    }
}
function page_split(list, config, page_num = 1) {
    var page = page_num == undefined ? 0 : page_num - 1;
    var list_num = Math.floor(list.length / config.result_num_max) + ((list.length % config.result_num_max) == 0 ? 0 : 1);
    if (list_num <= page || page < 0)
        return `所请求的页不存在（共${list_num}页）。`;
    var temp = [];
    for (var i = page * 10; i < (page + 1) * 10; i++) {
        if (i >= list.length)
            break;
        temp.push(list[i]);
    }
    return `查询结果：\n${temp.join("\n")}\n第${page + 1}页，共${list_num}页`;
}
function apply(ctx, config) {
    var maisonglist = new maimai_song_list(ctx);
    ctx.command("maimai <id:number> [diff:string] 根据id或难度查询乐曲或谱面信息。")
        .action((argv, id, diff) => {
        var song = maisonglist.id(id);
        if (song == undefined) {
            return "未找到乐曲。";
        }
        else if (diff == undefined) {
            return [song.song_info_summary, song.get_song_image(), song.song_ds_summary, song.basic_info_summary].join("\n");
        }
        else {
            var diffid = 5;
            for (var i = 0; i <= 4; i++) {
                for (var j = 0; j < difficulty_id[i].length; j++) {
                    if (diff == difficulty_id[i][j]) {
                        diffid = difficulty_id[i][0];
                        break;
                    }
                }
            }
            var chart = song.charts[diffid];
            chart.get_probe_data(ctx).then(() => {
                argv.session.send([song.song_info_summary,
                    song.get_song_image(), chart.base_summary, chart.note_summary, chart.probe_summary].join("\n"));
            });
            return;
        }
    })
        .alias("m");
    ctx.command("maimai")
        .subcommand(".search <content:text> 根据给出的曲目查找曲目。")
        .action((_, content) => {
        var result = [];
        maisonglist.filt((i) => i.object["title"].toLowerCase().includes(content.toLowerCase()))
            .forEach(element => {
            result.push(element.song_info_summary);
        });
        if (result.length > config.result_num_max) {
            return `搜索结果过多（大于${config.result_num_max}条），请尝试使用更准确的内容进行搜索。`;
        }
        if (result.length == 0)
            return "无搜索结果。";
        else
            return result.join("\n");
    });
    ctx.command("maimai")
        .subcommand(".artist <artist:string> 搜索对应曲师的作品。")
        .option("page", "-p [page:number] 当结果有多页时设定要输出的页码。", { fallback: 1 })
        .action(({ options }, artist) => {
        var list = maisonglist.filt((i) => i.object["basic_info"]["artist"].toLowerCase().includes(artist.toLowerCase()));
        if (list.length == 0)
            return "未找到结果，请尝试使用曲师的名义原文本进行搜索。";
        var temp = [];
        list.forEach((element) => { temp.push(element.song_info_summary); });
        return page_split(temp, config, options.page);
    });
    ctx.command("maimai")
        .subcommand(".charter <charter:string>  搜索对应谱师创作的谱面（定数降序排序）。")
        .option("page", "-p [page:number] 当结果有多页时设定要输出的页码。", { fallback: 1 })
        .action(({ options }, charter) => {
        var list = maisonglist.filt_chart((i) => i.object["charter"].toLowerCase().includes(charter.toLowerCase()));
        if (list.length == 0)
            return "未找到结果，请尝试使用谱师的名义原文本进行搜索。";
        list.sort((a, b) => b.ds - a.ds);
        var temp = [];
        list.forEach((element) => { temp.push(element.chart_summary_with_base); });
        return page_split(temp, config, options.page);
    })
        .shortcut(/^我要大战([^\s]*)$/, { args: ["$1"] })
        .shortcut(/^我要大战([^\s]*) ([0-9]*)$/, { args: ["$1"], options: { page: "$2" } });
    ctx.command("maimai")
        .subcommand(".bpm <bpm1:number> [bpm2:number] 获取给定BPM的（或给定BPM区间内）的曲目。")
        .option("page", "-p [page:number] 当结果有多页时设定要输出的页码。", { fallback: 1 })
        .action((_, bpm1, bpm2) => {
        if (bpm2 == undefined) {
            var result = [];
            maisonglist.filt((song) => song.object["basic_info"]["bpm"] == bpm1)
                .forEach((element) => result.push(element.song_info_summary));
            return page_split(result, config);
        }
        else {
            var result = [];
            maisonglist.filt((song) => (song.object["basic_info"]["bpm"] >= bpm1 && song.object["basic_info"]["bpm"] <= bpm2) ||
                (song.object["basic_info"]["bpm"] <= bpm1 && song.object["basic_info"]["bpm"] >= bpm2))
                .forEach((element) => result.push(element.song_info_summary));
            return page_split(result, config);
        }
    });
    ctx.command("maimai")
        .subcommand(".alias.get <id:number> 获取id对应乐曲的别名。")
        .action((argv, id) => {
        ctx.http("GET", "https://maimai.ohara-rinne.tech/api/alias/" + id).then((response) => {
            argv.session.send(maisonglist.id(id).song_info_summary + "有如下别名：\n" + response["data"].join("\n"));
        });
    })
        .shortcut(/^([0-9]*)有什么别名$/, { args: ["$1"] });
    ctx.command("maimai")
        .subcommand(".alias.lookup <alias:text> 根据别名查询乐曲。")
        .action((argv, alias) => {
        ctx.http("GET", encodeURI("https://maimai.ohara-rinne.tech/api/alias/query/" + alias)).then((response) => {
            if (response["data"].length == 0) {
                argv.session.send("没有找到您想找的乐曲。");
                return;
            }
            else if (response["data"].length > config.alias_result_num_max) {
                argv.session.send(`搜索结果过于宽泛（大于${config.alias_result_num_max}条），请尝试使用更准确更大众的别名进行搜索。`);
                return;
            }
            else if (response["data"].length > 1) {
                var res = [];
                response["data"].forEach((element) => {
                    res.push(maisonglist.id(element["musicId"]).song_info_summary);
                });
                argv.session.send("您要找的可能是以下歌曲中的一首：\n" + res.join("\n"));
                return;
            }
            else {
                var song = maisonglist.id(response["data"][0]["musicId"]);
                argv.session.send(`您要找的是不是：\n${song.song_info_summary}` + song.get_song_image() + song.song_ds_summary);
            }
        });
    })
        .shortcut(/^(.*)是什么歌$/, { args: ["$1"] });
    ctx.command("maimai")
        .subcommand(".random 随机谱面。")
        .option("level", "-l [level:string] 谱面标级。", { fallback: "歌" })
        .option("artist", "-a [artist:string] 曲师。", { fallback: "" })
        .option("charter", "-c [charter:string] 谱师。", { fallback: "" })
        .option("difficulty", "-d [difficulty:string] 谱面颜色。")
        .option("type", "-t [type:string] 谱面类型（标准/DX）。", { fallback: "" })
        .option("version", "-v [version:string] 谱面版本。", { fallback: "" })
        .action(({ options }) => {
        console.log(options);
        var result = maisonglist.filt_chart((chart) => {
            var transform_table = { "绿": 0, "黄": 1, "红": 2, "紫": 3, "白": 4 };
            function in_level(pred, level) {
                if (level.includes(".")) {
                    return Number.parseFloat(level) == pred;
                }
                if (level.includes("+")) {
                    return Number.parseInt(level.split("+")[0]) + 0.65 <= pred && pred <= Number.parseInt(level.split("+")[0]) + 0.95;
                }
                else
                    return Number.parseInt(level) - 0.05 <= pred && pred <= Number.parseInt(level) + 0.65;
            }
            var get_from = (id) => maisonglist.id(id).object["basic_info"]["from"];
            var version_transform_table = {
                "真": get_from(143),
                "超": get_from(227),
                "檄": get_from(233),
                "橙": get_from(384),
                "晓": get_from(365),
                "桃": get_from(456),
                "樱": get_from(496),
                "紫": get_from(589),
                "堇": get_from(664),
                "白": get_from(689),
                "雪": get_from(746),
                "辉": get_from(844),
                "熊": get_from(11106),
                "华": get_from(11142),
                "爽": get_from(11216), //felys -final remix-
            };
            return ((options.level != "歌") ? (in_level(chart.ds, options.level)) : true) &&
                (chart.song.object["basic_info"]["artist"].toLowerCase().includes(options.artist.toLowerCase())) &&
                (chart.object["charter"].toLowerCase().includes(options.charter.toLowerCase())) &&
                (options.difficulty == "" ? true : (chart.difficulty == transform_table[options.difficulty])) &&
                (options.type != "" ? ((chart.song.is_sd ? "标准" : "DX") == options.type) : true) &&
                (options.version != "" ? (chart.song.object["basic_info"]["from"] == version_transform_table[options.version]) : true);
        });
        var chart = result[Math.floor(Math.random() * 10000) % result.length];
        return [`从${result.length}个符合条件的结果中随机：`, chart.chart_summary,
            chart.song.get_song_image(), chart.base_summary].join("\n");
    })
        .shortcut(/^随个(?:((?:[^写代]*?)(?!写|代))的)?(?:([^代的]*?)写的)?(?:([^写的])代的)?(标准|DX)?(绿|黄|红|紫|白)?([0-9\.+歌]*)$/, { options: { artist: "$1", charter: "$2", version: "$3", type: "$4", difficulty: "$5", level: "$6" } })
        .shortcut(/^随个(?:([^代的]*?)写的)?(?:((?:[^写代]*?)(?!写|代))的)?(?:([^写的])代的)?(标准|DX)?(绿|黄|红|紫|白)?([0-9\.+歌]*)$/, { options: { artist: "$1", charter: "$2", version: "$3", type: "$4", difficulty: "$5", level: "$6" } })
        .example("m.random -l 14+ -c @dp -a t+pazolite -v 辉 -d 3 -t 标准  随机一张由@DP写的、t+pazolite作曲的、FiNALE版本的标准紫14+谱面。")
        .example("随个Tsukasa的玉子豆腐写的真代的标准白14.5")
        .example("随个Frums的白代歌")
        .usage("注意：在使用正则快速调用时，参数需要按以下顺序排列：\n([曲师]/[谱师])[版本][标准|DX][颜色][标级]\n曲师和谱师可以调换位置。")
        .usage("前四项参数可以省略；当想不对标级进行过滤时，使用“歌”来替代。");
}
exports.apply = apply;
