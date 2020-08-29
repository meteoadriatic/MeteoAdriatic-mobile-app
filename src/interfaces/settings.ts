import { Location } from '../interfaces/location';
import { Units } from '../interfaces/units';

export class Settings {
    public language                 : string;
    public locationDefault          : Location;
    public defaultTab               : {
        tab   : number,
        label : string
    };
    public locationBased            : boolean;
    public probabilities            : boolean;
    public chartsImmidieteCache     : boolean;
    public chartsAutoplayTransition : number;
    public units                    : Units;
    public graphs                   : {
        temperature   : boolean,
        precipitation : boolean,
        probabilities : boolean,
        wind          : boolean,
        humidity      : boolean,
        mlcape        : boolean,
        pressure      : boolean,
        height0       : boolean,
        dewpoint      : boolean,
        t850          : boolean
    };  

    constructor() {
        this.language                 = 'hr';
        this.locationDefault          = new Location();
        this.defaultTab               = {
            tab: 0,
            label: ''
        };
        this.locationBased            = false;
        this.probabilities            = false;
        this.chartsImmidieteCache     = false;
        this.chartsAutoplayTransition = 0;
        this.units                    = new Units();
        this.graphs                   = {
            temperature   : false,
            precipitation : false,
            probabilities : false,
            wind          : false,
            humidity      : false,
            mlcape        : false,
            pressure      : false,
            height0       : false,
            dewpoint      : false,
            t850          : false
        };  
    };
};