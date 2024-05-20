import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="weight-form"
export default class extends Controller {
  // Defining targets for input and unit elements and a value for the default unit
  static targets = ["input", "unit"]
  static values = { defaultUnit: String }

  // Method called when the controller is connected to the DOM
  connect() {
    // Retrieve the default unit value
    let defaultUnit = this.defaultUnitValue;
    
    // If the default unit does not match the current unit, change the unit and convert the value
    if (defaultUnit != this.unitTarget.value) {
      this.changeUnit();
      this.convert();
    }
  }

  // Method to toggle the unit between 'kg' and 'lbs'
  changeUnit() {
    const currentUnit = this.unitTarget.value;
    if (currentUnit === 'lbs') {
      this.unitTarget.value = 'kg';
    } else {
      this.unitTarget.value = 'lbs';
    }
  }

  // Method to convert the weight value based on the current unit
  convert() {
    const weight = parseFloat(this.inputTarget.value); // Parse the weight value from the input field
    const currentUnit = this.unitTarget.value; // Get the current unit
    if (!isNaN(weight)) { // Check if the weight value is a valid number
      if (currentUnit === 'lbs') {
        // If the unit is 'lbs', convert kg to lbs
        this.inputTarget.value = (weight * 2.20462).toFixed(2);  // Convert kg to lbs and format to 2 decimal places
      } else {
        // If the unit is 'kg', convert lbs to kg
        this.inputTarget.value = (weight / 2.20462).toFixed(2);  // Convert lbs to kg and format to 2 decimal places
      }
    }
  }
}
