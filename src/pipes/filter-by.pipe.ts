import { Pipe, PipeTransform } from '@angular/core';
import { UpperCasePipe } from '@angular/common/src/pipes';

@Pipe({
    name: 'filterBy'
})

export class FilterByPipe implements PipeTransform {
    transform (value: any, filterString: string): any {
        if (value) {
            if (filterString === '') {
                return;
            };

            const resultArray = [];
    
            for (const item of value){
                let test     = item.location.toUpperCase();

                filterString = filterString.toUpperCase()

                if (test.indexOf(filterString) >= 0){
                    resultArray.push(item);
                };
            };
    
            return resultArray;
        }
        else {
            return;
        };
    };
};