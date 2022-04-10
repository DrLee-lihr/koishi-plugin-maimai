import { Context } from "koishi";
import maisong from "./maisong";
export default class {
    song: maisong;
    object: JSON;
    difficulty: number;
    ds: number;
    chart_summary: string;
    base_summary: string;
    chart_summary_with_base: string;
    note_summary: string;
    probe_summary: string;
    constructor(object: JSON, song: maisong, difficulty: number);
    get_probe_data(ctx: Context): Promise<void>;
}
