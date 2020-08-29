export class Units {
    public unitTemperature : string;
    public unitSpeed       : string;
    public unitPressure    : string;
    public unitMass        : string;
    public unitLength      : {
        s: string;
        m: string;
        l: string;
    };

    constructor() {
        this.unitTemperature = '';
        this.unitSpeed       = '';
        this.unitPressure    = '';
        this.unitMass        = '';
        this.unitLength      = {
            s: '',
            m: '',
            l: ''
        };
    };
};