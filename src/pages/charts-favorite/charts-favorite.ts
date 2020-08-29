import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { Platform, NavController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Network } from '@ionic-native/network';
import { SharedService } from '../../services/shared-service';
import { Settings } from '../../interfaces/settings';
import { ChartPage } from '../chart/chart';
import translations from '../../data/translations';

@Component({
    selector: 'page-charts-favorite',
    templateUrl: 'charts-favorite.html'
})

export class ChartsFavoritePage implements OnDestroy {
    private translations           : any;
    private favorites              : any;
    private connectionExists       : boolean;
    private settings               : Settings;
    private connectionSubscritpion : Subscription;

    private goToChart(item: any): void {
        this.navController.push(ChartPage, { 
            item            : item.chartData,
            chartPath       : item.chartPath,
            imagesDirectory : item.imagesDirectory,
            notFromTree     : true
        });
    };    

    constructor(
        private platform      : Platform,
        private navController : NavController,
        private nativeStorage : NativeStorage,
        private network       : Network,
        private sharedService : SharedService
    ) { 
        this.translations = translations;
        this.settings     = new Settings();

        if (this.sharedService.hasInternet()) {
            this.connectionExists = true;
        }
        else {
            this.connectionExists = false;
        };

        this.connectionSubscritpion = this.network.onchange().subscribe(() => {
            if (this.sharedService.hasInternet()) {
                this.connectionExists = true;           
            }
            else {
                this.connectionExists = false;
            };
        });
        
        this.nativeStorage.getItem('settings2').then((settings: Settings) => {
            this.settings = settings;
        });
    };
    
    ionViewDidEnter() {
        this.nativeStorage.getItem('charts').then((chartsCached: any) => {
            this.favorites = chartsCached.favorites;
        });
    };    

    ngOnDestroy() {
        this.connectionSubscritpion.unsubscribe();
    };
};
