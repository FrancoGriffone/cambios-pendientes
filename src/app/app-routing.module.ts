import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaCambiosPendientesComponent } from './components/lista-cambios-pendientes/lista-cambios-pendientes.component';
import { CambiosRealizadosComponent } from './components/cambios-realizados/cambios-realizados.component';

const routes: Routes = [
  {
    path: '',
    component: ListaCambiosPendientesComponent,
  },
  {
    path: 'cambiosrealizados',
    component: CambiosRealizadosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
