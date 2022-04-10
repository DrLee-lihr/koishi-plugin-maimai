"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maisong_1 = __importDefault(require("./maisong"));
class default_1 {
    constructor(ctx) {
        this.promise = ctx.http("GET", "https://www.diving-fish.com/api/maimaidxprober/music_data").then((response) => {
            this.jsonArray = response;
            this.chart_list = [];
            this.list = [];
            for (var i = 0; i < this.jsonArray.length; i++) {
                var song = new maisong_1.default(this.jsonArray[i]);
                for (var j = 0; j <= (song.has_rem ? 4 : 3); j++)
                    this.chart_list.push(song.charts[j]);
                this.list.push(song);
            }
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
exports.default = default_1;
