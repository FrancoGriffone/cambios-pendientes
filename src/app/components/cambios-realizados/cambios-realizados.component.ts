import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, DomLayoutType, GridApi, GridReadyEvent } from 'ag-grid-community';
import * as dayjs from 'dayjs';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-cambios-realizados',
  templateUrl: './cambios-realizados.component.html',
  styleUrls: ['./cambios-realizados.component.scss'],
  providers: [MessageService]
})
export class CambiosRealizadosComponent {

  tienda: any

  tiendaSelec: any 

  modulo: any

  moduloSelec: any

  idProd: any

  filas: any

  desde = dayjs().subtract(1, 'month').toDate()

  hasta = dayjs().toDate()

  //<------------------------------------------------------------------------------------------------------------------>
  
  //AG GRID VARIABLES
  public domLayout: DomLayoutType = 'autoHeight';

    colDefs: ColDef[] = [
      {field: 'id', headerName: 'ID', width: 150},
      {field: 'codigo', headerName: 'Código', width: 150},
      {field: 'padre', headerName: 'C. Padre', width: 150},
      {field: 'producto', headerName: 'Producto', width: 300},
      {field: 'tienda', headerName: 'Tienda', width: 150},
      {field: 'modulo', headerName: 'Módulo', width: 150},
      {field: 'respuesta', headerName: 'Respuesta', width: 150},
      {field: 'fyH', headerName: 'Fecha y hora', width: 150, valueFormatter: params => dayjs(params.data.fecha).format('DD/MM/YYYY')},
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
  
  //FIN AG GRID VARIABLES 

  //<------------------------------------------------------------------------------------------------------------------>
  
  constructor(private api: ApiService,
    private router: Router,
    private messageService: MessageService){}

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

  onSubmit(){
    if (this.tiendaSelec == undefined){
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No seleccionaste ninguna tienda' });
    } else if (this.moduloSelec == undefined) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No seleccionaste ningun módulo' });
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

      this.api.obtenerListaRealizados(datos).subscribe((data)=>{
        this.rowData = data
      })
    }
  }

  //EVENTO ONGRID, CUANDO SE CARGA LA GRID TRAE LOS DATOS
  onGridReady(params: GridReadyEvent){
    this.gridApi = params.api
  }

  //BOTON PARA EXPORTAR LA LISTA INVISIBLE A UN EXCEL
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

  irPendientes(){
    this.router.navigate([''])
  }
}
