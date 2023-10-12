import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ColDef, DomLayoutType} from 'ag-grid-community';
import * as dayjs from 'dayjs';
import { ConfirmEventType, ConfirmationService, MessageService } from 'primeng/api';
import { catchError, forkJoin, throwError } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-cambios-pendientes',
  templateUrl: './lista-cambios-pendientes.component.html',
  styleUrls: ['./lista-cambios-pendientes.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class ListaCambiosPendientesComponent {

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

  //VARIABLES
  componentLoading: boolean = true //BOOLEAN PARA LA BARRA DE CARGA EN GENERAL

  loadingProductos: boolean = false //BOOLEAN PARA LA BARRA DE CARGA DE PRODUCTOS AL CONFIRMAR EL DIALOG

  productos: any = 0 //PARA SETEAR EL PORCENTAJE EN LA BARRA DE CARGA DE CADA PRODUCTO

  barraProgreso: any = 0 //PARA IR SUMANDO LA BARRA DE PROGRESO, QUE EN productos SE VE SIN TANTOS DECIMALES

  position: string = 'center'; //POSICIÓN DEL DIALOG DE CONFIRMACIÓN

  tienda: any //SETEA LAS TIENDAS QUE ESTÁN CARGADAS EN LA API

  tiendaSelec: any //TIENDA SELECCIONADA EN EL DROPDOWN

  modulo: any //SETEA LOS MÓDULOS QUE ESTÁN CARGADOS EN LA API

  moduloSelec: any //MÓDULO SELECCIONADO EN EL DROPDOWN

  desde = dayjs().subtract(1, 'day').toDate() //FECHA A PARTIR DE LA QUE BUSCA

  inputDesde = dayjs(this.desde).format('DD/MM/YYYY HH:mm')

  hasta = dayjs().toDate() //FECHA HASTA DONDE BUSCA

  inputHasta = dayjs(this.hasta).format('DD/MM/YYYY HH:mm')

  datos: any //BAJAMOS LA DATA RECIBIDA AL SUSCRIBIRSE A LA API, QUE POSTERIORMENTE SETEAMOS EN LA AG GRID

  data: any //DATOS COLOCADOS PARA CARGAR EL AG GRID, SE SETEAN EN EL SESSION STORAGE

  cambios: number = 0 //PARA SETEAR LA CANTIDAD DE CAMBIOS REALIZADOS, LO TOMA EL TOAST AL FINALIZAR 
  
//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

  //AG GRID VARIABLES
  public domLayout: DomLayoutType = 'autoHeight';

    precios: ColDef[] = [
      {field: 'productoId', headerName: 'ID producto', width: 140, checkboxSelection: true, headerCheckboxSelection: true, headerCheckboxSelectionFilteredOnly: true},
      {field: 'sku', headerName: 'SKU'},
      {field: 'nombre', headerName: 'Nombre'},
      {field: 'marca', headerName: 'Marca'},
      {field: 'color', headerName: 'Color'},
      {field: 'talle', headerName: 'Talle', type: 'rightAligned'},
      {field: 'superior', headerName: 'Superior'},
      {field: 'precioNormal', headerName: 'Precio Normal', type: 'rightAligned'},
      {field: 'precioRebajado', headerName: 'Precio Rebajado', type: 'rightAligned'},
      {field: 'fechaPrecios', headerName: 'Fecha Precios', type: 'rightAligned', valueFormatter: params => dayjs(params.data.fechaPrecios).format('DD/MM/YYYY h:mm')},
    ];

    stock: ColDef[] = [
      {field: 'productoId', headerName: 'ID producto', checkboxSelection: true, headerCheckboxSelection: true},
      {field: 'sku', headerName: 'SKU'},
      {field: 'nombre', headerName: 'Nombre'},
      {field: 'marca', headerName: 'Marca'},
      {field: 'color', headerName: 'Color'},
      {field: 'talle', headerName: 'Talle', type: 'rightAligned'},
      {field: 'superior', headerName: 'Superior'},
      {field: 'stock', headerName: 'Stock', type: 'rightAligned'},
      {field: 'fechaStock', headerName: 'Fecha Stock', type: 'rightAligned', valueFormatter: params => dayjs(params.data.fechaStock).format('DD/MM/YYYY h:mm')},
    ];
    
    public colDefs: ColDef[] = this.precios; //COLUMNAS AG GRID
    public rowData!: any; //FILAS AG GRID
  
    gridOptions = {
      defaultColDef:{
        resizable: true,
        sortable: true,
        unSortIcon: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
      }
    }

    gridApi: any;
    gridColumnApi: any;
    rowHeight: any;

    sizeBtn: boolean = true //BOTÓN PARA EL CAMBIO DE TAMAÑO DE COLUMNAS AG GRID

    seleccionadas: any //FILAS SELECCIONADAS CON EL CHECKBOX

  //FIN AG GRID VARIABLES 

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

  constructor(private api: ApiService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private titleService: Title){
      //CAMBIO DE TITULO
      this.titleService.setTitle("Actualizar Ecommerce - pendientes");
    }

  ngOnInit() {
    //OBTENEMOS DATOS DEL SESSIONSTORAGE
    this.data = sessionStorage.getItem('dataSession');
    this.data = JSON.parse(this.data)

    //APIS
    let tiendas = this.api.obtenerTiendas()
    let modulos = this.api.obtenerModulos()

    forkJoin([tiendas, modulos])
    .subscribe(results =>{
      this.tienda = results[0]
      this.modulo = results[1]

      //SETEAR DATOS DEL SESSIONSTORAGE
      if(this.data != null){
        this.desde = dayjs(this.data?.desde).toDate()
        this.hasta = dayjs(this.data?.hasta).toDate()
        this.tiendaSelec = this.tienda?.find((x: any) => x?.id == this.data?.tiendaId);
        this.moduloSelec = this.modulo?.find((x: any) => x?.id == this.data?.moduloId);
      }
    })
  }

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

  //FUNCIONES AG GRID
  onGridReady(params: any){
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    this.rowHeight = 25;
  }

  sizeToFit() {
    this.gridApi.sizeColumnsToFit();
    this.sizeBtn = !this.sizeBtn
  }

  autoSizeAll(skipHeader: boolean) {
    const allColumnIds: string[] = [];
    this.gridColumnApi.getColumns()!.forEach((column: { getId: () => string; }) => {
      allColumnIds.push(column.getId());
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds, skipHeader);
    this.sizeBtn = !this.sizeBtn
  }

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

  setearFechaDesde(){ 
  this.desde = dayjs(this.inputDesde).toDate()
  }

  setearFechaHasta(){
    this.hasta = dayjs(this.inputHasta).toDate()
  }

  //FUNCIÓN PARA BUSCAR CON LOS PÁRAMETROS ESTABLECIDOS
  onSubmit(){
    this.componentLoading = true;
    if (this.tiendaSelec == undefined){
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No seleccionaste ninguna tienda' });
        this.componentLoading = false;
    } else if (this.moduloSelec == undefined) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No seleccionaste ningun módulo' });
        this.componentLoading = false;
    } else {

      this.data = {
        'tiendaId': this.tiendaSelec?.id,
        'moduloId': this.moduloSelec?.id,
        'desde': dayjs(this.desde).format('YYYY-MM-DDTHH:mm:ss.00'),
        'hasta': dayjs(this.hasta).format('YYYY-MM-DDTHH:mm:ss.00')
      }

      sessionStorage.setItem('dataSession', JSON.stringify(this.data));

      this.api.obtenerListaPendientes(this.data).pipe(catchError((errors: HttpErrorResponse)=>{
        Swal.fire({
          title: '¡Error!',
          text: 'La conexión a internet es muy débil o el servidor está experimentando problemas. Verifica el estado de tu red o ponte en contacto con quien está a cargo del servidor',
          icon: 'error',
          confirmButtonText: 'Volver atrás'
        })
        this.componentLoading = false;
        return throwError(errors);
      })).subscribe((data)=>{
        this.datos = data
        this.rowData = this.datos.data
        if (this.moduloSelec?.modulo == 'Precios'){
          this.gridApi.setColumnDefs(this.precios)  
        } else {
          this.gridApi.setColumnDefs(this.stock)
        }
        this.componentLoading = false;
      })
    }
  }

  //FUNCIÓN QUE ABRE EL DIALOG DE CONFIRMACIÓN
  actualizar(position: string) {
    this.seleccionadas = this.gridApi.getSelectedRows()
    if (this.seleccionadas.length == 0){
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No seleccionaste ningún producto' });
    } else {
    this.position = position;

    this.confirmationService.confirm({
        message: `<pre>¿Estás seguro de querér confirmar estos ${this.seleccionadas.length} cambios?\nTIENDA: ${this.tiendaSelec.tienda}, MODULO: ${this.moduloSelec.modulo}</pre>`,
        header: 'Confirmar actualización',
        icon: 'pi pi-info-circle',
        acceptLabel: 'Si',
        rejectLabel: 'No',
        accept: () => {
            this.loadingProductos = true;
            this.cargaProds()
        },
        reject: (type: ConfirmEventType) => {
            switch (type) {
                case ConfirmEventType.REJECT:
                    this.messageService.add({ severity: 'error', summary: 'Rechazado', detail: 'No se guardarán los cambios.' });
                    break;
                case ConfirmEventType.CANCEL:
                    this.messageService.add({ severity: 'warn', summary: 'Cancelado', detail: 'Saliste de la ventana. No se confirmaron los cambios.' });
                    break;
            }
        },
        key: 'positionDialog'
    });
    }
  }

  //FUNCIÓN DE CARGA DE PRODUCTOS
  cargaProds(){
    let seleccionadas = this.gridApi.getSelectedRows()
    if(this.seleccionadas.length > 0){
      let calculo = 100 / seleccionadas.length
      let enviarProd = {
        'tiendaId': this.tiendaSelec.id,
        'moduloId': this.moduloSelec.id,
        'productoId': this.seleccionadas[0].productoId
      }
      this.api.procesarCambios(enviarProd).pipe(catchError(catchError((errors: HttpErrorResponse)=>{
        console.log(`Hubo un error en la conexión a internet o la base de datos. ID del producto: ${this.seleccionadas[0].productoId}. Volverá a intentarse hasta que se cargue correctamente.`)
        return throwError(errors);
    }))).subscribe((data)=>{
        console.log(data)
        this.barraProgreso = this.barraProgreso + calculo
        this.productos = this.barraProgreso.toFixed(2)
        console.log('Porcentaje de carga: ' + this.productos)
        this.cambios = this.cambios + 1
        this.seleccionadas.shift()
        this.cargaProds()
    })
    } else {
      console.log('<------ CAMBIOS FINALIZADOS ------>')
      this.messageService.add({ severity: 'info', summary:'Confirmado', detail: `¡Se actualizaron los datos! Guardaste ${this.cambios} cambios.` });
      this.cambios = 0
      this.loadingProductos = false;
      this.productos = 0
    }
  }
  
  //IR A CAMBIOS REALIZADOS
  irCambios(){
    this.router.navigate(['actualizarEcommerce/cambiosrealizados'])
  }

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

  //AFTER INIT
  ngAfterViewInit() {
    setTimeout(() => {
      this.componentLoading = false;
    });
   }
   
}