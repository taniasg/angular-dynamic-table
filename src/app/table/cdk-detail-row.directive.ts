import { Directive, HostBinding, HostListener, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[cdkDetailRow]'
})
export class CdkDetailRowDirective {
    private row: any;
    private tRef: TemplateRef<any>;
    private opened: boolean;

    @HostBinding('class.expanded')
    get expanded(): boolean {
        return this.opened;
    }

    @Input()
    set cdkDetailRow(value: any) {
        if (value !== this.row) {
            this.row = value;
        }
    }

    @Input('cdkDetailRowTpl')
    set template(value: TemplateRef<any>) {
        if (value !== this.tRef) {
            this.tRef = value;
        }
    }

    constructor(public vcRef: ViewContainerRef) { }

    @HostListener('click')
    onClick(): void {
        this.toggle();
    }

    /**
     * @description Funcion para expandir/colapsar fila
     */
    toggle(): void {
        if (this.opened) {
            this.vcRef.clear();
        } else {
            this.render();
        }
        this.opened = this.vcRef.length > 0;
    }

    /**
     * @description Agregar registros y renderizar
     */
    private render(): void {
        this.vcRef.clear();
        if (this.tRef && this.row) {
            this.vcRef.createEmbeddedView(this.tRef, { $implicit: this.row });
        }
    }
}
