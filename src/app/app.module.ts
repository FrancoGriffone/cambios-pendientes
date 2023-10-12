import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//PRIMEng
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';

//AG GRID
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';

//Para el form es necesario importar esto
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListaCambiosPendientesComponent } from './components/lista-cambios-pendientes/lista-cambios-pendientes.component';
import { CambiosRealizadosComponent } from './components/cambios-realizados/cambios-realizados.component';
import { HttpClientModule } from '@angular/common/http';
import { NabvarComponent } from './components/nabvar/nabvar.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NotConciliacionesComponent } from './components/not-conciliaciones/not-conciliaciones.component';



@NgModule({
  declarations: [
    AppComponent,
    ListaCambiosPendientesComponent,
    CambiosRealizadosComponent,
    NabvarComponent,
    NotConciliacionesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule,
    SelectButtonModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    ProgressBarModule,
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
