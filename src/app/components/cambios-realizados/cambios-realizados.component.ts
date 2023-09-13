import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, DomLayoutType } from 'ag-grid-community';
import * as dayjs from 'dayjs';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-cambios-realizados',
  templateUrl: './cambios-realizados.component.html',
  styleUrls: ['./cambios-realizados.component.scss']
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
  //FIN AG GRID VARIABLES 

  //<------------------------------------------------------------------------------------------------------------------>
  
  constructor(private api: ApiService,
    private router: Router){}

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
    if(this.idProd == undefined) {
      this.idProd = null
    }

    if(this.filas == undefined){
      this.filas = 100
    }

    let data = {
      'tiendaId': this.tiendaSelec.id,
      'moduloId': this.moduloSelec.id,
      'productoId': this.idProd,
      'desde': dayjs(this.desde).format('YYYY-MM-DD'),
      'hasta': dayjs(this.hasta).format('YYYY-MM-DD'),
      'filas': this.filas
    }
    this.api.obtenerListaRealizados(data).subscribe((data)=>{
      this.rowData = data
    })
  }

  irPendientes(){
    this.router.navigate([''])
  }
}
