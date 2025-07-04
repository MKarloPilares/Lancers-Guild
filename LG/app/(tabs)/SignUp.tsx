import React from 'react';
import { useState } from 'react';
import { useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Modal, StyleSheet, Image, Text, TouchableOpacity, TextInput, Pressable, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import * as SplashScreen from 'expo-splash-screen';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import Icon from "@expo/vector-icons/MaterialIcons";


interface SignUpProps {
  setCurrentPageSignUp: (page: string) => void;
}

const SignUp: React.FC<SignUpProps> = ({ setCurrentPageSignUp }) => {
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [userName, setUserName] = useState('');
const [passWord, setPassWord] = useState('');
const [fileUri, setFileUri] = useState<string | null>(null);
const [modalVisible, setModalVisible] = useState(false);
const[specialCharacter, setSpecialCharacter] = useState(false);
const[capitalLetter, setCapitalLetter] = useState(false);
const[number, setNumber] = useState(false); 
const[confPass, setConfPass] = useState('');
const[sameConf, setSameConf] = useState(false);
const[short, setShort] = useState(false);
const [userExists, setUserExists] = useState(false);
const [wrongCap, setWrongCap] = useState(false);
const [wrongNum, setWrongNum] = useState(false);
const [wrongSpec, setWrongSpec] = useState(false);
const [wrongLen, setWrongLen] = useState(false);


const selectFile = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    const resizedImage = await manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 360, height: 180 } }],
      { compress: 0.8, format: SaveFormat.PNG } 
    );

    setFileUri(resizedImage.uri);
  }
};

const hasCapitalLetter = (str: string) => {
  const capitalLetterRegex = /[A-Z]/;
  return capitalLetterRegex.test(str);
};

// Function to check if a string has a number
const hasNumber = (str: string) => {
  // Regular expression to match any digit
  const numberRegex = /\d/;

  // Test the string with the regular expression
  return numberRegex.test(str);
};

// Function to check if a string has special characters
const hasSpecialCharacter = (str: string) => {
  // Regular expression to match any special character
  const specialCharacterRegex = /[^a-zA-Z0-9\s]/;

  // Test the string with the regular expression
  return specialCharacterRegex.test(str);
};

const capTest = (password: string) => {
  setCapitalLetter(hasCapitalLetter(password));
};

const numTest = (password: string) => {
  setNumber(hasNumber(password));
};

const specTest = (password: string) => {
  setSpecialCharacter(hasSpecialCharacter(password));
};

const lenTest = (password: string) => {
  setShort(password.length >= 8);
};

const handlePasswordChange = (password: string) => {
  setPassWord(password);
  capTest(password);
  numTest(password);
  specTest(password);
  lenTest(password);
};

