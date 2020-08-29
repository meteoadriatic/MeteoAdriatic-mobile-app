export class Location {
    public location    : string;
    public coordinates : {
        latitude  : string;
        longitude : string;
        height    : string;
    }[];

    constructor() {
        this.location       = '';
        this.coordinates = [
            {
                latitude  : '',
                longitude : '',
                height    : ''
            }
        ];
    };
};