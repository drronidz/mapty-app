'use strict';

// prettier-ignore
const months =
    ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    date = new Date()
    id = ((Date.now() + '').slice(-11))
    constructor(coordinates, distance, duration) {
        this.coordinates = coordinates // [latitude, longitude]
        this.distance= distance // in KM
        this.duration = duration // in MIN
    }
}

class Running extends Workout {
    constructor(coordinates, distance, duration, cadence) {
        super(coordinates, distance, duration);
        this.cadence = cadence
        this.calculatePace()
    }

    calculatePace() {
        // min/km
        this.pace = this.duration / this.distance
        return this.pace
    }
}

class Cycling extends Workout {
    constructor(coordinates, distance, duration, elevationGain) {
        super(coordinates, distance, duration);
        this.elevationGain = elevationGain
        this.calculateSpeed()
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
class App {
    #map
    #mapEvent
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

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }

    _newWorkout(event) {
        event.preventDefault()

        // Clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''

        // Display Marker
        const {lat, lng} = this.#mapEvent.latlng
        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup'
            }))
            .setPopupContent('Workout')
            .openPopup()
    }
}

const app = new App()
// app._getPosition()




