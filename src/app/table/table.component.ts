import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Sort, SortDirection } from "@angular/material/sort";
import { Column } from 'src/app/models/column.model';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
// import { ResponsiveService } from 'src/app/services/responsive/responsive.service';
import { Router } from '@angular/router';
// import { DialogService } from 'src/app/services/dialog/dialog.service';
// import { UploaderService } from 'src/app/services/commons/uploader/uploader.service';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
            state('*', style({ height: '*', visibility: 'visible' })),
            transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ],
})

export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
    private _data: any[];
    private _originalData: any[] = [];

    // Columnas de la tabla
    @Input() set columns(columns: Column[]) {
        // Ordenamiento de columnas
        this._columns = columns.sort((a, b) => a.order - b.order);
        this.buildColumns(this._columns);
    };
    // Datos a desplegar en la tabla
    @Input() set data(data: any[]) {
        this.setTableDataSource(data);
        this._data = [...data];
        if (!this._originalData.length) {
            // Se guarda el orden original de los datos
            this._originalData = [...this._data];
        }
    };
    // Acciones a mostrar en componente select
    @Input() actions: {
        activate: boolean, inactivate: boolean, download: boolean, download_guide: boolean
    } = {
            activate: true, inactivate: true, download: true, download_guide: false
        };
    // Indicador para mostrar tooltip (funcionalidad de descargar todos sin seleccionar datos en tabla)
    @Input() showTooltip: boolean = true;
    // Determina si la tabla tiene paginador
    @Input() isPageable = false;
    @Input() type: string;
    // Tamanio maximo de la tabla
    @Input() maxWidth: string = '100%';
    @Input() maxHeight: string = '600px';
    // Mensaje a mostrar cuando no hay datos en tabla
    @Input() noData: string = 'No hay datos para mostrar';
    @Input() set totalItems(totalItems: number) {
        this.length = totalItems;
        // Se borra el paginador
        this.dataSource.paginator = null;
    }
    @Input() trackingBoard: boolean = false;
    @Input() download: boolean = false;
    @Input() enableDownload: boolean = false;
    @Input() set expandableRows(expandable: boolean) {
        this._expandableRows = expandable;
        this.setTableDataSource(this._data);
    };
    _expandableRows = false;
    @Input() canSelectRow: boolean = false;
    @Input() clearSelection: Observable<void>;
    clearSelectionSubs: Subscription;

    // Atributo que se utiliza como apoyo para identificar si la tabla del componente group-reception (onlyTable) es solo de escritura 
    // y no permite crear un layout
    @Input() set readonly(readonly: boolean) {
        this._readonly = readonly;
    }

    @Output() action = new EventEmitter<any>();
    @Output() paginator = new EventEmitter<PageEvent>();
    @Output() sort = new EventEmitter<Sort>();
    @Output() rowSelected = new EventEmitter<any>();

    @ViewChild(MatPaginator, { static: false }) matPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) matSort: MatSort;

    displayedColumns: string[];
    dataSource: MatTableDataSource<any>;
    _columns: Column[];

    _readonly: boolean;

    row: any;

    length: number;
    pageSize = 10;
    pageSizeOptions: number[] = [10, 20, 30, 50, 100];

    // MatPaginator Output
    pageEvent: PageEvent;

    selection = new SelectionModel<any>(true, []);
    acciones = "";

    allSelected: boolean[] = [false];
    paginatorData: PageEvent = { previousPageIndex: 0, pageIndex: 0, pageSize: 10, length: 0 };

    expanded: boolean = false;

    dialogSubs: Subscription;

    @ViewChildren('innerSort') innerSort: QueryList<MatSort>;
    @ViewChildren('innerTables') innerTables: QueryList<MatTable<any>>;


    expandedElement: any | null;

    screenSize: string = "";

    uploading: boolean = false;

    constructor(
        private cdRef: ChangeDetectorRef,
        private router: Router,
        ) {
    }

    ngOnInit(): void {
        this.newClearSelectionSubscription();
    }

    ngAfterViewInit(): void {
        this.cdRef.detectChanges();
        this.dataSource.sort = this.matSort;
        this.dataSource.sortingDataAccessor = (data, header) => data[header];
        this.dataSource.paginator = this.matPaginator;
    }

    ngOnDestroy(): void {
        this.clearSelectionSubs?.unsubscribe();
        this.dialogSubs?.unsubscribe();
    }

    /**
     * @description Funcion que devuelve si la tabla contiene acciones a mostrar
     * @returns Boolean que determina si se muestra la seccion de acciones o no
     */
    get showActions(): boolean {
        if (this.actions) {
            return this.actions.activate || this.actions.inactivate || this.actions.download || this.actions.download_guide;
        } else {
            return false;
        }
    }

    /**
     * @description Funcion get que determina si todos los elementos de la tabla estan seleccionados
     */
    get isChecked(): boolean {
        if (this.length) {
            return this.selection.selected.length > 0 && this.selection.selected.length === this.length;
        }
        else {
            return this.selection.selected.length > 0 && this.selection.selected.length === this.dataSource.data.length;
        }
    }

    /**
     * @description Funcion get que determina si algunos elementos de la tabla estan seleccionados
     */
    get isSomeSelected(): boolean {
        // El servicio de donde se obtienen los datos es paginado
        if (this.length) {
            // Si hay algun elemento seleccionado y el numero de elementos seleccionados es menor al total de elementos
            return this.selection.selected.length > 0 && this.selection.selected.length < this.length;
        }
        else {
            // Si hay algun elemento seleccionado y el numero de elementos seleccionados es menor al total de elementos
            return this.selection.selected.length > 0 && this.selection.selected.length < this.dataSource.data.length;
        }
    }

    /**
     * @description Funcion que determina si un registro de la tabla puede crear layouts (desarrollado para tabla de archivos secundarios)
     * @param element Registro de la tabla
     */
    canCreateLayout(element): boolean {
        return element.createLayout && !this._readonly;
    }

    /**
     * @description Funcion para actualizar usuarios cuando haya un nuevo registro
     */
    newClearSelectionSubscription(): void {
        if (this.clearSelection) {
            this.clearSelectionSubs = this.clearSelection.subscribe(() => {
                this.selection.clear();
                this.acciones = "";
                this.paginatorData = { previousPageIndex: 0, pageIndex: 0, pageSize: 10, length: 0 };
                this.matPaginator?.firstPage();
            });
        }
    }

    /**
     * @description Funcion para saber si estan seleccionados todos los registros de la tabla
     */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const page = this.paginatorData.pageSize;
        let endIndex: number;
        // First check whether data source length is greater than current page index multiply by page size.
        // If yes then endIdex will be current page index multiply by page size.
        // If not then select the remaining elements in current page only.

        // Si existe la propiedad length, se estan obteniendo datos de un servicio
        if (this.length) {
            if (numSelected > 0) {
                let idSelectedItems = this.selection.selected.map(x => x.id);

                let allSelected = this.dataSource.data.every(item => idSelectedItems.includes(item.id));
                return !allSelected

            }
            else return true;

            // LOGICA ANTERIOR
            // // El tamanio total es mayor que la pagina actual multiplicado por el tamanio de la pagina (calcular si estamos en la ultima pagina)
            // if (this.length > (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize) {
            //     // El total de elementos es el tamanio de la pagina actual
            //     endIndex = (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize;
            // } else {
            //     // Se encuentra en la ultima pagina
            //     // El total de elementos es la longitud de la pagina actual (servicio)
            //     endIndex = this.dataSource.data.length;
            // }
            // // Se retorna true si el numero seleccionado es mayor a cero
            // return numSelected > 0;

            // return this.isChecked
        } else {
            // El indice inicial sera calculado de acuerdo a los datos de la pagina actual
            let startIndex = this.paginatorData.pageIndex * this.paginatorData.pageSize;
            // Si la longitud de los datos es mayor al calculo de las hojas (no esta en la primera hoja)
            if (this.dataSource.data.length > (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize) {
                endIndex = (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize;
            } else {
                // Es la ultima hoja
                endIndex = this.dataSource.data.length;
            }

            // Si hay datos seleccionados
            if (this.selection.selected.length > 0) {
                if (this.selection.selected.length === this.dataSource.data.length) {
                    // Ya estan todos seleccionados
                    return false
                }
                // Se filtran los elementos seleccionados que tengan la misma posicion del inicio y fin de la hoja actual
                let selectedByPage = [...this.selection.selected].filter(el => el.position > startIndex && el.position <= endIndex);
                return page !== selectedByPage.length;
            }
            // No hay ningun elemento seleccionado
            else return true;

            // LOGICA ANTERIOR
            // if (this.dataSource.data.length > (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize) {
            //     endIndex = (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize;
            // } else {
            //     endIndex = this.dataSource.data.length - (this.paginatorData.pageIndex * this.paginatorData.pageSize);
            // }
            // return numSelected === endIndex;
        }
    }

    /**
     * @description Funcion para seleccionar o deseleccionar los registros de la tabla
     */
    masterToggle() {
        // LOGICA ANTERIOR
        // this.isAllSelected() ?
        //     this.selection.clear() :
        //     this.selectRows();
        if (this.isAllSelected()) {
            this.selectRows();
        }
        else {
            this.deselectRows();
        }
    }

    /**
     * @description Funcion para seleccionar/deseleccionar registros de la tabla
     * @param row Fila/Registro a seleccionar
     */
    toggleSelectRow(row): void {
        let itemsSelected = this.selection.selected;

        // Si existen elementos seleccionados
        if (itemsSelected?.length > 0) {
            // Se valida si el elemento ya fue seleccionado
            let itemAlreadySelected = itemsSelected.find(item => item.id === row.id);

            // Si el elemento ya habia sido seleccionado
            if (itemAlreadySelected) {
                // Se elimina del array de los elementos seleccionados
                let items = itemsSelected.filter(item => item.id !== row.id);
                // Se limpia select y se asignan los elementos filtrados
                this.selection.clear()
                this.selection.select(...items);
            }
            else {
                // No esta seleccionado, se agrega a la lista de elementos seleccionados
                this.selection.select(row);
            }
        }
        else {
            // Si no existen, se agrega simplemente a la lista de los elementos
            this.selection.toggle(row);
            this.selection.select(row);
        }
    }

    /**
     * @description Funcion para seleccionar registros por paginas
     */
    selectRows() {
        let startIndex: number;
        let endIndex: number;

        if (this.length) {
            // El indice inicial siempre sera 0 cuando se utiliza un servicio de paginado
            startIndex = 0;
            endIndex = this.dataSource.data.length;
        }
        else {
            // El indice inicial sera calculado de acuerdo a los datos de la pagina actual
            startIndex = this.paginatorData.pageIndex * this.paginatorData.pageSize;
            // Si la longitud de los datos es mayor al calculo de las hojas (no esta en la primera hoja)
            if (this.dataSource.data.length > (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize) {
                endIndex = (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize;
            } else {
                // Es la ultima hoja
                endIndex = this.dataSource.data.length;
            }
        }

        for (let index = startIndex; index < endIndex; index++) {
            // Si no existe el id en el array de seleccionados, se agrega el elemento
            if (!this.selection.selected.some((a: any) => a.id == this.dataSource.data[index]['id'])) {
                this.selection.select(this.dataSource.data[index]);
            }
        }
    }

    /**
     * @description Funcion para deseleccionar registros por paginas
     */
    deselectRows() {
        let startIndex: number;
        let endIndex: number;

        if (this.length) {
            let itemsSelected = this.selection.selected;
            let itemsCurrentPage = this.dataSource.data;

            // Se filtran los elementos de la pagina actual del array de la lista de elementos seleccionados
            let items = itemsSelected.filter(item => !itemsCurrentPage.find(row => row.id === item.id));

            // Se limpia el selection y se asignan los elementos filtrados
            this.selection.clear()
            this.selection.select(...items);
        }
        else {
            // El indice inicial sera calculado de acuerdo a los datos de la pagina actual
            startIndex = this.paginatorData.pageIndex * this.paginatorData.pageSize;
            // Si la longitud de los datos es mayor al calculo de las hojas (no esta en la primera hoja)
            if (this.dataSource.data.length > (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize) {
                endIndex = (this.paginatorData.pageIndex + 1) * this.paginatorData.pageSize;
            } else {
                // Es la ultima hoja
                endIndex = this.dataSource.data.length;
            }
            for (let index = startIndex; index < endIndex; index++) {
                // Si no existe el id en el array de seleccionados, se agrega el elemento
                // if (!this.selection.selected.some((a: any) => a.id == this.dataSource.data[index]['id'])) {
                this.selection.deselect(this.dataSource.data[index]);
                // }
            }
        }
    }

    /**
     * @description Funcion para obtener el label del checkbox de un registro
     * @param row Registro de la tabla
     */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'seleccionar' : 'deseleccionar'} todos`;
        }
        return `${this.selection.isSelected(row) ? 'deseleccionar' : 'seleccionar'} registro ${row.position + 1}`;
    }

    /**
     * @description Funcion para verificar si un elemento de la tabla esta seleccionado
     * @param row Registro de la tabla
     * @todo Revisar si se puede comparar contra todo el objeto, no solo con el id
     */
    isSelected(row): boolean {
        if (this.length) {
            for (let element of this.selection.selected) {
                if (element['id'] == row.id) {
                    return true;
                }
            }
        }
        else {
            return this.selection.isSelected(row)
        }
    }

    /**
     * @description Funcion para ordenar los registros de la tabla
     * @param params Atributo por el cual se debe ordenar los registros
     */
    sortData(params: Sort) {
        const direction: SortDirection = params.direction;
        this.sort.emit(params);
        this._data = direction
            ? this.orderBy(this._data, params.active, direction)
            : this._originalData;
    }

    /**
     * @description Funcion generica para ordenar datos de acuerdo a un atributo
     * @param data Datos a ordenar
     * @param attr Atributo por el cual se debe de ordenar
     * @param direction Direccion de ordenamiento
     */
    orderBy(data: any, attr: string, direction: 'asc' | 'desc') {
        return data.sort((a: any, b: any) =>
        (
            direction === 'asc' ? parseFloat(a[attr]) - parseFloat(b[attr]) : parseFloat(b[attr]) - parseFloat(a[attr])
        )
        )
    }

    /**
     * @description Funcion para setear los datos de  la tabla
     * @param data Datos a desplegar en la tabla
     */
    setTableDataSource(data: any) {
        if (this._expandableRows) {
            data = data.map(data => {
                if (data.items && Array.isArray(data.items)) {
                    return {
                        ...data,
                        items: new MatTableDataSource<any>(data.items)
                    }
                }
            });
        }
        this.dataSource = new MatTableDataSource<any>(data);
        if (!this.length) {
            this.dataSource.paginator = this.matPaginator;
        }
        this.dataSource.sort = this.matSort;
    }

    /**
     * @description Función para construir las columnas a desplegar
     * @param columns Columnas de los campos a desplegar en la tabla
     */
    private buildColumns(columns: Column[]) {
        this.displayedColumns = columns.map(col => col.key);
    }

    /**
     * @description Funcion para emitir cada vez que se seleccione una accion sobre algun registro de la tabla
     * @param action Accion a realizar
     * @param data Datos del registro seleccionado
     * @param emitAction Se indica si se emite o no el evento
     */
    actionSelected(action: string, data: any, emitAction: boolean = true) {
        // Se valida si el elemento esta activo para poder editarlo
        emitAction && this.action.emit({ action: action, data: data });
    }

    /**
     * @description Funcion para traer los datos de la pagina seleccionada
     * @param paginatorData Datos de la pagina
     */
    getPaginatorData(paginatorData: PageEvent): void {
        this.paginatorData = paginatorData;
        // Se emiten el cambio de pagina
        this.paginator.emit(paginatorData);
    }

    /**
     * @description Funcion para expansion registro de la tabla
     */
    toggleExpansion(row): void {
        // Atributo del registro que determina el icono a mostrar ( + si esta comprimida, - si esta expandida)
        row.expanded = !row.expanded;
    }

    /**
     * @description Funcion para mostrar u ocultar elementos hijos
     * @param element 
     */
    toggleRow(element: any) {
        element.items && (element.items as MatTableDataSource<any>).data.length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
        this.cdRef.detectChanges();
        this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<any>).sort = this.innerSort.toArray()[index]);

        element.items && (element.items as MatTableDataSource<any>).data.length && this.toggleExpansion(element);
    }

    /**
     * @description Funcion para redirigir a una url
     * @param url Url a la que se redirecciona
     */
    redirect(url: string, element?: any): void {
        if (this.uploading && url === '/procesos/resultados') {
            // this.dialogService.open(
            //     {
            //         title: 'Carga',
            //         subtitle: 'Carga en progreso',
            //         text: 'Se está realizando la carga de un archivo, favor de esperar a que finalice el progreso.',
            //         confirm: 'Cerrar',
            //         type: 'info',
            //         icon: 'warning'
            //     },
            //     '800px'
            // )
        }
        else if (element && url === '/procesos/resultados') {
            let folio = `${element.validacion ? 'V' : 'C'}${element.folio}`;
            this.router.navigate([url], { queryParams: { folio: folio } })
        }
        else {
            this.router.navigateByUrl(url);

        }
    }

    /**
     * @description Funcion para mostrar u ocultar un boton
     * @param action Accion que realiza el boton
     * @param estatus Datos del elemento
     * @param element Dato opcional que contiene todos los datos del registro seleccionado
     */
    showAction(action: 'download' | 'comments' | 'info_load' | 'report_download' | 'panel', estatus: any, element?: any): boolean {
        switch (action) {
            case 'download':
            case 'comments':
                // Estatus aceptados para descargar y ver comentarios
                // -1
                // 2 Carga exitosa
                // 3 Validacion en proceso
                // 4 Validacion sin error
                // 5 Validacion con errorres bloqueantes
                // 8 Validacion cancelada
                // 9 Validacion con advertencia
                return [-1, 2, 3, 4, 5, 8, 9].includes(+estatus);
            case 'info_load':
                // Estatus aceptaos para redirigir Listado de Carga (procesos/carga)
                // 3 Validacion en proceso
                return +estatus === 3;
            case 'report_download':
                // Estatus aceptados para descarga de reportes
                // 3 Validacion en proceso
                // 4 Validacion sin error
                // 5 Validacion con errorres bloqueantes
                // 9 Validacion con advertencia
                // y debe de contar con alguno de los dos reportes para poder visualizarse (detalle o resumen)
                return [3, 4, 5, 9].includes(+estatus);
            case 'panel':
                return estatus > 0
            default:
                return false;
        }

    }

    /**
     * @description Funcion para seleccionar una fila de la tabla
     */
    onSelectedRow(row: any): void {
        // Desarrollado para funcionalidad de Busqueda de campos
        if (this.canSelectRow) {
            // Si el registro ya fue seleccionado
            if (this.row === row) {
                // Se deselecciona y se emite el nuevo valor (null)
                this.row = null;
                this.rowSelected.emit(this.row);
            }
            else {
                // Se asigna el nuevo registro y se emite el nuevo registro
                this.row = row;
                this.rowSelected.emit(this.row);
            }
        }
    }

    /**
     * @description Funcion para crear un layout de un archivo secundario
     * @param element Elemento de la tabla
     */
    openLayoutDialog(element: any): void {
        // this.dialogService.layout(
        //     'registration',
        //     {
        //         title: 'Alta de layouts',
        //         action: 'create',
        //         data: {
        //             nomenclatura: element.nomenclatura
        //         }
        //     },
        //     '1113px',
        //     true
        // );

        // this.dialogSubs = this.dialogService.confirmed().subscribe(confirmed => {
        //     if (confirmed) {
        //         const values = confirmed;

        //         this.dialogService.open(
        //             {
        //                 title: 'Alta',
        //                 subtitle: '¿Estás de acuerdo en guardar el layout?',
        //                 cancel: 'Cancelar',
        //                 confirm: 'Sí, guardar',
        //                 type: 'confirm',
        //                 subtype: 'text',
        //                 text: 'Si lo haces, se guardará en el sistema con la configuración seleccionada.',
        //                 icon: 'warning'
        //             },
        //             '800px'
        //         )

        //         this.dialogSubs = this.dialogService.confirmed().subscribe(confirmed => {
        //             if (confirmed) {
        //                 // Se agregan los atributos necesarios para el archivo secundario
        //                 // Datos del layout
        //                 element.layout = values;
        //                 // Indicador para ocultar boton "Crear layout"
        //                 element.createLayout = false;
        //                 // Indicador de layout creado
        //                 element.layoutLabel = 'Sí';
        //                 this.actionSelected('layout', element);

        //             }
        //         })
        //     }
        // });
    }
}
