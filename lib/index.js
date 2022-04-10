"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.schema = exports.name = void 0;
const koishi_1 = require("koishi");
const maimai_song_list_1 = __importDefault(require("./maimai_song_list"));
//command modules
const info_1 = __importDefault(require("./command/info"));
const alias_1 = __importDefault(require("./command/alias"));
const random_1 = __importDefault(require("./command/random"));
const b40_1 = __importDefault(require("./command/b40"));
exports.name = 'maimai';
exports.schema = koishi_1.Schema.object({
    result_num_max: koishi_1.Schema.number().default(10).description("返回搜索结果时单次最多显示的结果数量。"),
    alias_result_num_max: koishi_1.Schema.number().default(3).description("返回别名搜索结果时最多显示的结果数量。")
});
function apply(ctx, config) {
    var maisonglist = new maimai_song_list_1.default(ctx);
    maisonglist.promise.then(() => {
        (0, info_1.default)(ctx, config, maisonglist);
        (0, alias_1.default)(ctx, config, maisonglist);
        (0, random_1.default)(ctx, config, maisonglist);
        (0, b40_1.default)(ctx, config, maisonglist);
    });
}
exports.apply = apply;
