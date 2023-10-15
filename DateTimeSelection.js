import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from './styles';  <DateTimeSelection onDateChange={(selectedDate) => setDate(selectedDate)} />

export const DateTimeSelection = ({ date, setDate }) => {
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(true);
        setDate(currentDate);
        if (onDateChange) {
            onDateChange(currentDate);  
        }
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Selected Date: {date.toDateString()}</Text>
            <Text>Selected Time: {date.getHours()}:{date.getMinutes()}:{date.getSeconds()}</Text>
                
            <Button title="Show Date Picker" onPress={() => showMode('date')} />
            <Button title="Show Time Picker" onPress={() => showMode('time')} />
                
            {show && (
                <DateTimePicker
                    value={date}
                    mode={mode}
                    is24Hour={false}
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    );
};
