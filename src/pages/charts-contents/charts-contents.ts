import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ChartPage } from '../chart/chart';

@Component({
    selector: 'page-charts-contents',
    templateUrl: 'charts-contents.html'
})

export class ChartsContentsPage {
    private item            : any;
    private imagesDirectory : string;
    
    private goToContents(subItem: any): void {
        let chartPath: string[] = Object.assign([], this.navParams.data.chartPath);
        
        chartPath.push(subItem.name);

        this.navController.push(ChartsContentsPage, { 
            item            : subItem,
            imagesDirectory : this.imagesDirectory + '/',
            chartPath       : chartPath
        });
    };
    
    private goToChart(subItem: any): void {
        this.navController.push(ChartPage, { 
            item: subItem,
            imagesDirectory: this.imagesDirectory + '/', 
            chartPath: this.navParams.data.chartPath
        });
    };

    constructor (
        private navController : NavController,
        private navParams     : NavParams
    ) {
        this.item            = this.navParams.data.item;
        this.imagesDirectory = this.navParams.data.imagesDirectory + this.navParams.data.item.directory;
     };
};
