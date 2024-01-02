import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
    constructor() {
        super();

        this.getAndInitTranslations();
    }

    /**
     * @description Funcion para establecer los valores que se desean visualizar en el paginador   
     */
    getAndInitTranslations() {
        this.itemsPerPageLabel = "Mostrar: ";
        this.firstPageLabel = "Primera página";
        this.lastPageLabel = "Última página";
        this.nextPageLabel = "Siguiente";
        this.previousPageLabel = "Anterior";
        this.changes.next();
    }

    /**
     * @description Funcion para cambiar la descripcion de la pagina 
     * @param page Pagina
     * @param pageSize Numero de pagina
     * @param length Longitud
     */
    getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
            return `Mostrando 0 de un total de ${length} registros`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `Mostrando ${startIndex + 1} al ${endIndex} de un total de ${length} registros`;
    }
}