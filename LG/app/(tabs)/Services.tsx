import React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Image, Text, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import Icon from "@expo/vector-icons/FontAwesome"
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

interface ServicesProps {
  userID: string,
  setServiceIDServices: (page: string) => void;
  setCurrentPageServices: (page: string) => void;
  setServiceOwnerIDServices: (page: string) => void;
}

const Services: React.FC<ServicesProps> = ({ userID, setServiceIDServices, setCurrentPageServices, setServiceOwnerIDServices}) => {
  const[userServices, setUserServices] = useState<any[]>([])

  useEffect(() => {
    // Fetch image data from your API endpoint
    getUserServices();
  }, []);

  const loadImage = (bytes: any) => {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
  };
  


  const getUserServices = async () => { 
    try {
      const response = await fetch(`http://192.168.1.29:8000/api/users/${userID}/services`, {
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
    rating: string;
    image: any,
    serviceID: string;
    ownerID: string;
  };


  const Services = ({ title, price, rating, image, serviceID, ownerID}: ServicesProps) => {
    const stars = [];
    const numStars = parseInt(rating); // Convert rating to a number
  
    // Loop to create stars based on the rating
    for (let i = 0; i < numStars; i++) {
      stars.push(<Icon key={i} name="star" size={10} color="white" />);
    }
  
    return (
      <TouchableOpacity style={{width: 355, height: 180, borderColor: 'white', backgroundColor: 'green', marginBottom: 10, borderRadius: 30, overflow: 'hidden'}} onPress={() => {setCurrentPageServices('5');
       setServiceIDServices(serviceID); setServiceOwnerIDServices(ownerID)}}>
        <Image
          source={{uri:`data:image/png;base64,${loadImage(image)}`}}
          style={{ width: 220, height: 120, position: 'relative', left: 10, top: 20, borderRadius: 20 }}
        />
        <Text style={{ left: 242, top: -100, width: 100, color: 'white', fontFamily: 'JejuGothic', textAlign: 'center' }}>{title}</Text>
        <View style={{ flexDirection: 'row', left: 265, top: -70 }}>
          <Text>{stars}</Text>
        </View>
        <Text style={{ left: 265, top: -40, color: 'white', fontFamily: 'JejuGothic' }} >${price}</Text>
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
    <SafeAreaProvider>
      <ScrollView>
          <FlatList
            data={userServices}
            renderItem={({item}) => <Services title={item.serviceName} price={item.price} rating={item.rating} image={item.img.data} serviceID={item.serviceID} ownerID={item.ownerID}/>}
            keyExtractor={item => item.id} style={{position: 'relative', top: 30, left: '5%'}}
          />
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

export default Services;
