import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap } from 'rxjs/operators';
import { Signos } from 'src/app/_model/signos';
import { SignosService } from 'src/app/_service/signos.service';

@Component({
  selector: 'app-signos',
  templateUrl: './signos.component.html',
  styleUrls: ['./signos.component.css']
})
export class SignosComponent implements OnInit {

  displayedColumns = ['idSigno', 'paciente', 'fecha', 'temperatura', 'pulso', 'ritmo', 'acciones'];
  dataSource: MatTableDataSource<Signos>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  cantidad: number = 0;

  constructor(
    private signosService: SignosService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.signosService.listarPageable(0, 10).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });

    this.signosService.getSignosCambio().subscribe(data => {
      this.crearTabla(data);
    });

    this.signosService.getMensajeCambio().subscribe(data => {
      this.snackBar.open(data, 'AVISO', { duration: 2000 });
    });
  }

  crearTabla(data: Signos[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  eliminar(idSigno: number) {
    this.signosService.eliminar(idSigno).pipe(switchMap(() => {
      return this.signosService.listar();
    }))
    .subscribe(data => {
      this.signosService.setSignosCambio(data);
      this.signosService.setMensajeCambio('SE ELIMINO');
    });
  }

  mostrarMas(e: any) {
    this.signosService.listarPageable(e.pageIndex, e.pageSize).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });
  }

}
