import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from './styles'; 

export const DateTimeSelect = ({ onDateChange }) => {
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        setShow(false);
        const currentDate = selectedDate;
        setDate(currentDate);
        onDateChange(currentDate);  
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };


    return (
        <View style={styles.dateTimeContainer}>
                
            <Button title="Show Date Picker" onPress={() => showMode('date')} />
            <Button title="Show Time Picker" onPress={() => showMode('time')} />
                
            {show && (
                <DateTimePicker
                    value={date}
                    mode={mode}
                    is24Hour={false}
                    display="spinner"
                    onChange={onChange}
                />
            )}
        </View>
    );
};

