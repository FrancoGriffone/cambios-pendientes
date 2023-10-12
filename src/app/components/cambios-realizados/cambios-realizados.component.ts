import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
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

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

  //VARIABLES
  componentLoading: boolean = true //BOOLEAN PARA LA BARRA DE CARGA EN GENERAL

  tienda: any //SETEA LAS TIENDAS QUE ESTÁN CARGADAS EN LA API

  tiendaSelec: any //TIENDA SELECCIONADA EN EL DROPDOWN

  modulo: any //SETEA LOS MÓDULOS QUE ESTÁN CARGADOS EN LA API

  moduloSelec: any //MÓDULO SELECCIONADO EN EL DROPDOWN

  idProd: any //PARA EL INPUT DONDE SE COLOCA EL ID DEL PRODUCTO (ES OPCIONAL COMPLETARLO)

  filas: any //PARA EL INPUT DONDE SE COLOCA LA CANTIDAD DE FILAS (ES OPCIONAL COMPLETARLO)

  desde = dayjs().subtract(1, 'day').toDate() //FECHA A PARTIR DE LA QUE BUSCA

  inputDesde = dayjs(this.desde).format('DD/MM/YYYY HH:mm')

  hasta = dayjs().toDate() //FECHA HASTA DONDE BUSCA

  inputHasta = dayjs(this.hasta).format('DD/MM/YYYY HH:mm')

  data: any //DATOS COLOCADOS PARA CARGAR EL AG GRID, SE SETEAN EN EL SESSION STORAGE

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//
  
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
      {field: 'fyH', headerName: 'Fecha y hora', valueFormatter: params => dayjs(params.data.fyH).format('DD/MM/YYYY HH:mm')},
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

  sizeBtn: boolean = true //BOTÓN PARA EL CAMBIO DE TAMAÑO DE COLUMNAS AG GRID
  
  //FIN AG GRID VARIABLES 

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//
  
  constructor(private api: ApiService,
    private router: Router,
    private messageService: MessageService,
    private titleService: Title){
      //CAMBIO DE TITULO
      this.titleService.setTitle("Actualizar Ecommerce - realizados");
    }

  ngOnInit() {
    this.componentLoading = true;
    
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
        this.filas = this.data?.filas
        this.idProd = this.data?.idProd
        this.tiendaSelec = this.tienda?.find((x: any) => x?.id == this.data?.tiendaId);
        this.moduloSelec = this.modulo?.find((x: any) => x?.id == this.data?.moduloId);
      }
    })
  }

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

  //FUCIONES AG GRID

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
      if(this.idProd == undefined) {
        this.idProd = null
      }
  
      if(this.filas == undefined){
        this.filas = 100
      }
  
      this.data = {
        'tiendaId': this.tiendaSelec.id,
        'moduloId': this.moduloSelec.id,
        'productoId': this.idProd,
        'desde': dayjs(this.desde).format('YYYY-MM-DDTHH:mm:ss.00'),
        'hasta': dayjs(this.hasta).format('YYYY-MM-DDTHH:mm:ss.00'),
        'filas': this.filas
      }

      sessionStorage.setItem('dataSession', JSON.stringify(this.data));

      this.api.obtenerListaRealizados(this.data).pipe(catchError((errors: HttpErrorResponse)=>{
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

  //IR A CAMBIOS PENDIENTES
  irPendientes(){
    this.router.navigate([''])
  }

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

//----------------------------------------------------------------------------------------------------------------//
//----------------------------------------------------------------------------------------------------------------//

  //AFTER INIT
  ngAfterViewInit() {
    setTimeout(() => {
      this.componentLoading = false;
    });
   }
}
