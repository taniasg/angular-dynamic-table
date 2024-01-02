import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { TableComponent } from './table.component';

// CustomPaginator
import { CustomMatPaginatorIntl } from './custom-paginator';

// Directive
import { CdkDetailRowDirective } from './cdk-detail-row.directive';

// Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [TableComponent, CdkDetailRowDirective],
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatButtonModule,
        MatSlideToggleModule,
        ReactiveFormsModule,
        FormsModule,
        MatProgressBarModule,
        MatSelectModule,
        MatTooltipModule,
        MatButtonModule,
    ],
    exports: [TableComponent],
    providers: [
        {
            provide: MatPaginatorIntl,
            useClass: CustomMatPaginatorIntl
        }
    ],
})
export class TableModule { }