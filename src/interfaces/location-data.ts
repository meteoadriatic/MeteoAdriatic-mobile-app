export class LocationData {
    public location : string;
    public data     : {
        date     : string;
        weekday  : string;
        forecast : {
            hour        : string;
            weather     : string;
            wind        : string;
            fog         : string;
            tstorm      : string;
            temperature : string;
            dewpoint    : string;
            mslp        : string;
            h0m         : string;
            t850        : string;
            mlcape      : string;
            humidity    : string;
            prec        : string;
            wdir        : string;
            wspd        : string;
            gust        : string;
            precpct     : string;
            snowpct     : string;
            tstormpct   : string;
        }[]
    }[];

    constructor() {
        this.location = null;
        this.data = null;
    };
};