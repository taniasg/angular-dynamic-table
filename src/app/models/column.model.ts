export class Column {
    key: string;
    label: string;
    order: number;
    propertyType: any;
    canSort?: boolean;
    isData?: boolean;
    isSelect?: boolean;
    isExpandable?: boolean;
    isLayout?: boolean;
    actions?: any;
    progress?: boolean;
    semaphore?: boolean;

    constructor(options: Partial<Column> = {}) {
        this.key = options.key;
        this.label = options.label;
        this.order = options.order || 0;
        this.propertyType = options.propertyType;
        this.canSort = options.canSort || false;
        this.isData = options.isData || true;
        this.isSelect = options.isSelect || false;
        this.isExpandable = options.isExpandable || false;
        this.actions = options.actions || false;
        this.progress = options.progress || false;
        this.semaphore = options.semaphore || false;
        this.isLayout = options.isLayout || false;
    }
}
