import React from 'react';
import { useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Svg, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { View, ImageBackground, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

interface GetStartedProps {
  setCurrentPage: (page: string) => void;
}

const GetStarted: React.FC<GetStartedProps> = ({ setCurrentPage }) => {
  console.log("setCurrentPage prop in Login:", setCurrentPage);
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
          <Image 
                source={require('../../assets/images/LG_LOGO.png')}  // Specify your additional image path here
                style={styles.overlayImage}
              />
          <Text style={{position: 'relative', top: '40%', left: '10%', color: 'white', fontSize: parseFloat('30.9'), fontFamily: 'JejuGothic', marginBottom: '3%'}}>Welcome to the</Text>
          <Text style={{position: 'relative', top: '40%', left: '10%', color: 'white', fontSize: parseFloat('50'), fontFamily: 'JejuGothic', marginBottom: '3%'}}>Lancer's Guild</Text>
          <Text style={{position: 'relative', top: '40%', left: '10%', color: 'white', fontSize: parseFloat('19.1'), textAlign: 'justify', width: '80%', fontFamily: 'JejuGothic'}}>A mobile app designed for 
                freelancers to connect with clients.
                Browse job listings, apply for projects,
                and build professional relationships.
                Join our guild for growth, opportunity,
                and success in the freelance world.
          </Text>
          <TouchableOpacity onPress={() => setCurrentPage('1')} style={{backgroundColor: 'lightgreen', position: 'relative', 
          width: '50%', left: '25%', top: '45%', height: '6%', borderRadius: 10
          }}><Text style={{color: 'white', fontSize: parseFloat('20'), fontFamily: 'JejuGothic', position: 'relative', top: '25%', left: '18%'}}>GET STARTED</Text></TouchableOpacity>
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
    width: 340,  // Adjust the width as needed
    height: 400,
    position: 'absolute',
    top: 130,
    left: 22,  // Adjust the height as needed
    marginBottom: 0,  // Adjust the margin as needed
  },
  mainText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default GetStarted;

