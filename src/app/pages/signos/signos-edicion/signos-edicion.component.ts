import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Paciente } from 'src/app/_model/paciente';
import { Signos } from 'src/app/_model/signos';
import { PacienteService } from 'src/app/_service/paciente.service';
import { SignosService } from 'src/app/_service/signos.service';

@Component({
  selector: 'app-signos-edicion',
  templateUrl: './signos-edicion.component.html',
  styleUrls: ['./signos-edicion.component.css']
})
export class SignosEdicionComponent implements OnInit {

  form: FormGroup;
  id: number;
  edicion: boolean;

  maxFecha: Date = new Date();
  fechaSeleccionada: Date = new Date();

  pacientes: Paciente[];
  pacienteSeleccionado: Paciente;

  //utiles para autocomplete
  myControlPaciente: FormControl = new FormControl();

  pacientesFiltrados$: Observable<Paciente[]>;

  constructor(
    private route: ActivatedRoute,
    private router : Router,
    private signosService : SignosService,
    private pacienteService : PacienteService,
    private dialog : MatDialog,
    private snack: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'id' : new FormControl(0),
      'paciente' : this.myControlPaciente,
      'fecha' : new FormControl(''),
      'temperatura': new FormControl(''),
      'pulso': new FormControl(''),
      'ritmo': new FormControl('')
    });

    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.edicion = params['id'] != null;
      this.initForm();
    });

    this.listarPacientes();
    this.pacientesFiltrados$ = this.myControlPaciente.valueChanges.pipe(map(val => this.filtrarPacientes(val)));

  }

  initForm(){
    if(this.edicion){
      this.signosService.listarPorId(this.id).subscribe(data => {
        this.form = new FormGroup({
          'id': new FormControl(data.idSigno),
          'paciente': new FormControl(data.paciente),
          'fecha': new FormControl(data.fecha),
          'temperatura': new FormControl(data.temperatura),
          'pulso': new FormControl(data.pulso),
          'ritmo': new FormControl(data.ritmo)
        });
        this.pacienteSeleccionado = data.paciente;
      });
      this.listarPacientes();
      this.pacientesFiltrados$ = this.form.controls['paciente'].valueChanges.pipe(map(val => this.filtrarPacientes(val)));
    }
  }

  get f() {
    return this.form.controls;
  }

  operar() {
    if (this.form.invalid) { return; }

    let signo = new Signos();
    signo.idSigno = this.form.value['id'];
    //signo.paciente = this.pacienteSeleccionado;
    signo.paciente = this.form.value['paciente'];
    signo.fecha = this.form.value['fecha'];
    signo.temperatura = this.form.value['temperatura'];
    signo.pulso = this.form.value['pulso'];
    signo.ritmo = this.form.value['ritmo'];

    console.log(signo);

    if(this.edicion){
      this.signosService.modificar(signo).pipe(switchMap(() => {
        return this.signosService.listar();
      }))
      .subscribe(data => {
        this.signosService.setSignosCambio(data);
        this.signosService.setMensajeCambio('SE MODIFICO CORRECTAMENTE');
      });
    }else{
      this.signosService.registrar(signo).subscribe(() => {
        this.signosService.listar().subscribe(data => {
          this.signosService.setSignosCambio(data);
          this.signosService.setMensajeCambio('SE REGISTRO CORRECTAMENTE');
        });
      });
    }
    this.router.navigate(['signos']);
  }

  filtrarPacientes(val : any){
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || option.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || option.dni.includes(val.dni));
    } else {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.toLowerCase()) || option.apellidos.toLowerCase().includes(val.toLowerCase()) || option.dni.includes(val));
    }
  }

  mostrarPaciente(val : Paciente){
    console.log("Mostrar Paciente");
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  seleccionarPaciente(e: any) {
    console.log("Seleccionar Paciente");
    this.pacienteSeleccionado = e.option.value;
  }

  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
      console.log(data);
    });
  }

}
