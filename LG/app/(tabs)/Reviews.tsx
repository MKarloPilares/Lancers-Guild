import React from 'react';
import { useCallback, useState,useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Image, Text, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import Icon from "@expo/vector-icons/FontAwesome"
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

interface ReviewsProps {
  userID: string;
}

const Reviews: React.FC<ReviewsProps> = ({ userID}) => {
  const[userReviews, setUserReviews] = useState<any[]>([])
  
  useEffect(() => {
    // Fetch image data from your API endpoint
    getUserReviews();
  }, []);

  const loadImage = (bytes: any) => {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
  };

  const getUserReviews = async () => { 
    const requestData = {
      userID: userID,
    };
  
    try {
      const response = await fetch('http://192.168.1.29:8000/getUserReviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });
      
      const jsonData = await response.json();
      setUserReviews(jsonData.message);
    } catch (error) {
      console.error('Error fetching data:', error);
  }}

  type ReviewProps = {
    username: string;
    reviewText: string;
    rating: string;
    image: any
  };


  const Reviews = ({ username, reviewText, rating, image }: ReviewProps) => {
    const stars = [];
    const numStars = parseInt(rating); // Convert rating to a number
  
    // Loop to create stars based on the rating
    for (let i = 0; i < numStars; i++) {
      stars.push(<Icon key={i} name="star" size={20} color="gold" />);
    }
  
    return (
      <View style={{ marginBottom: 5, width: 355, height: 'auto', borderColor: 'white', borderBottomWidth: 3}}>
        <Image
          source={{uri:`data:image/png;base64,${loadImage(image)}`}}
          style={{ width: 40, height: 40, position: 'relative', left: 0, top: 15, borderRadius: 50 }}
        />
        <TouchableOpacity><Text style={{ left: 50, top: -30, color: 'white', fontFamily: 'JejuGothic' }}>{username}</Text></TouchableOpacity>
        <View style={{ flexDirection: 'row', left: 50, top: -30 }}>
          <Text>{stars}</Text>
        </View>
        <Text style={{ left: 50, top: -20, color: 'white', fontFamily: 'JejuGothic' }} >{reviewText}</Text>
      </View>
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
            data={userReviews}
            renderItem={({item}) => <Reviews username={item.reviewer} reviewText={item.reviewText} rating={item.rating} image={item.reviewerImg.data}/>}
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

export default Reviews;