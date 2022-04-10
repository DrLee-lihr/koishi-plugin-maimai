"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
class default_1 {
    constructor(object, song, difficulty) {
        this.object = object;
        this.song = song;
        this.difficulty = difficulty;
        this.ds = song.object["ds"][difficulty];
        this.chart_summary = `${song.song_info_summary}[${difficulty_name[difficulty]}]`;
        this.chart_summary_with_base = `${this.chart_summary}(${this.ds.toFixed(1)})`;
        this.base_summary = `${difficulty_full_name[difficulty]} ${level_transform(this.ds)}(${this.ds.toFixed(1)})`;
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
exports.default = default_1;
