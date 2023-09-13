import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private GET_TIENDAS = 'http://192.168.0.9:100/api/ecommerce/tiendas'

  private GET_MODULOS = 'http://192.168.0.9:100/api/ecommerce/modulos'

  private POST_CAMBIOS_PENDIENTES = 'http://192.168.0.9:100/api/ecommerce/lista'

  private POST_CAMBIOS_REALIZADOS = 'http://192.168.0.9:100/api/ecommerce/log'

  private PUT_PROCESAR_CAMBIOS = 'http://192.168.0.9:100/api/ecommerce/actualizar'

  constructor(private http: HttpClient) { }

  //OBTENER LOCALIDADES
  obtenerTiendas(){
    const url = this.GET_TIENDAS;
    return this.http.get(url)
  }

  //OBTENER LOCALIDADES
  obtenerModulos(){
    const url = this.GET_MODULOS;
    return this.http.get(url)
  }

  //OBTENER LISTA PENDIENTES
  obtenerListaPendientes(data: Object){
    const url = this.POST_CAMBIOS_PENDIENTES;
    return this.http.post(url, data)
  }
    
  //OBTENER LISTA PENDIENTES
  obtenerListaRealizados(data: Object){
    const url = this.POST_CAMBIOS_REALIZADOS;
    return this.http.post(url, data)
  }

  //OBTENER LISTA PENDIENTES
  procesarCambios(data: Object){
    const url = this.PUT_PROCESAR_CAMBIOS;
    return this.http.put(url, data)
  }
}
