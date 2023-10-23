import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    headerSpace: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 25,
        backgroundColor: 'white', 
        zIndex: 2, 
    },
    scrollContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 15,
        justifyContent: 'flex-start',  
        alignItems: 'center',
        backgroundColor: '#FBFCFD', 
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',  
    },
    subtitle: {
        fontSize: 20,
        marginBottom: 25,
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',  
        alignItems: 'center',
        flexWrap: 'wrap',
        width: '100%',  
    },
    moodButton: {
        padding: 10,  
        margin: 8,
        backgroundColor: '#E0E0E0', 
        borderRadius: 10,  
        shadowColor: '#000', 
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 1,
            height: 2,
        },
        elevation: 3,  
    },
    result: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: '600',  
        color: '#444',
    },
    mapContainer: {
        width: '100%',
        height: 500,
        marginTop: 30,
        borderRadius: 30,  
        overflow: 'hidden',  
        borderWidth: 1,  
        borderColor: '#E0E0E0' 
    },
    
    map: {
        width: '100%',
        height: '110%',
    },
    finder: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    dateTimeContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    secondInput: {
        height: 40, 
        borderColor: 'gray', 
        borderWidth: 1, 
        width: 100, 
        textAlign: 'center'
    },
    centerButton: {
        width: 50, 
        height: 50, 
        borderRadius: 18, 
        borderColor: 'black',
        borderWidth: 2, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20, 
        right: 20, 
        zIndex: 5,
    },
    currentLocationImage: { 
        width: 37, 
        height: 37, 
    },
    timeSlider: {
        width: '70%', 
        alignSelf: 'center', 
        marginTop: 20, 
        marginBottom: 20,  
    },
    weatherIcon: {
        width: 50,
        height: 50, 
        resizeMode: 'contain', 
        borderRadius: 25, 
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
});
