import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if the user is a first-time user
export const checkFirstTimeUser = async () => {
  const isFirstTime = await AsyncStorage.getItem('isFirstTime');
  return isFirstTime === null; // First time if no value is stored
};

// Mark the user as not a first-time user
export const setFirstTimeUser = async () => {
  await AsyncStorage.setItem('isFirstTime', 'false');
};
