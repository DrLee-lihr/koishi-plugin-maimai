import { Context } from "koishi";
import maichart from "./maichart";
import maisong from "./maisong";
export default class {
    jsonArray: JSON[];
    list: maisong[];
    chart_list: maichart[];
    promise: Promise<any>;
    constructor(ctx: Context);
    id(id: number): maisong;
    filt(filter: (i: maisong) => boolean): maisong[];
    filt_chart(filter: (i: maichart) => boolean): maichart[];
}
