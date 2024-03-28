// state
let currCity = "";
let units = "metric";

const API_KEY = '64f60853740a1ee3ba20d0fb595c97d5';

// Selectors
let city = document.querySelector(".weather__city");
let datetime = document.querySelector(".weather__datetime");
let weather__forecast = document.querySelector('.weather__forecast');
let weather__temperature = document.querySelector(".weather__temperature");
let weather__icon = document.querySelector(".weather__icon");
let weather__minmax = document.querySelector(".weather__minmax")
let weather__realfeel = document.querySelector('.weather__realfeel');
let weather__humidity = document.querySelector('.weather__humidity');
let weather__wind = document.querySelector('.weather__wind');
let weather__pressure = document.querySelector('.weather__pressure');
const listContentEL = document.querySelector(".wrapper .carousel");
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// search
document.querySelector(".weather__search").addEventListener('submit', e => {
    let search = document.querySelector(".weather__searchform");
    // prevent default action
    e.preventDefault();
    // change current city
    currCity = search.value;
    // get weather forecast 
    getWeather();
    // clear form
    search.value = ""
})

// units
document.querySelector(".weather_unit_celsius").addEventListener('click', () => {
    if(units !== "metric"){
        // change to metric
        units = "metric"
        // get weather forecast 
        getWeather()
    }
})

document.querySelector(".weather_unit_farenheit").addEventListener('click', () => {
    if(units !== "imperial"){
        // change to imperial
        units = "imperial"
        // get weather forecast 
        getWeather()
    }
})

function convertTimeStamp(timestamp, timezone){
     const convertTimezone = timezone / 3600; // convert seconds to hours 

    const date = new Date(timestamp * 1000);
    let day=date.toUTCString();

    let array = Array.from(day);
    
    let z = array[day.length-3]+array[day.length-2]+array[day.length-1];
    console.log(day);
    
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: `GMT${convertTimezone >= 0 ? "-" : "+"}${Math.abs(convertTimezone)}`,
        hour12: true,
    }
    datetime.innerHTML =  date.toLocaleString("en-US", options);
   
}
 function setTime(timeStamp){
    let date =new Date(timeStamp*1000);
    let hour = date.getHours();
    let min = date.getMinutes();
    console.log(date);
    console.log(hour);
    
    let year =date.getFullYear();
    let day =date.getDate();
    let month =date.toLocaleString("default",{month:"long"});

    document.getElementById("date").textContent = year+"   "+month+" "+day;
    document.getElementById("time").textContent =hour+":"+min;

 }
 

// convert country code to name
function convertCountryCode(country){
    let regionNames = new Intl.DisplayNames(["en"], {type: "region"});
    return regionNames.of(country)
}

function getWeather(){
  listContentEL.innerHTML = "";

fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currCity}&appid=${API_KEY}&units=${units}`)
    .then(res => res.json())
        .then(data => {
    console.log(data)
    city.innerHTML = `${data.name}, ${convertCountryCode(data.sys.country)}`
    weather__forecast.innerHTML = `<p>${data.weather[0].main}`
    weather__temperature.innerHTML = `${data.main.temp.toFixed()}&#176`
    weather__icon.innerHTML = `   <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" />`
    weather__minmax.innerHTML = `<p>Min: ${data.main.temp_min.toFixed()}&#176</p><p>Max: ${data.main.temp_max.toFixed()}&#176</p>`
    weather__realfeel.innerHTML = `${data.main.feels_like.toFixed()}&#176`
    weather__humidity.innerHTML = `${data.main.humidity}%`
    weather__wind.innerHTML = `${data.wind.speed} ${units === "imperial" ? "mph": "m/s"}` 
    weather__pressure.innerHTML = `${data.main.pressure} hPa`
   //convertTimeStamp(data.dt,data.timezone); 
   setTime(data.dt);
   initMap(data.coord.lat,data.coord.lon);
   displayForeCast(data.coord.lat, data.coord.lon);
   
})
}

function currentLocation() {
    const success = async (position) => {
      console.log(position);
      const lat = position.coords.latitude;
      const long = position.coords.longitude;
  
      console.log(lat + " " + long);
      const geo_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${API_KEY}`;
  
      const data = await fetch(geo_API);
      const result = await data.json();
      currCity = result.city.name;
      getWeather();
    };
    const error = () => {};
    navigator.geolocation.getCurrentPosition(success, error);
  }

document.body.addEventListener('load', currentLocation())


// Initialize and add the map
let map;

async function initMap(tatNum,longNum) {
  // The location of Uluru
  const position = { lat: tatNum, lng: longNum};
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    zoom: 15,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Uluru",
  });
}
async function displayForeCast(lat, lon) {
  const ForeCast_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  const data = await fetch(ForeCast_API);
  const result = await data.json();
  console.log(result);

  const uniqeForeCastDays = [];
  const daysForeCast = result.list.filter((forecast) => {
    const forecastDate = new Date(forecast.dt_txt).getDate();
    if (!uniqeForeCastDays.includes(forecastDate)) {
      return uniqeForeCastDays.push(forecastDate);
    }
  });

  console.log(daysForeCast);

  daysForeCast.forEach((content, index) => {
    if (index <= 3) {
      listContentEL.insertAdjacentHTML("afterbegin", foreCast(content));
    }
  });
}

function foreCast(frContent) {
  const day = new Date(frContent.dt_txt);
  const dayName = days[day.getDay()];
  const splitDay = dayName.split("", 3);

  const joinDay = splitDay.join("");
  console.log(joinDay);

  return `<li class="card">
    <img src="https://openweathermap.org/img/wn/${
      frContent.weather[0].icon
    }@2x.png" alt="">
    <span>${joinDay}</span>
    <span class="day_temp">${Math.round(frContent.main.temp - 275.15)}°C</span>
</li>`;
}