const passToServer = async () => { 

  if (passWord !== confPass) {
    setSameConf(true);
    setWrongCap(false);
    setWrongNum(false);
    setWrongSpec(false);
    setWrongLen(false);
    return;
  }
  
  if (!capitalLetter) {
    setWrongCap(true);
    setSameConf(false);
    setWrongNum(false);
    setWrongSpec(false);
    setWrongLen(false);
    return;
  }
  
  if (!number) {
    setWrongNum(true);
    setSameConf(false);
    setWrongCap(false);
    setWrongSpec(false);
    setWrongLen(false);
    return;
  }
  
  if (!specialCharacter) {
    setWrongSpec(true);
    setSameConf(false);
    setWrongCap(false);
    setWrongNum(false);
    setWrongLen(false);
    return;
  }

  if (!short) {
    setWrongLen(true);
    setWrongSpec(false);
    setSameConf(false);
    setWrongNum(false);
    setNumber(false);
    return;
  }

  const formData = new FormData();
  formData.append('username', userName);
  formData.append('password', passWord);
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  formData.append('email', email);
  if (fileUri != null) {
    formData.append('image', {
      uri: fileUri,
      type: 'image/png',
      name: 'thumbnail.jpeg'
    });
  }

  try {
    const response = await fetch('http://192.168.1.29:8000/api/users', {
      method: 'POST',
      body: formData,
    });

    const jsonData = await response.json();
    
    if (response.status === 409) {
      // User already exists
      setUserExists(true);
      setSameConf(false);
      setWrongCap(false);
      setWrongNum(false);
      setWrongSpec(false);
      setWrongLen(false);
    } else if (response.status === 201 && jsonData.success) {
      setModalVisible(true);
    } else {
      // Handle other server errors
      console.error('Error signing up:', jsonData.message || 'Unknown error');
    }

  } catch (error) {
    console.error('Error signing up:', error);
  }
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Sign Up Successful!</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setCurrentPageSignUp('1')}>
              <Text style={styles.textStyle}>Ok!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.content} onLayout={onLayoutRootView}>
      <View>
          <TouchableOpacity onPress={() => setCurrentPageSignUp('1')} style={{
            width: 120, left: 20, top: 110, height: 40
            }}><Icon name='arrow-back' size={40} color={'white'}/>
          </TouchableOpacity>
        </View>
        <Text style={{fontFamily: 'JejuGothic', color: 'white', position: 'relative', top: '15%', left:'22%', fontSize: 25}}>Create an Account</Text>
        {sameConf === true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: '17%', left: 70, fontSize: 20}}>Passwords Does Not Match!</Text>}
        {wrongCap === true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: '17%', left: 50, fontSize: 20}}>Password Has No Capital Letter!</Text>}
        {wrongNum === true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: '17%', left: 80, fontSize: 20}}>Password Has No Number!</Text>}
        {wrongSpec=== true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: '17%', left: 30, fontSize: 20}}>Password Has No Special Character!</Text>}
        {wrongLen === true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: '17%', left: 100, fontSize: 20}}>Password Too Short!</Text>}
        {userExists=== true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: '17%', left: 110, fontSize: 20}}>User Already Exists!</Text>}
        <TextInput placeholder='First Name' placeholderTextColor='gray' onChangeText={text => setFirstName(text)}
        style={{height: 50, position: 'relative', top: '20%' , color: 'white', backgroundColor: 'darkgreen', borderColor: 'gray', borderRadius: 18, width: '67%', left: '17%', paddingLeft: 10}}></TextInput>
        <TextInput placeholder='Last Name' placeholderTextColor='gray' onChangeText={text => setLastName(text)}
         style={{height: 50, position: 'relative', top: '22%', color: 'white', backgroundColor: 'darkgreen', borderColor: 'gray', borderRadius: 18, width: '67%', left: '17%', paddingLeft: 10}}></TextInput>
        <TextInput placeholder='Email' placeholderTextColor='gray' onChangeText={text => setEmail(text)}
         style={{height: 50, position: 'relative', top: '24%' , color: 'white', backgroundColor: 'darkgreen', borderColor: 'gray', borderRadius: 18, width: '67%', left: '17%', paddingLeft: 10}}></TextInput>
        <TextInput placeholder='Username' placeholderTextColor='gray' onChangeText={text => setUserName(text)}
        style={{height: 50, position: 'relative', top: '26%' , color: 'white' , backgroundColor: 'darkgreen', borderColor: 'gray', borderRadius: 18, width: '67%', left: '17%', paddingLeft: 10}}></TextInput>
        <TextInput placeholder='Password' secureTextEntry ={true} placeholderTextColor='gray' onChangeText={text => handlePasswordChange(text)}
        style={{height: 50, position: 'relative', top: '28%' , color: 'white', backgroundColor: 'darkgreen', borderColor: 'gray', borderRadius: 18, width: '67%', left: '17%', paddingLeft: 10}}></TextInput>
        <View style={{top: '29%', left: 70}}>
          <View style={{flexDirection: 'row'}}>
            <Icon name={short === false ? 'close' : 'check'} color={short === false ? 'gray' : 'green'}></Icon>
            <Text style={short === false ? {color: 'gray', fontFamily: 'JejuGothic'} : {color: 'white', fontFamily: 'JejuGothic'}}>At least 8 Characters</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Icon name={capitalLetter === false ? 'close' : 'check'} color={capitalLetter === false ? 'gray' : 'green'}></Icon>
            <Text style={capitalLetter === false ? {color: 'gray', fontFamily: 'JejuGothic'} : {color: 'white', fontFamily: 'JejuGothic'}}>At least 1 Capital Letter</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Icon name={number === false ? 'close' : 'check'} color={number === false ? 'gray' : 'green'}></Icon>
            <Text style={number === false ? {color: 'gray', fontFamily: 'JejuGothic'} : {color: 'white', fontFamily: 'JejuGothic'}}>At least 1 Number</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Icon name={specialCharacter === false ? 'close' : 'check'} color={specialCharacter === false ? 'gray' : 'green'}></Icon>
            <Text style={specialCharacter === false ? {color: 'gray', fontFamily: 'JejuGothic'} : {color: 'white', fontFamily: 'JejuGothic'}}>At least 1 Special Character</Text>
          </View>
        </View>
        <TextInput placeholder='Confirm Password' secureTextEntry ={true} placeholderTextColor='gray' style={{height: 50, position: 'relative', top: '30%' , color: 'white',
         backgroundColor: 'darkgreen', borderColor: 'gray', borderRadius: 18, width: '67%', left: '17%', paddingLeft: 10}}  onChangeText={text => setConfPass(text)}></TextInput>
        <TouchableOpacity onPress={selectFile} style={{backgroundColor: 'green', position: 'relative', 
          width: 120, left: 130, top: 260, height: 40, borderRadius: 10
          }}><Text style={{color: 'white', fontSize: 12, fontFamily: 'JejuGothic', position: 'relative', top: 15, left: 22}}>Upload Image</Text>
        </TouchableOpacity>
        {fileUri && <Image source={{ uri: fileUri }} style={{ left: 150, top: 270,width: 80, height: 80, borderRadius: 50 }} />}
        <TouchableOpacity onPress={passToServer} style={{backgroundColor: 'white', position: 'relative', 
          width: '60%', left: '20%', top: 300, height: '6%', borderRadius: 10
          }}><Text style={{color: 'black', fontSize: parseFloat('20'), fontFamily: 'JejuGothic', position: 'relative', top: '25%', left: '35%'}}>Sign Up</Text></TouchableOpacity>
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
    fontFamily: 'JejuGothic',
    top: -50
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: 'green',
  },
  buttonOpen: {
    backgroundColor: 'green',
  },
  buttonClose: {
    backgroundColor: 'green',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default SignUp;