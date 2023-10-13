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
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexWrap: 'wrap',
},
moodButton: {
    margin: 5,
},
result: {
    marginTop: 20,
    fontSize: 18,
},
map: {
    width: '100%',
    height: 500,
    marginTop: 20,
}
});