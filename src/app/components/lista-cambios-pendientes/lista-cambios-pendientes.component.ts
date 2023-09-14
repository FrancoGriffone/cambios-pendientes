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

  productos: number = 0

  position: string = 'center';

  tienda: any

  tiendaSelec: any 

  modulo: any

  moduloSelec: any

  desde = dayjs().subtract(1, 'month').toDate()

  hasta = dayjs().toDate()

  datos: any

  cambios: number = 0

  //<------------------------------------------------------------------------------------------------------------------>
  
  //AG GRID VARIABLES
  public domLayout: DomLayoutType = 'autoHeight';

    colDefs: ColDef[] = [
      {field: 'color', headerName: 'Color', width: 150, checkboxSelection: true, headerCheckboxSelection: true},
      {field: 'fechaStock', headerName: 'Fecha Stock', width: 150},
      {field: 'fechaPrecios', headerName: 'Fecha Precios', width: 150, valueFormatter: params => dayjs(params.data.fechaPrecios).format('DD/MM/YYYY')},
      //valueFormatter + fecha.slice SIRVE PARA ACORTAR EL STRING QUE LLEGA COMO FECHA
      {field: 'marca', headerName: 'Marca', width: 150},
      {field: 'nombre', headerName: 'Nombre', width: 150},
      {field: 'precioRebajado', headerName: 'Precio Rebajado', width: 150},
      {field: 'productoId', headerName: 'ID producto', width: 150},
      {field: 'sku', headerName: 'SKU', width: 150},
      {field: 'stock', headerName: 'Stock', width: 150},
      {field: 'superior', headerName: 'Superior', width: 150},
      {field: 'talle', headerName: 'Talle', width: 150},
      {field: 'tiendaId', headerName: 'ID tienda', width: 150},
    ];
    
    public rowData!: any; //FILAS AG GRID
  
    gridOptions = {
      defaultColDef:{
        resizable: true,
        sortable: true,
        unSortIcon: true,
        filter: true,
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
        this.componentLoading = false;
      })
    }
  }

  
  actualizar(position: string) {
    let seleccionadas = this.gridApi.getSelectedRows()
    if (seleccionadas.length == 0){
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No seleccionaste ningún producto' });
    } else {
    this.position = position;

    this.confirmationService.confirm({
        message: '¿Estás seguro de querér confirmar estos cambios?',
        header: 'Confirmar actualización',
        icon: 'pi pi-info-circle',
        acceptLabel: 'Si',
        rejectLabel: 'No',
        accept: () => {
            this.loadingProductos = true;
            let calculo = 100 / seleccionadas.length
            seleccionadas.forEach((e: any) => {
             let enviarProd = {
               'tiendaId': this.tiendaSelec.id,
               'moduloId': this.moduloSelec.id,
               'productoId': e.productoId
             }
             this.api.procesarCambios(enviarProd).subscribe((data)=>{
               this.cambios = this.cambios + 1
               console.log(data)
               seleccionadas.shift()
               this.productos = this.productos + calculo
               if (seleccionadas.length == 0){
                this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: `¡Se actualizaron los datos! Guardaste ${this.cambios} cambios.` });
                this.cambios = 0
                this.loadingProductos = false;
                this.productos = 0
              }
             })
            });
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
  
  irCambios(){
    this.router.navigate(['cambiosrealizados'])
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.componentLoading = false;
    });
   }
   
}
