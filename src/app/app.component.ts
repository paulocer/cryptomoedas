import { AfterViewInit, Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  title = 'cryptomoedas';
  objData: { [key: string]: number } = {};
  availableCryptos: string[] = ['USDT']; // Adicione outras criptomoedas conforme necessário
  //availableCryptos: string[] = ['BNB', ' DOGE', 'XRP', 'BTC', 'ETH', 'USDT', 'TUSD', 'LTC']; // Adicione outras criptomoedas conforme necessário
  selectedCrypto: string = 'USDT'; // Defina a criptomoeda padrão
  percentualVariacao: number = 10; // Valor padrão, pode ser ajustado conforme necessário

  options = {
    label: (d: { id: string; value: number; }) => d.id + '\n' + d.value.toFixed(2) + '%',
    value: (d: { value: number; }) => Math.abs(d.value),
    group: (d: { value: number; }) => d.value >= 0 ? 'green' : 'red',
    title: (d: { id: any; }) => d.id,
    link: (d: { id: string; }) => 'https://www.binance.com/pt-BR/trade/' + d.id + '_' + this.selectedCrypto + '?type=spot',
    width: 1024,
    height: 768
  }
  filteredData = Object.keys(this.objData)
    .map(symbol => {
      return {
        id: symbol.replace(this.selectedCrypto, ''),
        value: this.objData[symbol]
      };
    })
    .filter(o => Math.abs(o.value) > this.percentualVariacao);

  ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');

  src = "https://d3js.org/d3.v4.min.js"

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit(): void {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
    this.ws.onmessage = (event) => {
      const json = JSON.parse(event.data);
      const regex = new RegExp(`^.{2,}(DOWN|UP)${this.selectedCrypto}$`);
      json.filter((o: { s: string; }) => o.s.endsWith(this.selectedCrypto)
        && !regex.test(o.s))
        .forEach((o: { s: string | number; c: string; o: string; }) => {
          this.objData[o.s] = ((parseFloat(o.c) * 100) / parseFloat(o.o)) - 100;
        });

      this.filteredData = Object.keys(this.objData)
        .map(symbol => {
          return {
            id: symbol.replace(this.selectedCrypto, ''),
            value: this.objData[symbol]
          };
        })
        .filter(o => Math.abs(o.value) > this.percentualVariacao);

      // Atualiza o gráfico usando o Angular Renderer
      this.renderBubbleChart(this.filteredData);
    };

  }

  ngAfterViewInit(): void {
    this.updateBubbleChart(this.filteredData);
  }

  private updateBubbleChart(data: { id: string; value: number }[]): void {
    // Lógica para atualizar o DOM com os dados filtrados e mapeados
    // Exemplo usando o Angular Renderer
    const chartElement = this.el.nativeElement.querySelector('#bubble-chart');
    chartElement.innerHTML = '';
    // Aqui você pode usar a lógica específica do seu gráfico para atualizar os dados
    // No exemplo, estou apenas exibindo os dados como uma string no elemento
    this.renderer.setProperty(chartElement, 'innerText', JSON.stringify(data));
  }

  // ...

  private renderBubbleChart(data: { id: string; value: number }[]): void {
    // Selecione o elemento do gráfico usando o ElementRef
    const chartElement = this.el.nativeElement.querySelector('#bubble-chart');

    // Limpe qualquer conteúdo existente no elemento antes de renderizar o gráfico
    chartElement.innerHTML = '';

    // Obtém a largura da tela
    const screenWidth = window.innerWidth;

    // Define um espaçamento entre as bolhas (ajuste conforme necessário)
    const bubbleSpacing = 10;

    // Calcula a largura disponível para as bolhas, considerando o espaçamento
    const availableWidth = screenWidth - (data.length - 1) * bubbleSpacing;

    // Crie um contêiner SVG para o gráfico usando D3.js
    const svg = d3.select(chartElement)
      .append('svg')
      .attr('width', screenWidth - 20)  // Defina a largura para ocupar toda a tela
      .attr('height', this.options.height);

    // Crie uma escala para o raio dos círculos (valores baseados em dados)
    const radiusScale: d3.ScaleLinear<number, number> = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.abs(d.value))!])
      .range([0, availableWidth / data.length]);  // Ajuste conforme necessário

    // Crie escalas para posicionar os círculos ao longo dos eixos x e y
    const xScale: d3.ScaleLinear<number, number> = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([100, availableWidth - 100]);

    const yScale: d3.ScaleLinear<number, number> = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.abs(d.value))! + 5])
      .range([this.options.height, 0]);

    // Adicione círculos para cada ponto de dados
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => xScale(i) + i * bubbleSpacing)  // Adicione o espaçamento entre as bolhas
      .attr('cy', d => yScale(Math.abs(d.value)))
      .attr('r', d => Math.min(radiusScale(Math.abs(d.value)), availableWidth / (2 * data.length)))
      .attr('fill', d => this.options.group(d));

    // Adicione rótulos para cada círculo
    svg.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('x', (d, i) => xScale(i) + i * bubbleSpacing)  // Adicione o espaçamento entre as bolhas
      .attr('y', d => yScale(Math.abs(d.value)))
      .attr('text-anchor', 'middle')
      .text(d => this.options.label(d));
  }

  private BubbleChart(): void {
    // Mantenha sua lógica de WebSocket aqui
    // ...

    // Depois de receber os dados, chame a função de atualização
    // this.updateBubbleChart(filteredData);
  }

  onCryptoChange(): void {
    // Chame a função para atualizar o gráfico com base na nova seleção
    this.ws.onmessage = (event) => {
      const json = JSON.parse(event.data);
      const regex = new RegExp(`^.{2,}(DOWN|UP)${this.selectedCrypto}$`);
      json.filter((o: { s: string; }) => o.s.endsWith(this.selectedCrypto)
        && !regex.test(o.s))
        .forEach((o: { s: string | number; c: string; o: string; }) => {
          this.objData[o.s] = ((parseFloat(o.c) * 100) / parseFloat(o.o)) - 100;
        });
    }

    this.filteredData = Object.keys(this.objData)
      .map(symbol => {
        return {
          id: symbol.replace(this.selectedCrypto, ''),
          value: this.objData[symbol]
        };
      })
      .filter(o => Math.abs(o.value) > this.percentualVariacao);

    this.renderBubbleChart(this.filteredData);
  }

  onPercentualChange(): void {
    // Atualize a lógica de filtragem com base no novo percentual de variação
    this.ws.onmessage = (event) => {
      const json = JSON.parse(event.data);
      const regex = new RegExp(`^.{2,}(DOWN|UP)${this.selectedCrypto}$`);
      json.filter((o: { s: string; }) => o.s.endsWith(this.selectedCrypto)
        && !regex.test(o.s))
        .forEach((o: { s: string | number; c: string; o: string; }) => {
          this.objData[o.s] = ((parseFloat(o.c) * 100) / parseFloat(o.o)) - 100;
        });

      this.filteredData = Object.keys(this.objData)
        .map(symbol => {
          return {
            id: symbol.replace(this.selectedCrypto, ''),
            value: this.objData[symbol]
          };
        })
        .filter(o => Math.abs(o.value) > this.percentualVariacao);
      this.renderBubbleChart(this.filteredData);
    }

  }
}
