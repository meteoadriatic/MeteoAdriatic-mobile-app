import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicImageViewerModule } from 'ionic-img-viewer';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AppRate } from '@ionic-native/app-rate';
import { AdMobFree } from '@ionic-native/admob-free';
import { EmailComposer } from '@ionic-native/email-composer';
import { Geolocation } from '@ionic-native/geolocation';
import { Globalization } from '@ionic-native/globalization';
import { NativeStorage } from '@ionic-native/native-storage';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { HTTP } from '@ionic-native/http';

import { FilterByPipe } from '../pipes/filter-by.pipe';
import { FilterByPipe2 } from '../pipes/filter-by2.pipe';

import { SharedService } from '../services/shared-service';

import { MyApp } from './app.component';

import { SelectCityPage } from '../pages/select-city/select-city';
import { TabsPage } from '../pages/tabs/tabs';
import { HomePage } from '../pages/home/home';
import { ForecastTablePage } from '../pages/forecast-table/forecast-table';
import { ForecastGraphsPage } from '../pages/forecast-graphs/forecast-graphs';
import { ForecastChartsPage } from '../pages/forecast-charts/forecast-charts';
import { ChartsFavoritePage } from '../pages/charts-favorite/charts-favorite';
import { ChartsContentsPage } from '../pages/charts-contents/charts-contents';
import { ChartPage } from '../pages/chart/chart';
import { SearchCityModalPage } from '../pages/search-city-modal/search-city-modal';
import { MenuPopoverPage } from '../pages/menu-popover/menu-popover';
import { SettingsPage } from '../pages/settings/settings';
import { LegendsListPage } from '../pages/legends-list/legends-list';
import { LegendIconsPage } from '../pages/legend-icons/legend-icons';
import { LegendWindPage } from '../pages/legend-wind/legend-wind';
import { LegendWeatherPage } from '../pages/legend-weather/legend-weather';
import { AboutAppPage } from '../pages/about-app/about-app';

@NgModule({
    bootstrap: [IonicApp],
    declarations: [
        FilterByPipe,
        FilterByPipe2,
        MyApp,
        SelectCityPage,
        TabsPage,
        HomePage,
        ForecastTablePage,
        ForecastGraphsPage,
        ForecastChartsPage,
        ChartsFavoritePage,
        ChartsContentsPage,
        ChartPage,
        SearchCityModalPage,
        MenuPopoverPage,
        SettingsPage,
        LegendsListPage,
        LegendIconsPage,
        LegendWindPage,
        LegendWeatherPage,
        AboutAppPage
    ],
    imports: [
        BrowserModule,
        IonicImageViewerModule,
        IonicModule.forRoot(MyApp)
    ],
    entryComponents: [
        MyApp,
        SelectCityPage,
        TabsPage,
        HomePage,
        ForecastTablePage,
        ForecastGraphsPage,
        ForecastChartsPage,
        ChartsFavoritePage,
        ChartsContentsPage,
        ChartPage,
        SearchCityModalPage,
        MenuPopoverPage,
        SettingsPage,
        LegendsListPage,
        LegendIconsPage,
        LegendWindPage,
        LegendWeatherPage,
        AboutAppPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        AppRate,
        AdMobFree,
        EmailComposer,
        Geolocation,
        Globalization,
        NativeStorage,
        Network,
        SocialSharing,
        HTTP,
        SharedService,
        {
            provide: ErrorHandler, 
            useClass: IonicErrorHandler
        }
    ]
})

export class AppModule { };