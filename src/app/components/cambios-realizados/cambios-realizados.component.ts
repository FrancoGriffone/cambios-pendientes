import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, DomLayoutType, GridApi, GridReadyEvent } from 'ag-grid-community';
import * as dayjs from 'dayjs';
import { MessageService } from 'primeng/api';
import { catchError, forkJoin, throwError } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cambios-realizados',
  templateUrl: './cambios-realizados.component.html',
  styleUrls: ['./cambios-realizados.component.scss'],
  providers: [MessageService]
})
export class CambiosRealizadosComponent {

  componentLoading: boolean = true

  tienda: any

  tiendaSelec: any 

  modulo: any

  moduloSelec: any

  idProd: any

  filas: any

  desde = dayjs().subtract(1, 'month').toDate()

  hasta = dayjs().toDate()

  sizeBtn: boolean = true

  //<------------------------------------------------------------------------------------------------------------------>
  
  //AG GRID VARIABLES
  public domLayout: DomLayoutType = 'autoHeight';

    colDefs: ColDef[] = [
      {field: 'id', headerName: 'ID'},
      {field: 'codigo', headerName: 'Código'},
      {field: 'padre', headerName: 'C. Padre'},
      {field: 'producto', headerName: 'Producto'},
      {field: 'tienda', headerName: 'Tienda'},
      {field: 'modulo', headerName: 'Módulo'},
      {field: 'respuesta', headerName: 'Respuesta'},
      {field: 'fyH', headerName: 'Fecha y hora', valueFormatter: params => dayjs(params.data.fecha).format('DD/MM/YYYY h:mm')},
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

  private gridApi!: GridApi //EVENTO GRID API
  gridColumnApi: any;
  rowHeight: any;
  
  //FIN AG GRID VARIABLES 

  //<------------------------------------------------------------------------------------------------------------------>
  
  constructor(private api: ApiService,
    private router: Router,
    private messageService: MessageService){}

  ngOnInit() {
    this.componentLoading = true;
    //APIS
    let tiendas = this.api.obtenerTiendas()
    let modulos = this.api.obtenerModulos()

    forkJoin([tiendas, modulos])
    .subscribe(results =>{
      this.tienda = results[0]
      this.modulo = results[1]
    })
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
      if(this.idProd == undefined) {
        this.idProd = null
      }
  
      if(this.filas == undefined){
        this.filas = 100
      }
  
      let datos = {
        'tiendaId': this.tiendaSelec.id,
        'moduloId': this.moduloSelec.id,
        'productoId': this.idProd,
        'desde': dayjs(this.desde).format('YYYY-MM-DD'),
        'hasta': dayjs(this.hasta).format('YYYY-MM-DD'),
        'filas': this.filas
      }

      this.api.obtenerListaRealizados(datos).pipe(catchError((errors: HttpErrorResponse)=>{
        Swal.fire({
          title: '¡Error!',
          text: 'La conexión a internet es muy débil o el servidor está experimentando problemas. Verifica el estado de tu red o ponte en contacto con quien está a cargo del servidor',
          icon: 'error',
          confirmButtonText: 'Volver atrás'
        })
        this.componentLoading = false;
        return throwError(errors);
      })).subscribe((data)=>{
        this.rowData = data
        this.componentLoading = false;
      })
    }
  }

  //EVENTO ONGRID, CUANDO SE CARGA LA GRID TRAE LOS DATOS
  onGridReady(params: GridReadyEvent){
    this.gridApi = params.api
    this.gridColumnApi = params.columnApi
    this.rowHeight = 25;
  }

  //BOTON PARA EXPORTAR LA LISTA A UN EXCEL
  onBtExport() {
    if (this.rowData == undefined){
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Error', 
        detail: 'La lista no tiene datos. Cargue primero los datos para poder imprimirlos.' });
    } else {
      this.gridApi.exportDataAsExcel();
    }
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

  irPendientes(){
    this.router.navigate([''])
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.componentLoading = false;
    });
   }
}
