import { Component } from '@angular/core';
import { Column } from './models/column.model';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'angular-dynamic-table';

    logs: any[] = [
        {
            id: "1",
            grupoCompania: "testito",
            compania: "testito",
            usuario: "testito",
            modulo: "testito",
            submodulo: "testito",
        },
        {
            id: "2",
            grupoCompania: "testito",
            compania: "testito",
            usuario: "testito",
            modulo: "testito",
            submodulo: "testito",
        },
        {
            id: "3",
            grupoCompania: "testito",
            compania: "testito",
            usuario: "testito",
            modulo: "testito",
            submodulo: "testito",
        },
        {
            id: "4",
            grupoCompania: "testito",
            compania: "testito",
            usuario: "testito",
            modulo: "testito",
            submodulo: "testito",
        },
        {
            id: "5",
            grupoCompania: "testito",
            compania: "testito",
            usuario: "testito",
            modulo: "testito",
            submodulo: "testito",
        }
    ];

    clearSelection: Subject<void> = new Subject<void>();
    //  this.clearSelection.next();

    _actions: {
        activate: boolean,
        inactivate: boolean,
        download: boolean
    } = {
            activate: false,
            inactivate: false,
            download: false
        };
    type = "movimientos";

    totalItems: number = 100;

    columns: Column[] = [
        {
            key: 'select',
            label: '',
            order: 1,
            propertyType: 'string',
            isSelect: true
        },
        {
            key: 'position',
            label: 'No.',
            order: 2,
            propertyType: 'number',
            canSort: true,
            isData: true
        },
        {
            key: 'id',
            label: 'ID',
            order: 3,
            propertyType: 'number',
            canSort: true,
            isData: true
        },
        {
            key: 'grupoCompania',
            label: 'Grupo compañía',
            order: 4,
            propertyType: 'string',
            canSort: true,
            isData: true
        },
        {
            key: 'compania',
            label: 'Compañía',
            order: 5,
            propertyType: 'string',
            canSort: true,
            isData: true
        },
        {
            key: 'usuario',
            label: 'Usuario',
            order: 6,
            propertyType: 'string',
            canSort: true,
            isData: true
        },
        {
            key: 'modulo',
            label: 'Módulo',
            order: 7,
            propertyType: 'string',
            canSort: true,
            isData: true
        },
        {
            key: 'submodulo',
            label: 'Submódulo',
            order: 8,
            propertyType: 'string',
            canSort: true,
            isData: true
        }
    ];



    /**
     * @description Funcion para ejecutar la accion seleccionada desde la tabla
     * @param event Datos e informacion del evento a realizar
     */
    actionSelected(
        event: {
            action: 'activate' | 'inactivate' | 'edit' | 'view' | 'activate_batch' | 'inactivate_batch' | 'download_batch' | 'download' | 'comments' | 'report_download',
            data: any
        }
    ) {
    }

    /**
     * @description Funcion para detectar los datos del paginador
     * @param pageData Datos del paginador
     */
    onPaginatorChange(pageData: PageEvent): void {
        // this.pageData = pageData;
        // this.getBitacoraOperativa();
    }
}
