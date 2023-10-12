import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaCambiosPendientesComponent } from './components/lista-cambios-pendientes/lista-cambios-pendientes.component';
import { CambiosRealizadosComponent } from './components/cambios-realizados/cambios-realizados.component';
import { NotConciliacionesComponent } from './components/not-conciliaciones/not-conciliaciones.component';

const routes: Routes = [
  {
    path: 'cambiospendientes',
    component: ListaCambiosPendientesComponent,
  },
  {
    path: 'cambiosrealizados',
    component: CambiosRealizadosComponent,
  },
  //RUTA NOT FOUND
  {
  path: '**',
  component: NotConciliacionesComponent
  },   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
