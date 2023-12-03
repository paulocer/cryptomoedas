// bubble-chart.component.ts
import { Component, Input, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bubble-chart',
  template: '<div id="bubble-chart"></div>',
  styleUrls: ['./bubble-chart.component.scss']
})
export class BubbleChartComponent implements OnInit, AfterViewInit {
  @Input() selectedCrypto: string = 'USDT';
  @Input() percentualVariacao: number = 10;
  @Input() data: any[] = [];

  constructor(private el: ElementRef) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.createBubbleChart();
  }

  private createBubbleChart(): void {
    const width = 1024;
    const height = 768;
    // Restante do seu código para criar o gráfico de bolhas
    // Certifique-se de usar 'this.data' para acessar os dados fornecidos pelo componente pai

    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
    // Restante do seu código...

    const chartElement = this.el.nativeElement.querySelector('#bubble-chart');
    chartElement.appendChild(svg.node());
  }
}
