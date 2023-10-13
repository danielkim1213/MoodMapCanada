import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
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



  useEffect(() => {
    let locationWatcher = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

     
      locationWatcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000 , distanceInterval: 0},
        (newLocation) => {
          setLocation(newLocation);
          if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1
            })
          }
        }
      );
      
      
    })();
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

    const altitude = 'Altitude: ' + location.coords.altitude;
    text += altitude + 'm\n';

    const latitude = 'Latitude: ' + location.coords.latitude;
    text += latitude + '\n';

    const longitude = 'Longitude: ' + location.coords.longitude;
    text += longitude + '\n';

    const speed = 'Speed: ' + location.coords.speed;
    text += speed + 'm/s\n';
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>MoodMap</Text>
      <Text style={styles.subtitle}>How are you feeling today?</Text>

      {moodButtons.map((moodType, index) => (
        <Button
          key={index}
          title={moodType}
          onPress={() => setMood(moodType)}
          style={styles.moodButton}
        />
      ))}

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
    
  );
};


export default App;
