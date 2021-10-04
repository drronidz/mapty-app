'use strict';


class Workout {

    date = new Date()
    id = ((Date.now() + '').slice(-11)) // TODO: add correct method to generate IDs

    constructor(coordinates, distance, duration) {
        this.coordinates = coordinates // [latitude, longitude]
        this.distance= distance // in KM
        this.duration = duration // in MIN
    }

    _setDescription() {
        const months =
            ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on 
        ${months[this.date.getMonth()]} ${this.date.getDay()}`
    }

}

class Running extends Workout {

    type = 'running'

    constructor(coordinates, distance, duration, cadence) {
        super(coordinates, distance, duration);
        this.cadence = cadence
        this.calculatePace()
        this._setDescription()
    }

    calculatePace() {
        // min/km
        this.pace = this.duration / this.distance
        return this.pace
    }
}

class Cycling extends Workout {

    type = 'cycling'

    constructor(coordinates, distance, duration, elevationGain) {
        super(coordinates, distance, duration);
        this.elevationGain = elevationGain
        this.calculateSpeed()
        this._setDescription()
    }

    calculateSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60)
        return this.speed
    }
}

const running1 = new Running([39, -12], 5.2, 24, 178)
const cycling1 = new Cycling([39, -12], 27, 95, 523)
console.log(running1, cycling1)


/*
* This is The Application Architecture
**/

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App {
    #map
    #mapEvent
    #workouts = []

    constructor() {
        this._getPosition()
        form.addEventListener('submit', this._newWorkout.bind(this))
        inputType.addEventListener('change', this._toggleElevationField)
    }

    _getPosition(){
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
                function () {
                    alert('coordinates uld not get your position ...!')
                })}
    }

    _loadMap(position) {
        const {latitude, longitude} = position.coords
        console.log('latitude :', latitude, ' , ', 'longitude :', longitude)
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`)

        // Creating a table for coordinates
        const coords = [latitude, longitude]

        this.#map = L.map('map').setView(coords, 10);
        console.log(this)
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Handling clicks on map
        this.#map.on('click', this._showForm.bind(this))
    }

    _showForm(mapE) {
        this.#mapEvent = mapE
        form.classList.remove('hidden')
        inputDistance.focus()
    }

    _hideForm() {
        form.style.display = 'none'
        form.classList.add('hidden')
        setTimeout(() => (form.style.display = 'grid'), 1000)
    }

    _clearFormInputs() {
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
    }

    _toggleElevationField(changeEvent) {
        console.log(changeEvent)
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }

    _newWorkout(event) {
        const validateInput = (...inputs) =>
            // .every() checks every input (if it contains a finite Number ... and return true or false)
            inputs.every(input => Number.isFinite(input))

        const allPositive = (...inputs) =>
            // .every() check if every input is greater than 0 then return true or false
            inputs.every(input => input > 0)
        event.preventDefault()

        // Get data from the form
        const type = inputType.value
        const distance = +inputDistance.value
        const duration = +inputDuration.value
        const {lat, lng} = this.#mapEvent.latlng
        let workout

        // If activity running,
        if (type === 'running') {
            const cadence = +inputCadence.value

            // Check if data is valid
            if (!validateInput(distance, duration, cadence) ||
                !allPositive(distance, duration, cadence))
                return alert('Inputs must be positive numbers')

            // Create the running workout object
            workout = new Running([lat, lng], distance, duration, cadence)
        }

        // If activity cycling, create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value
            // Check if data is valid
            if (!validateInput(distance, duration, elevation) ||
                // (elevation argument can be negative)
                !allPositive(distance, duration))
                return alert('Inputs must be positive numbers')
            workout = new Cycling([lat, lng],distance,duration,elevation)
        }
        // Add new object to workout array
        this.#workouts.push(workout)
        console.log(workout.prototype)
        console.log(this.#workouts)

        // Render workout on map as marker
        this._renderWorkoutMarker(workout)

        // Render workout on list
        this._renderWorkout(workout)

        // Hide form + clear input fields
        this._clearFormInputs()
        this._hideForm()
    }

    _renderWorkoutMarker(workout) {
        console.log(workout.type)
        L.marker(workout.coordinates)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂' : '🚴‍♀' } ${workout.description}`)
            .openPopup()
    }

    _renderWorkout(workout) {
        let node = ` 
       <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">
                ${workout.type === 'running' ? '🏃‍♂' : '🚴‍♀' }
            </span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`

        if (workout.type === 'running') {
            node += `
           <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
        }
        if (workout.type === 'cycling') {
             node += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
            `
        }
        form.insertAdjacentHTML('afterend', node)
    }

}

const app = new App()
// app._getPosition()




