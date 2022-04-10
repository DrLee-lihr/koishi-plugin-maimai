"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(ctx, config, maisonglist) {
    ctx.command("maimai")
        .subcommand(".b40 [username:string]")
        .action(({ session }, username) => {
        ctx.http.post("https://www.diving-fish.com/api/maimaidxprober/query/player", (username == undefined) ? { qq: session.userId } : { username: username })
            .then((result) => {
            console.log(result);
            throw Error("todo");
        });
    });
}
exports.default = default_1;
