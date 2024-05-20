import { Controller } from "@hotwired/stimulus"
import ApexCharts from 'apexcharts';

// Connects to data-controller="weights"
export default class extends Controller {
  connect() {
    console.log('Hello, Stimulus!');
    // Set unit from cookie or default to 'kg'
    this.unit = this.getCookie("preferred_unit") || "kg";  
    // Initialize default timeframe to '7_days'
    this.currentTimeFrame = '7_days';  
    // Unload any existing chart and load the new chart
    this.unloadChart();
    this.loadChart();
  }

  disconnect() {
    // Unload the chart when the controller is disconnected
    this.unloadChart();
  }

  // Unloads the chart before loading new data
  unloadChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // Loads chart data from the server and prepares it for rendering
  loadChart() {
    fetch(`/dashboard.json?time_frame=${this.currentTimeFrame}`)
      .then(response => response.json())
      .then(data => this.prepareChartData(data))
      .catch(error => console.error('Error loading chart data:', error));
  }

  // Prepares and renders chart data
  prepareChartData(data) {
    const convertedData = this.convertWeights(data);
    const formattedCategories = this.formatCategories(convertedData);
    const seriesData = formattedCategories.map(date => convertedData[date]);
    this.renderChart(formattedCategories, seriesData);
  }

  // Converts the weights according to the current unit
  convertWeights(data) {
    return Object.entries(data).reduce((result, [date, value]) => {
      const weight = parseFloat(value);
      result[date] = this.unit === 'lbs' ? this.kgToLbs(weight) : weight;
      return result;
    }, {});
  }
  
  // Formats categories by filtering dates based on the selected timeframe
  formatCategories(data) {
    const keys = Object.keys(data);
    return keys.filter(key => this.filterDates(key, this.currentTimeFrame));
  }

  // Date filtering logic for different timeframes
  filterDates(date, timeFrame) {
    const dateObj = new Date(date);
    switch (timeFrame) {
      case 'last_year':
      case 'all_time':
        // Filter to include only the first day of each month/year
        return dateObj.getDate() === 1;
      case '90_days':
        // Filter to include only Mondays
        return dateObj.getDay() === 1;
      default:
        // Include all dates
        return true;
    }
  }

  // Renders the chart with formatted data
  renderChart(categories, seriesData) {
    const chartOptions = this.getChartOptions(categories, seriesData);
    if (this.chart) {
      this.chart.updateOptions(chartOptions, true);
    } else {
      this.chart = new ApexCharts(this.element.querySelector("#chart"), chartOptions);
      this.chart.render();
    }
  }

  // Chart configuration options
  getChartOptions(categories, seriesData) {
    return {
      series: [{ name: 'Weight', data: seriesData }],
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false }
      },
      stroke: { curve: 'smooth' },
      xaxis: { categories: categories.map(date => this.formatDateLabel(date)) },
      yaxis: {
        labels: {
          formatter: value => value.toFixed(2)
        }
      }
    };
  }

  // Formats date labels based on the timeframe
  formatDateLabel(dateString) {
    // Assuming dateString is in ISO format, interpret as UTC
    const date = new Date(dateString + 'T00:00:00Z');
    const options = this.currentTimeFrame === 'all_time'
      ? { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
      : { month: 'short', day: 'numeric', timeZone: 'UTC' };
    return date.toLocaleDateString('en-US', options);
  }

  // Event handlers for UI interactions

  // Updates the chart based on the selected timeframe
  updateChart(event) {
    this.currentTimeFrame = event.target.value;
    this.loadChart();
  }

  // Toggles the unit and reloads the chart
  toggleUnit(event) {
    this.unit = event.target.value;
    this.setCookie("preferred_unit", this.unit, 7);
    console.log("Unit changed to:", this.unit);
    this.loadChart();
  }
  
  // Converts kilograms to pounds
  kgToLbs(kg) { return kg * 2.20462; }
  // Converts pounds to kilograms
  lbsToKg(lbs) { return lbs / 2.20462; }
  // Converts days to milliseconds
  daysToMilliseconds(days) { return days * 86400000; }
  
  // Sets a cookie with the given name, value, and expiration in days
  setCookie(name, value, days) {
    const expires = new Date(Date.now() + this.daysToMilliseconds(days)).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  // Retrieves the value of a cookie by name
  getCookie(name) {
    return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
  }
}
