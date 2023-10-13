import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, ScrollView} from 'react-native';
import { styles } from './styles';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';


const App = () => {
  const [mood, setMood] = useState('Neutral');

  const moodButtons = [
    'Happy', 'Sad', 'Calm', 'Excited', 'Angry'
  ];

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const mapRef = useRef(null);

  const [address, setAddress] = useState(null);




  useEffect(() => {
    let locationWatcher = null;

    (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        locationWatcher = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 0 },
            async (newLocation) => {
                setLocation(newLocation);
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: newLocation.coords.latitude,
                        longitude: newLocation.coords.longitude,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1
                    });
                }

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

    const isMocked = 'Is Mocked: ' + location.mocked;
    text += isMocked + '\n';

    const altitude = 'Altitude: ' + Math.round(location.coords.altitude * 1000000) / 1000000;
    text += altitude + 'm\n';

    const latitude = 'Latitude: ' + Math.round(location.coords.latitude * 1000000) / 1000000;
    text += latitude + '\n';

    const longitude = 'Longitude: ' + Math.round(location.coords.longitude * 1000000) / 1000000;
    text += longitude + '\n';

    const speed = 'Speed: ' + Math.round(location.coords.speed * 1000000) / 1000000;
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


  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>MoodMap</Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>

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

        <Text style={styles.result}>You're feeling {mood} today.</Text>

          
        <Text style={styles.paragraph}>{text}</Text>

        <MapView
            ref={mapRef}
            style={styles.map}
        >
            {location && (
                <Marker
                    coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    }}
                    title="Your Location"
                />
            )}
        </MapView>
      </View>
    </ScrollView>
    
  );
};


export default App;
