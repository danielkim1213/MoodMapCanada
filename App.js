import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { styles } from './styles';
import * as Location from 'expo-location';

const App = () => {
  const [mood, setMood] = useState('Neutral');

  const moodButtons = [
    'Happy', 'Sad', 'Calm', 'Excited', 'Angry'
  ];

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);


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
        style={styles.map}
        initialRegion={{
          latitude: 56.1304,   
          longitude: -106.3468, 
          latitudeDelta: 30,    
          longitudeDelta: 30,   
        }}
      />
    </View>
    
  );
};


export default App;
