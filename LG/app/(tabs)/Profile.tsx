import React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import Icon from "@expo/vector-icons/FontAwesome"
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Reviews from './Reviews';
import Services from './Services';

interface ProfileProps {
  userID: string
  setServiceIDProfile: (page: string) => void;
  setCurrentPageProfile: (page: string) => void;
  setServiceOwnerIDProfile: (page: string) => void;
  loggedinID: string
}

const Profile: React.FC<ProfileProps> = ({ userID, setServiceIDProfile, setCurrentPageProfile, setServiceOwnerIDProfile, loggedinID}) => {
  const[tab, setTab] = useState('1');
  const[userDetails, setUserDetails] = useState<any[]>([]);
  const [stars, setStars] = useState<JSX.Element[]>([]);

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

  useEffect(() => {
    // Fetch image data from your API endpoint
    getUserProfile();
  }, []);
  
  const getUserProfile = async () => { 
    const requestData = {
      userID: userID,
    };
  
    try {
      const response = await fetch('http://192.168.1.29:8000/serviceOwner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });
      
      const jsonData = await response.json();
      setUserDetails(jsonData.message);

      const numStars = parseInt(jsonData.message[0].rating); // Convert rating to a number
    
      const starsArray: JSX.Element[] = [];
      for (let i = 0; i < numStars; i++) {
        starsArray.push(<Icon name="star" size={25} color="white" />);
      }
      setStars(starsArray);

    } catch (error) {
      console.error('Error fetching data:', error);
  }}

  const loadImage = (bytes: any) => {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
  };
  

  return (
    <SafeAreaProvider>
      {userDetails.map((user: any) =>
        <View style={styles.content} onLayout={onLayoutRootView}>
          <Image source={{uri:`data:image/png;base64,${loadImage(user.img.data)}`}} style={{width: 500, height: 120 , position: 'relative', left: '0%', top: 30,
            borderColor: 'white'}}></Image>
          <Image source={{uri:`data:image/png;base64,${loadImage(user.img.data)}`}} style={{width: 80, height: 80 , position: 'relative', left: 20, top: -15, borderRadius: 50, borderColor: 'white', borderWidth: 3}}></Image>
            <View style={{flexDirection: 'row', left: 105, top: -45}}>
            <Text>{stars}</Text>
            </View>
          {userID === loggedinID && <TouchableOpacity style={{backgroundColor: 'green', width: 80, borderRadius: 20, left: 300, paddingLeft: 5, bottom: 60, height: 20, paddingTop: 3}} onPress={() => setCurrentPageProfile('12')}>
            <Text style={{fontFamily: 'JejuGothic', color: 'white'}}>Edit Profile</Text>
            </TouchableOpacity>}
          <Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 18, left: 25, top: -25}}>{user.username}</Text>
          <Text style={{fontFamily: 'JejuGothic', color: 'gray', fontSize: 10, left: 25, top: -25}}>{user.email}</Text>
          <TouchableOpacity style={{left: 80, top: -5}}><Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 15}} onPress={() => setTab('1')}>Reviews</Text></TouchableOpacity>
          <TouchableOpacity style={{left: 255, top: -22}}><Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 15}} onPress={() => setTab('2')}>Services</Text></TouchableOpacity>
          <View style={{backgroundColor: 'teal', position: 'relative', width: 400, height: 500, left: 0, top: -10, borderTopWidth: 5, borderColor: 'white'}}>
            {tab === '1' && <Reviews userID={userID}/>}
            {tab === '2' && <Services userID={userID} setCurrentPageServices={setCurrentPageProfile} setServiceIDServices={setServiceIDProfile} setServiceOwnerIDServices={setServiceOwnerIDProfile}/>}
          </View>
        </View>
      )}
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

export default Profile;