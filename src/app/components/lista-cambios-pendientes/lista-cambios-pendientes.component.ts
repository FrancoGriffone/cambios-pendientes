import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
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

  componentLoading: boolean = true

  loadingProductos: boolean = false

  productos: any = 0

  position: string = 'center';

  tienda: any

  tiendaSelec: any 

  modulo: any

  moduloSelec: any

  desde = dayjs().subtract(1, 'month').toDate()

  hasta = dayjs().toDate()

  datos: any

  cambios: number = 0
  
  seleccionadas: any

  //<------------------------------------------------------------------------------------------------------------------>
  
  //AG GRID VARIABLES
  public domLayout: DomLayoutType = 'autoHeight';

    // colDefs: ColDef[] = [
    //   {field: 'productoId', headerName: 'ID producto', width: 150, checkboxSelection: true, headerCheckboxSelection: true},
    //   {field: 'sku', headerName: 'SKU', width: 150},
    //   {field: 'nombre', headerName: 'Nombre', width: 150},
    //   {field: 'marca', headerName: 'Marca', width: 150},
    //   {field: 'color', headerName: 'Color', width: 150},
    //   {field: 'talle', headerName: 'Talle', width: 150},
    //   {field: 'superior', headerName: 'Superior', width: 150},
    //   {field: 'precioNormal', headerName: 'Precio Normal', width: 150},
    //   {field: 'precioRebajado', headerName: 'Precio Rebajado', width: 150},
    //   {field: 'fechaPrecios', headerName: 'Fecha Precios', width: 150, valueFormatter: params => dayjs(params.data.fechaPrecios).format('DD/MM/YYYY/h:mm:ss A')},
    //   {field: 'stock', headerName: 'Stock', width: 150},
    //   {field: 'fechaStock', headerName: 'Fecha Stock', width: 150, valueFormatter: params => dayjs(params.data.fechaStock).format('DD/MM/YYYY/h:mm:ss A')},
    // ];

    precios: ColDef[] = [
      {field: 'productoId', headerName: 'ID producto', width: 150, checkboxSelection: true, headerCheckboxSelection: true},
      {field: 'sku', headerName: 'SKU', width: 150},
      {field: 'nombre', headerName: 'Nombre', width: 150},
      {field: 'marca', headerName: 'Marca', width: 150},
      {field: 'color', headerName: 'Color', width: 150},
      {field: 'talle', headerName: 'Talle', width: 150},
      {field: 'superior', headerName: 'Superior', width: 150},
      {field: 'precioNormal', headerName: 'Precio Normal', width: 150},
      {field: 'precioRebajado', headerName: 'Precio Rebajado', width: 150},
      {field: 'fechaPrecios', headerName: 'Fecha Precios', width: 150, valueFormatter: params => dayjs(params.data.fechaPrecios).format('DD/MM/YYYY/h:mm:ss A')},
    ];

    stock: ColDef[] = [
      {field: 'productoId', headerName: 'ID producto', width: 150, checkboxSelection: true, headerCheckboxSelection: true},
      {field: 'sku', headerName: 'SKU', width: 150},
      {field: 'nombre', headerName: 'Nombre', width: 150},
      {field: 'marca', headerName: 'Marca', width: 150},
      {field: 'color', headerName: 'Color', width: 150},
      {field: 'talle', headerName: 'Talle', width: 150},
      {field: 'superior', headerName: 'Superior', width: 150},
      {field: 'stock', headerName: 'Stock', width: 150},
      {field: 'fechaStock', headerName: 'Fecha Stock', width: 150, valueFormatter: params => dayjs(params.data.fechaStock).format('DD/MM/YYYY/h:mm:ss A')},
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

  //FIN AG GRID VARIABLES 

  //<------------------------------------------------------------------------------------------------------------------>

  constructor(private api: ApiService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService){}

  ngOnInit() {
    //APIS
    let tiendas = this.api.obtenerTiendas()
    let modulos = this.api.obtenerModulos()

    forkJoin([tiendas, modulos])
    .subscribe(results =>{
      this.tienda = results[0]
      this.modulo = results[1]
    })
  }

  onGridReady(params: any){
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
  }

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
      let data = {
        'tiendaId': this.tiendaSelec?.id,
        'moduloId': this.moduloSelec?.id,
        'desde': dayjs(this.desde).format('YYYY-MM-DD'),
        'hasta': dayjs(this.hasta).format('YYYY-MM-DD')
      }
      this.api.obtenerListaPendientes(data).pipe(catchError((errors: HttpErrorResponse)=>{
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
        message: `¿Estás seguro de querér confirmar estos ${this.seleccionadas.length} cambios?`,
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
        console.log('Hubo un error en la conexión a internet o la base de datos.')
        return throwError(errors);
    }))).subscribe((data)=>{
        console.log(data)
        this.productos = this.productos + calculo
        this.cambios = this.cambios + 1
        this.seleccionadas.shift()
        this.cargaProds()
    })
    } else {
      this.messageService.add({ severity: 'info', summary:'Confirmado', detail: `¡Se actualizaron los datos! Guardaste ${this.cambios} cambios.` });
      this.cambios = 0
      this.loadingProductos = false;
      this.productos = 0
    }
  }
  
  irCambios(){
    this.router.navigate(['cambiosrealizados'])
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.componentLoading = false;
    });
   }
   
}
