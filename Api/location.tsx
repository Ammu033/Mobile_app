import * as Location from 'expo-location';
import {Alert} from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getLocationAndSave = async () => { 
    
    try {
        const { status } = await Location.requestForegroundPermissionsAsync(); 
        if (status !== 'granted') { 
            Alert.alert('Permission Denied', 'Location access is required.'); 
            return null; 
        }

        // Get location coordinates
        const location = await Location.getCurrentPositionAsync({}); 

        // Reverse geocode to get address
        const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });

        if (address && address.length > 0) {
            const { postalCode, city, region, country } = address[0];
            
            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                postcode: postalCode || '',
                address: `${city || ''}, ${region || ''}, ${country || ''}`.replace(/, ,/g, ',').trim(),
            };
        }

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            postcode: '',
            address: '',
        };
        
    } catch (error: any) {
        console.error(error);
        Alert.alert('Error', 'Something went wrong while getting your location.');
        return null;
    }
};
