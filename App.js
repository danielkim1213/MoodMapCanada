import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Button, ScrollView, RefreshControl, TextInput } from 'react-native';
import { styles } from './styles';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as gpsDB from './gpsDB';
import { DateTimeSelect } from './dateTimeSelection';


const App = () => {
  const [mood, setMood] = useState('Neutral'); 

  const moodButtons = [
    'Happy', 'Sad', 'Calm', 'Excited', 'Angry'
  ];

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const mapRef = useRef(null);

  const [address, setAddress] = useState(null);

  const [data, setData] = useState(null);

  const [date, setDate] = useState(new Date());
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [secondsInput, setSecondsInput] = useState('00');

  const [refreshing, setRefreshing] = useState(false);

  const handleSecondsChange = (text) => {
    if (!isNaN(text) && (text === '' || (Number(text) >= 0 && Number(text) <= 59))) {
      setSecondsInput(text);
      const newDate = new Date(date);
      newDate.setSeconds(Number(text));
      setDate(newDate);
    }
  };


  const onRefresh = React.useCallback(() => {
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
              latitudeDelta: 0.1,
              longitudeDelta: 0.1
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
          <DateTimeSelect onDateChange={(date) => setDate(date)} />
      );
    
  }, []);


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
            const minTimestamp = await gpsDB.getFirstGPSDataAsync();
            const maxTimestamp = await gpsDB.getLastGPSDataAsync();
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

  }, [minDate, maxDate]);


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
          <Text style={styles.title}>MoodMap</Text>
          
          {location && location.mocked ? (
            <Text style={styles.paragraph}>Your location is mocked</Text>
          ) : (
            <>
              <Text style={styles.subtitle}>How do you feel in {address?.city}?</Text>

              <View style={styles.buttonContainer}>  
                {moodButtons.map((moodType, index) => (
                    <Button
                        key={index}
                        title={moodType}
                        onPress={() => setMood(moodType)}
                        style={styles.moodButton}
                    />
                ))}
              </View>

              <Text style={styles.result}>You're feeling "{mood}" in {address?.city}.</Text>
                
              <Text style={styles.paragraph}>{text}</Text>
              <View style={styles.mapContainer}>
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
                            title="Your Location"
                        />
                  </MapView>

              
                )}
                

              </View>
              
              <Button title="Center on My Location" onPress={centerMapOnUserLocation} />

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


          </>
          )}
        </View>
      </ScrollView>
    </>
  );

};

export default App;