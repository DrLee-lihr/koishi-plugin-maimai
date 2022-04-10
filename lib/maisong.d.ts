import maichart from "./maichart";
export default class {
    id: number;
    object: JSON;
    charts: maichart[];
    has_rem: boolean;
    is_sd: boolean;
    type: string;
    song_info_summary: string;
    song_ds_summary: string;
    basic_info_summary: string;
    constructor(object: JSON);
    get_song_image(): string;
}
