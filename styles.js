import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

scrollContainer: {
    flex: 1
},
container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
},
title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
},
subtitle: {
    fontSize: 18,
    marginBottom: 20,
},
buttonContainer: {
    flexDirection: 'row',  // Makes the children align horizontally
    justifyContent: 'space-around',  // Distributes the children buttons with equal space around them
    flexWrap: 'wrap',  // Allows buttons to wrap onto the next line if they run out of space
    marginTop: 20,
    marginBottom: 20,
},
moodButton: {
    marginVertical: 10,
    marginHorizontal: 5,
},
result: {
    marginTop: 20,
    fontSize: 18,
},
map: {
    width: '100%',
    height: 300,
    marginTop: 20,
}
});