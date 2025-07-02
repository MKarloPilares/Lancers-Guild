import React from 'react';
import { useState } from 'react';
import { useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ImageBackground, StyleSheet, Image, Text, TouchableOpacity, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

interface LoginProps {
  setCurrentPageLogin: (page: string) => void;
  setLoggedInUsername: (page: string) => void;
  setLoggedInEmail: (page:string) => void;
  setLoggedInUserID: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ setCurrentPageLogin, setLoggedInUsername, setLoggedInEmail, setLoggedInUserID }) => {
  const[username, setUserName] = useState('');
  const[password, setPassWord] = useState('');
  const[wrongPassword, setwrongpassWord] = useState(false);
  const[wrongUsername, setWrongUsername] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    'JejuGothic': require('../../assets/fonts/JejuGothic-Regular.ttf'),
  });

  const passToServer = async () => { 
    const requestData = {
      username: username,
    };
  
    try {
      const response = await fetch('http://192.168.1.29:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });
      
      const jsonData = await response.json();
      if (password === jsonData.message[0].pass) {
        setCurrentPageLogin('3');
        setLoggedInUsername(jsonData.message[0].username);
        setLoggedInEmail(jsonData.message[0].email);
        setLoggedInUserID(jsonData.message[0].userID);
      } else {
        setwrongpassWord(true);
        setWrongUsername(false);
      }

  } catch (error) {
    setWrongUsername(true);
    setwrongpassWord(false);
  };
  };

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
          <Text style={{fontFamily: 'JejuGothic', color: 'white', position: 'relative', top: '42%', left:'38%', fontSize: 30}}>Sign In</Text>
          {wrongPassword === true && 
            <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: '45%', left: 115, fontSize: 20}}>Wrong Password!</Text>
          }
          {wrongUsername === true && 
            <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: '45%', left: 115, fontSize: 20}}>User does not exist!</Text>
          }
          <Text style={{fontFamily: 'JejuGothic', color: 'white', position: 'relative', top: '48%', left:'22%', fontSize: 12}}>Username</Text>
          <TextInput onChangeText={text => setUserName(text)} style={{height: 50, position: 'relative', top: '50%', backgroundColor: 'darkgreen', color: 'white',
          borderColor: 'gray', borderRadius: 18, width: '60%', left: '20%', paddingLeft: 10}}></TextInput>
          <Text style={{fontFamily: 'JejuGothic', color: 'white', position: 'relative', top: '53%', left:'22%', fontSize: 12}}>Password</Text>
          <TextInput  onChangeText={text => setPassWord(text)} secureTextEntry={true} style={{height: 50, position: 'relative', top: '55%', color: 'white',
           backgroundColor: 'darkgreen', borderColor: 'gray', borderRadius: 18, width: '60%', left: '20%', paddingLeft: 10}}></TextInput>
          <TouchableOpacity onPress={passToServer} style={{backgroundColor: 'white', position: 'relative', 
          width: '60%', left: '20%', top: '60%', height: '6%', borderRadius: 10
          }}><Text style={{color: 'black', fontSize: parseFloat('20'), fontFamily: 'JejuGothic', position: 'relative', top: '25%', left: '38%'}}>Login</Text></TouchableOpacity>
          <Text style={{fontFamily: 'JejuGothic', color: 'white', position: 'relative', top: '63%', left:'27%', fontSize: 12}}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => setCurrentPageLogin('2')} style={{position: 'relative', top: '60%', left:'35%'}}><Text style={{fontFamily: 'JejuGothic', color: 'green', position: 'relative', top: '63%', left:'27%', fontSize: 12}}>Sign Up!</Text></TouchableOpacity>
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

export default Login;