import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, Button, ScrollView, RefreshControl, TextInput, TouchableOpacity, Image } from 'react-native';
import { styles } from './styles';
import * as Location from 'expo-location';
import MapView, { Marker, Callout} from 'react-native-maps';
import * as gpsDB from './gpsDB';
import { DateTimeSelect } from './dateTimeSelection';



const App = () => {

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const mapRef = useRef(null);

  const [address, setAddress] = useState(null);

  const [data, setData] = useState(null);

  const [date, setDate] = useState(new Date());
  const [minDate, setMinDate] = useState(new Date());
  const [maxDate, setMaxDate] = useState(new Date());
  const [secondsInput, setSecondsInput] = useState('00');

  const [refreshing, setRefreshing] = useState(false);

  const [weatherData, setWeatherData] = useState([]);




  const handleSecondsChange = (text) => {
    if (!isNaN(text) && (text === '' || (Number(text) >= 0 && Number(text) <= 59))) {
      setSecondsInput(text);
      const newDate = new Date(date);
      newDate.setSeconds(Number(text));
      setDate(newDate);
    }
  };


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 100);
  }, []);

  const centerMapOnUserLocation = () => {
      if (location && mapRef.current) {
          mapRef.current.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.7,
              longitudeDelta: 0.7
          });
      }
  }; 

  const fetchGPSData = async () => {
    try {
      dateTimeStamp = String(date.getTime()).slice(0, -3);
      const result = await gpsDB.getGPSDataByTimestampAsync(dateTimeStamp);
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } 
  };
  

  const handleClearGPSData = async () => {
    try {
      await gpsDB.clearGPSDataTableAsync();
      alert('GPS data cleared successfully!');
    } catch (error) {
      console.error('Error clearing GPS data:', error);
      alert('Failed to clear GPS data.');
    }
  };

  const dateTimeSelectComponent = useMemo(() => {

      return (
          <DateTimeSelect 
            onDateChange={date => setDate(date)} 
            minDate={minDate} 
            maxDate={maxDate} 
          />
      );
    
  }, []);

  const fetchCitiesInOntario = () => {
    const apiUrl = `http://api.geonames.org/searchJSON?country=CA&adminName1=Ontario&username=kyw4091`;

    return fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Extract city names from the response
        const cityNames = data.geonames.map(city => city.name);
        return cityNames;
    })
    .catch(error => {
        console.error("Error fetching cities:", error);
    });
  };


  const fetchWeatherData = () => {
    fetchCitiesInOntario().then(citiesInProvince => {
        const allWeatherData = [];

        citiesInProvince.forEach(city => {
            const apiUrl = `http://api.weatherapi.com/v1/current.json?key=ce45479e292f40d8a27144426232310&q=${city}&aqi=yes`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(weatherData => {

                  if (allWeatherData.length == citiesInProvince.length) {
                    console.log(allWeatherData);
                    setWeatherData(allWeatherData);
                  }
                    
                  allWeatherData.push({
                      city: city,
                      data: weatherData
                  });

                    
                }) 
                .catch(error => {
                    console.log("Error fetching weather for city:", city, error);
                });
        });
    });
    console.log(weatherData);
  };




  // for debug
  const handlePrintAllData = async () => {
    try {
      const allData = await gpsDB.getAllGPSDataAsync();
      console.log(allData);
    } catch (error) {
      console.error("Error fetching all data:", error);
    }
  };
  

  useEffect(() => {
    async function initDB() {
      await gpsDB.setupDatabaseAsync();
    }
    initDB();
  }, []);

  useEffect(() => {
    let locationWatcher = null;

    (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        locationWatcher = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, timeInterval: 1000, distanceInterval: 0 },
            async (newLocation) => {
                setLocation(newLocation)

                const prefix = String(newLocation.timestamp).slice(0, -3);
                await gpsDB.insertGPSDataAsync(prefix, newLocation.coords.latitude, newLocation.coords.longitude);

                try {
                    let results = await Location.reverseGeocodeAsync({
                        latitude: newLocation.coords.latitude,
                        longitude: newLocation.coords.longitude,
                    });
                    if (results && results.length > 0) {
                        setAddress(results[0]);
                    }
                } catch (error) {
                    console.error('Error reverse geocoding:', error);
                }
            }
        );
    })();
    


    return () => {
        if (locationWatcher) {
            locationWatcher.remove();
        }
    };
  }, []);


  let text = '';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {

    const dateObject = new Date(location.timestamp);
    const humanReadableDate = `Time: ${dateObject.getFullYear()}-${dateObject.getMonth()+1}-${dateObject.getDate()} ${dateObject.getHours()}:${dateObject.getMinutes()}:${dateObject.getSeconds()}\n`;
    text += humanReadableDate;

    let rounding = 1000000;

    const altitude = 'Altitude: ' + Math.round(location.coords.altitude * rounding) / rounding;
    text += altitude + 'm\n';

    const latitude = 'Latitude: ' + Math.round(location.coords.latitude * rounding) / rounding;
    text += latitude + '\n';

    const longitude = 'Longitude: ' + Math.round(location.coords.longitude * rounding) / rounding;
    text += longitude + '\n';

    const speed = 'Speed: ' + Math.round(location.coords.speed * rounding) / rounding;
    text += speed + 'm/s\n';


    let addressStreet = null;
    let addressCity = null;
    let addressPostal = null;

    {address && (
      addressStreet = address.streetNumber + " " + address.street,
      addressPostal = address.postalCode,
      addressCity = address.city + " " + address.region + " " + address.country
    )}

    text += "Address: " + addressStreet + "\nCity: " + addressCity + "\nPostal Code: " + addressPostal + "\n"
  }

  useEffect(() => {
    
    async function fetchDates() {
        try {
            const minTimestampData = await gpsDB.getFirstGPSDataAsync();
            const maxTimestampData = await gpsDB.getLastGPSDataAsync();
            
            const minTimestamp = minTimestampData.timestamp;
            const maxTimestamp = maxTimestampData.timestamp;
          
            setMinDate(new Date(minTimestamp * 1000));
            setMaxDate(new Date(maxTimestamp * 1000));
        } catch (error) {
            setMinDate(new Date(location.timestamp));
            setMaxDate(new Date(location.timestamp));
        }
    }
    fetchDates();

    const intervalId = setInterval(fetchDates, 5000); //interval of refreshing min/max time stamp data from db

    return () => clearInterval(intervalId);

  }, []);
  


  return (
    <>
      <View style={styles.headerSpace} /> 
      <ScrollView 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} />
          }>
        <View style={styles.container}>
          <Text style={styles.title}>WeatherMap</Text>
          
          {location && location.mocked ? (
            <Text style={styles.paragraph}>Your location is mocked</Text>
          ) : (
            <>
              <Text style={styles.paragraph}>{text}</Text>
              <View style={styles.mapContainer}>
                {location && (
                  <TouchableOpacity onPress={centerMapOnUserLocation} style={styles.centerButton}>
                    <Image
                      style={styles.currentLocationImage}
                      source={require('./assets/current_location.png')}
                    />
                  </TouchableOpacity>
                )}

                {location && (
                  <MapView
                      ref={mapRef}
                      style={styles.map}
                      initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1 
                      }}
                  >
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude
                            }}
                        />
                        {/* {weatherData.map(cityWeather => (
                            <Marker
                                key={cityWeather.city}
                                coordinate={{
                                    latitude: cityWeather.data.location.lat,
                                    longitude: cityWeather.data.location.lon
                                }}
                            >
                                <Image
                                    style={styles.weatherIcon}
                                    source={{ uri: 'http:' + cityWeather.data.current.condition.icon }}
                                />
                                <Callout>
                                  <Text>Cloud: {cityWeather.data.current.cloud}</Text>
                                  <Text>Condition: {cityWeather.data.current.condition.text}</Text>
                                  <Text>Feels Like (°C): {cityWeather.data.current.feelslike_c}</Text>
                                  <Text>Humidity: {cityWeather.data.current.humidity}</Text>
                                  <Text>Wind Speed (kph): {cityWeather.data.current.wind_kph}</Text>
                                  <Text>Precipitation (mm): {cityWeather.data.current.precip_mm}</Text>
                                  <Text>Pressure (mb): {cityWeather.data.current.pressure_mb}</Text>
                                  <Text>Wind Direction: {cityWeather.data.current.wind_dir}</Text>
                                  <Text>PM10(μg/m3): {cityWeather.data.current.air_quality.pm10}</Text>
                                  <Text>PM2.5(μg/m3): {cityWeather.data.current.air_quality.pm2_5}</Text>
                                </Callout>
                            </Marker>
                          ))
                        } */}
                        
                  </MapView>
              
                )}

                
                

              </View>

              <View style={styles.finder}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Selected Date: {date.toDateString()}</Text>
                <Text>Selected Time: {date.getHours()}:{date.getMinutes()}:{date.getSeconds()}</Text>
                

              </View>

                <Button title="Fetch GPS Data" onPress={fetchGPSData} />
                {data && (
                  <Text>{JSON.stringify(data) }</Text>
                )}
              </View>

              <Button title="Clear GPS Data" onPress={handleClearGPSData} />

              {minDate && maxDate && (
                <>
                <Text>Minimum Date: {minDate.toDateString()}</Text>
                <Text>Minimum Time: {minDate.toTimeString()}</Text>
                <Text>Maximum Date: {maxDate.toDateString()}</Text>
                <Text>Maximum Time: {maxDate.toTimeString()}</Text>
                </>
              )}
              

              {dateTimeSelectComponent}

              <TextInput
                style={styles.secondInput}
                keyboardType="number-pad"
                maxLength={2}
                value={secondsInput}
                onChangeText={handleSecondsChange}
              ></TextInput>

              {/* for debug */}
              <Button title="Print All Data" onPress={handlePrintAllData} />

              <View style={{ padding: 20 }}>
                <Button title="Get Weather" onPress={fetchWeatherData} />

              </View>



          </>
          )}
        </View>
      </ScrollView>
    </>
  );

};

export default App;