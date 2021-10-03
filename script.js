'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const {latitude, longitude} = position.coords
            console.log('latitude :',latitude,' , ', 'longitude :', longitude)
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`)

            // Creating a table for coordinates
            const coords = [latitude, longitude]

            const map = L.map('map').setView(coords, 10);

            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            L.marker(coords)
                .addTo(map)
                .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
                .openPopup();
        },
        function () {
            alert('coordinatesuld not get your position ...!')
        })
} else {
    alert('Your browser is too old !')
}

