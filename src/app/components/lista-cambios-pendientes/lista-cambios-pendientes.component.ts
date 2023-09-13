import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, DomLayoutType, GridApi, GridReadyEvent } from 'ag-grid-community';
import * as dayjs from 'dayjs';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-lista-cambios-pendientes',
  templateUrl: './lista-cambios-pendientes.component.html',
  styleUrls: ['./lista-cambios-pendientes.component.scss']
})
export class ListaCambiosPendientesComponent {

  tienda: any

  tiendaSelec: any 

  modulo: any

  moduloSelec: any

  desde = dayjs().subtract(1, 'month').toDate()

  hasta = dayjs().toDate()

  datos: any

  //<------------------------------------------------------------------------------------------------------------------>
  
  //AG GRID VARIABLES
  public domLayout: DomLayoutType = 'autoHeight';

    colDefs: ColDef[] = [
      {field: 'color', headerName: 'Color', width: 150},
      {field: 'fechaStock', headerName: 'Fecha Stock', width: 150},
      {field: 'fechaPrecios', headerName: 'Fecha Precios', width: 150, valueFormatter: params => dayjs(params.data.fecha).format('DD/MM/YYYY')},
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
    let data = {
      'tiendaId': this.tiendaSelec.id,
      'moduloId': this.moduloSelec.id,
      'desde': dayjs(this.desde).format('YYYY-MM-DD'),
      'hasta': dayjs(this.hasta).format('YYYY-MM-DD')
    }
    this.api.obtenerListaPendientes(data).subscribe((data)=>{
      this.datos = data
      this.rowData = this.datos.data
    })
  }
  
  irCambios(){
    this.router.navigate(['cambiosrealizados'])
  }
}
