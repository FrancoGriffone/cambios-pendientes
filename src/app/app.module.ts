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



@NgModule({
  declarations: [
    AppComponent,
    ListaCambiosPendientesComponent,
    CambiosRealizadosComponent
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
    ToastModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
