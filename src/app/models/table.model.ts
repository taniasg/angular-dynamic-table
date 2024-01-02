import { Column } from "./column.model";
export class TableModel {
    columns: Column[] = [];

    addColumn(column: Column) {
        this.columns = [...this.columns, column];
    }
}
