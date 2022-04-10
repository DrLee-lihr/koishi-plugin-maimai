"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koishi_1 = require("koishi");
const maichart_1 = __importDefault(require("./maichart"));
class default_1 {
    constructor(object) {
        this.id = object["id"];
        this.object = object;
        this.has_rem = object["charts"].length == 5;
        this.is_sd = object["type"] == "SD";
        this.type = object["type"];
        this.song_info_summary = `${this.id}.${object["title"]}(${this.type})`;
        var k = [];
        object["ds"].forEach((it) => k.push(it.toFixed(1)));
        this.song_ds_summary = k.join("/");
        this.basic_info_summary = [`artist: ${this.object["basic_info"]["artist"]}`, `genre: ${this.object["basic_info"]["genre"]}`,
            `bpm: ${this.object["basic_info"]["bpm"]}`, `version: ${this.object["basic_info"]["from"]}`].join("\n");
        this.charts = [];
        for (var i = 0; i < object["charts"].length; i++) {
            var chart = new maichart_1.default(object["charts"][i], this, i);
            this.charts.push(chart);
        }
    }
    get_song_image() {
        return (0, koishi_1.segment)("image", { url: "https://www.diving-fish.com/covers/" + this.id + ".jpg" });
    }
}
exports.default = default_1;
