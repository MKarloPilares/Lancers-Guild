import React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ImageBackground, StyleSheet, Image, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Icon from "@expo/vector-icons/FontAwesome"

interface MarketProps {
  setCurrentPageMarket: (page: string) => void;
  setServiceOwnerID: (page: string) => void;
  setServiceID: (page: string) => void;
  marketCategory: string;
}

const Market: React.FC<MarketProps> = ({ setCurrentPageMarket, marketCategory, setServiceOwnerID, setServiceID }) => {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    // Fetch image data from your API endpoint
    getServices();
  }, []);

  const getServices= async () => { 
    try {
      let url = 'http://192.168.1.29:8000/api/services';
      if (marketCategory && marketCategory !== '0') {
        url += `?category=${marketCategory}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      
      const jsonData = await response.json();
      if (jsonData.success && jsonData.data) {
        setServices(jsonData.data);
      }

  } catch (error) {
    console.error('Error fetching services:', error);
  };
  };

  type MarketProps = {
    name: string;
    price: string;
    image: any
    servID: string;
    ownerID: string;
    rating: string;
  };


const Market = ({ name, price, image, servID, ownerID, rating }: MarketProps) => (
  

  <View style={{marginHorizontal: 10, width: 160, height: 170}}>
    <TouchableOpacity style={{backgroundColor: 'green', borderRadius: 20, height: 150}} onPress={() => {setCurrentPageMarket('5'); setServiceOwnerID(ownerID); setServiceID(servID)}}>
      <Image source={{uri: `data:image/png;base64,${image}`}} style={{width: 120, height: 80 , position: 'relative', left: 20, top: 20, borderRadius: 20}}></Image>
      <Text style={{left: 10, color: 'white', fontFamily: 'JejuGothic', bottom: -25}}>{name}</Text>
      <Text style={{left: 10, color: 'white', fontFamily: 'JejuGothic', bottom: -30, fontSize: 11}}>{rating}{rating != null && <Icon name="star" size={10} color="gold" />}</Text>
      <Text style={{left: 120, color: 'white', fontFamily: 'JejuGothic', bottom: -15, fontSize: 11}}>${price}</Text>
    </TouchableOpacity>
  </View>
);

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
        <View style={styles.content} onLayout={onLayoutRootView}>
          <Image source={require('../../assets/images/LG_LOGO.png')} style={{left: 125, top: 100, width: 150, height: 150}}></Image>
          <FlatList
            data={services}
            renderItem={({item}) => <Market name={item.serviceName} price={item.price} image={btoa(String.fromCharCode(...new Uint8Array(item.img.data)))} servID={item.serviceID} ownerID={item.ownerID} rating={item.rating}/>}
            numColumns={2}
            keyExtractor={item => item.id} style={{position: 'relative', top: 120, left: 20}}
          />
          <TouchableOpacity style={{backgroundColor: 'green', width: 60, height: 60, borderRadius: 100, bottom: 30, left: 300, marginTop: 10, borderColor: 'white', borderWidth: 2 }} onPress={() => setCurrentPageMarket('11')}>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', textAlign: 'center', position: 'relative', top: 8, fontSize: 45 }}>+</Text>
          </TouchableOpacity>
        </View>
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
    fontFamily: 'JejuGothic'
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

export default Market;

