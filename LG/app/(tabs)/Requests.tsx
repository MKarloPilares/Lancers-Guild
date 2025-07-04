import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Image, Text, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

interface RequestsProps {
  userID: string
  setCurrentPageRequests: (page: string) => void
  setProfileIDrequests: (page: string) => void
  setOrderIDRequests: (page: string) => void
}

const Requests: React.FC<RequestsProps> = ({ userID, setCurrentPageRequests, setProfileIDrequests, setOrderIDRequests }) => {
  const[userServices, setUserServices] = useState<any[]>([])

  useEffect(() => {
    // Fetch image data from your API endpoint
    getUserRequests();
  }, []);

  const loadImage = (bytes: any) => {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
  };
  
  const getUserRequests = async () => { 
    try {
      const response = await fetch(`http://192.168.1.29:8000/api/users/${userID}/requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      
      const jsonData = await response.json();
      if (jsonData.success && jsonData.data) {
        setUserServices(jsonData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
  }}

  type ServicesProps = {
    title: string;
    price: string;
    lancer: string,
    image: any,
    lancerID: string,
    orderID: string
  };


  const Services = ({ title, price, lancer, image, lancerID, orderID}: ServicesProps) => {
  
    return (
      <TouchableOpacity style={{width: 355, height: 160, borderColor: 'white', backgroundColor: 'green', marginBottom: 10, borderRadius: 30, overflow: 'hidden'}} 
      onPress={() => {setCurrentPageRequests('8');setProfileIDrequests(lancerID); setOrderIDRequests(orderID)}}>
        <Image
          source={{uri:`data:image/png;base64,${loadImage(image)}`}}
          style={{ width: 220, height: 120, position: 'relative', left: 10, top: 20, borderRadius: 20 }}
        />
        <Text style={{ left: 242, top: -100, width: 100, color: 'white', fontFamily: 'JejuGothic', textAlign: 'center' }}>{title}</Text>
        <Text style={{ left: 242, top: -80, width: 100, color: 'white', fontFamily: 'JejuGothic', textAlign: 'center' }}>{lancer}</Text>
        <Text style={{ left: 265, top: -50, color: 'white', fontFamily: 'JejuGothic' }} >${price}</Text>
      </TouchableOpacity>
    );
  };


  const [fontsLoaded, fontError] = useFonts({
    'JejuGothic': require('../../assets/fonts/JejuGothic-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  
  return (
    <SafeAreaProvider >
      <ScrollView>
        <View style={{height: 1000}}>
          <FlatList
            data={userServices}
            renderItem={({item}) => <Services title={item.title} price={item.price} lancer={item.lancerName} image={item.img.data} lancerID={item.ownerID} orderID={item.orderID}/>}
            keyExtractor={item => item.id} style={{position: 'relative', top: 100, left: '5%'}}
          />
        </View>
     </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    fontFamily: 'JejuGothic',
    paddingBottom: 150, 
  },
  overlayImage: {
    width: 180,  // Adjust the width as needed
    height: 220,
    position: 'absolute',
    top: 100,
    left: 115,  // Adjust the height as needed
    marginBottom: 0,  // Adjust the margin as needed
  },
  mainText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Requests;
