## Angular Dynamic Table
Módulo que permite crear tablas de manera dinámica. 

## Requisitos de entorno
* `Angular > 10.2.0`
* `Node.js > 14.18.2`

## Instalación de dependencias
Para instalar todas las dependencias:
```console
 npm i
```

## Dependencias npm
* `@angular/material` 
Componentes Material Design UI para aplicaciones de Angular
https://material.angular.io/



## Input 

* columns. Array con los datos de las columnas (utilizando modelo de datos Column especificado más adelante) 

* data. Datos a desplegar en la tabla. Nota: El nombre del atributo del dato debe coincidir con el nombre del key especificado en la columna. Por ejemplo: Si creo una columna con key nombre, el nombre del atributo en data que irá en esa columna debe llamarse nombre. 

* actions. Acciones a realizar en la tabla. Esto es para el select que se encuentra en la esquina superior izquierda de la tabla. Las opciones son activar, inactivar, descargar y descargar guía de trabajo) 

* ShowTooltip. Indicador que permite mostrar u ocultar el tooltip que avisa al usuario si es necesario seleccionar más de un registro para realizar la acción del select (activar, desactivar). Nota: Esto se implementó para realizar la acción de todos los registros de la tabla. 

* isPageable. Paginar datos de la tabla 

* type. Tipo de dato a mostrar en la etiqueta de acciones del select. Se utiliza para mostrar el tipo de registro en el cual se realizará la acción en el select de acciones (usuarios, archivos, grupos, etc.)  

* maxWidth. Tamaño máximo de ancho del contenedor de la tabla. 

* noData. Etiqueta a mostrar cuando no se encuentren datos. Nota: Ya se encuentra este dato por default, si se desea sobrescribir se debe ingresar el dato, de otra forma no agregarlo. 

* totalItems. Total de elementos de la tabla. Nota: Esto se utiliza ya que hay dos tipos de formas de paginar la tabla: la primero es cuando se obtienen todos los datos del servicio (usuarios y roles únicamente); el segundo cuando solo se reciben los datos limitados al tamaño actual de la página y adicional el total de elementos contenidos (archivos, validaciones, diccionario, en general todos los demás). Esta propiedad solo se recibirá cuando se reciban datos paginados del servicio.  

* trackingBoard. Indicador para mostrar u ocultar el botón de Tablero de seguimiento en módulo Monitoreo. 

* download. Indicador para mostrar u ocultar el botón de Descarga en el Table de seguimiento. 

* enableDownload. Indica si se habilita el botón de descarga anterior (que tenga los datos obligatorios necesarios en la Tabla de seguimiento) 

* canSelectRow. Indica si se puede seleccionar la fila (esta funcionalidad se utiliza en la selección de campos en la tabla de Búsqueda de Campos). 

* clearSelection. Se limpia la selección cuando se actualizan los datos de la tabla. 

 

## Output 

* action. Evento que indica que una acción (activar, inactivar, descargar, editar, detalle) fue seleccionada en la tabla. Envía la acción y el registro. 

* paginator. Evento que indica que se realizó un cambio en el tamaño de la hoja o la hoja. 

* sort. Evento que indica que se presionó el botón para ordenar los registros de una determinada columna. Envía atributo y dirección. 

* rowSelected. Evento que indica que una fila fue seleccionada. Esta funcionalidad es utilizada en la tabla de Búsqueda de campos 

## Modelos 

# Column 

Módelo de datos que debe tener una columna 

* key. Llave o identificador de la columna. Debe ser único en la tabla. 

* label. Etiqueta a mostrar en el nombre de la columna. 

* order. Orden de las columnas. 

* propertyType. Tipo de dato a mostrar en la columna 

* canSort. Indica si se puede ordenar los datos de una columna 

* isData. Indica si la columna contiene texto 

* isSelect. Indica que la columna sirve para seleccionar los registros 

* isExpandable. Indica si la tabla tiene registros expandibles (utilizado en Resultados de carga) 

* isLayout. Indica si la columna incluye un botón para agregar layouts (utilizado en modificación de Archivos en una configuración grupal) 

* actions. Indica si la columna muestra las opciones a realizar en los registros (edición, activación, inactivación, detalle) 

* progress. Indica si la columna es de progreso de carga. 

* semaphore. Indica el color del Estatus de entrega (utilizado en Tablero de seguimiento) 