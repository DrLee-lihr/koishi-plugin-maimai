"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.version_transform_table = exports.page_split = exports.in_level = exports.difficulty_trans_table = exports.difficulty_id = void 0;
exports.difficulty_id = [
    [0, "绿", "bsc", "basic", "bas"],
    [1, "黄", "adv", "advanced"],
    [2, "红", "exp", "expert"],
    [3, "紫", "mas", "master", "mst"],
    [4, "白", "rem", "remaster", "re:master", "remas", "remst"]
];
exports.difficulty_trans_table = { "绿": 0, "黄": 1, "红": 2, "紫": 3, "白": 4 };
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
exports.in_level = in_level;
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
exports.page_split = page_split;
exports.version_transform_table = {
    '真': 'maimai PLUS',
    '超': 'maimai GreeN',
    '檄': 'maimai GreeN PLUS',
    '橙': 'maimai ORANGE',
    '晓': 'maimai ORANGE PLUS',
    '桃': 'maimai PiNK',
    '樱': 'maimai PiNK PLUS',
    '紫': 'maimai MURASAKi',
    '堇': 'maimai MURASAKi PLUS',
    '白': 'maimai MiLK',
    '雪': 'MiLK PLUS',
    '辉': 'maimai FiNALE',
    '熊': 'maimai でらっくす',
    '华': 'maimai でらっくす Splash',
    '爽': 'maimai でらっくす Splash'
};