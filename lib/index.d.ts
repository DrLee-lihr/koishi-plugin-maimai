import { Context, Schema } from 'koishi';
export declare const name = "maimai";
export interface Config {
    result_num_max: number;
    alias_result_num_max: number;
}
export declare const schema: Schema<{
    result_num_max?: number;
    alias_result_num_max?: number;
} & import("schemastery").Dict<any, string>, {
    result_num_max?: number;
    alias_result_num_max?: number;
} & import("schemastery").Dict<any, string>>;
export declare function apply(ctx: Context, config: Config): void;
