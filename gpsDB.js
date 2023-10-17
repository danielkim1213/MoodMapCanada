import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('gpsdata.db');

export const setupDatabaseAsync = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS gpsdata (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER, latitude REAL, longitude REAL);',
        [],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
};

export const insertGPSDataAsync = async (timestamp, latitude, longitude) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO gpsdata (timestamp, latitude, longitude) values (?, ?, ?);',
        [timestamp, latitude, longitude],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
};

export const getGPSDataByTimestampAsync = async (inputTimestamp) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM gpsdata WHERE timestamp LIKE ?;',
        [inputTimestamp],
        (_, result) => resolve(result.rows._array),
        (_, err) => reject(err)
      );
    });
  });
};

export const clearGPSDataTableAsync = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM gpsdata;',
        [],
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
};

export const getFirstGPSDataAsync = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM gpsdata ORDER BY timestamp ASC LIMIT 1;',
        [],
        (_, result) => resolve(result.rows._array[0]),  
        (_, err) => reject(err)
      );
    });
  });
};

export const getLastGPSDataAsync = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM gpsdata ORDER BY timestamp DESC LIMIT 1;',
        [],
        (_, result) => resolve(result.rows._array[0]), 
        (_, err) => reject(err)
      );
    });
  });
};

export const getAllGPSDataAsync = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM gpsdata;',
        [],
        (_, result) => resolve(result.rows._array),
        (_, err) => reject(err)
      );
    });
  });
};
