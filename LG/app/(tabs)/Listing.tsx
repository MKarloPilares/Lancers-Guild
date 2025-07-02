import React from 'react';
import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, Image, Text, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import * as SplashScreen from 'expo-splash-screen';
import RNPickerSelect from 'react-native-picker-select'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface ListingProps {
  userID: string
  setCurrentPageListing: (page: string) => void
}

const Listing: React.FC<ListingProps> = ({ userID, setCurrentPageListing }) => {
const [serviceName, setServiceName] = useState('');
const [price, setPrice] = useState('');
const [fileUri, setFileUri] = useState<string | null>(null);
const [selectedCategory, setSelectedCategory] = useState('');
const[categories, setCategories] = useState<any[]>([]);
const [modalVisible, setModalVisible] = useState(false);
const[thumbReq, setThumbReq] = useState(false);
const[pickCat, setPickCat] = useState(false);
const[number, setNumber] = useState(false);
const[name, setName] = useState(false);

const selectFile = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    const resizedImage = await manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 360, height: 180 } }], // Adjust width and height as needed
      { compress: 0.8, format: SaveFormat.PNG } // Adjust compression quality as needed
    );

    setFileUri(resizedImage.uri);
  }
};

useEffect(() => {
  // Fetch image data from your API endpoint
 getCategories();
}, []);


const getCategories = async () => {
  try {
    const response = await fetch('http://192.168.1.29:8000/getCategories');

    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    interface Category {
      catName: string;
      catNum: string;
      // Other properties if any
    }
    
    const jsonData = await response.json();
    const formattedCategories = jsonData.message.map((category: Category)=> ({
      label: category.catName, // Assuming categoryName is the field containing the category name
      value: category.catNum,     // Use catNumber as the value
    }));
    
    setCategories(formattedCategories);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const hasLetter = (str: string) => {
  const capitalLetterRegex = /[a-z-A-Z]/;
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

const passToServer = async () => { 

  if (serviceName === '') {
    setNumber(false)
    setPickCat(false)
    setName(true)
    setThumbReq(false)
    return
  }

  if (!hasNumber(price)) {
    setNumber(true)
    setPickCat(false)
    setName(false)
    setThumbReq(false)
    return
  }

  if (hasLetter(price)) {
    setNumber(true)
    setPickCat(false)
    setName(false)
    setThumbReq(false)
    return
  }

  if (hasSpecialCharacter(price)) {
    setNumber(true)
    setPickCat(false)
    setName(false)
    setThumbReq(false)
    return
  }

  if (fileUri === null) {
    setNumber(false)
    setPickCat(false)
    setName(false)
    setThumbReq(true)
  }

  if (selectedCategory === null) {
    setNumber(false)
    setPickCat(true)
    setName(false)
    setThumbReq(false)
  }

  const formData = new FormData();
  formData.append('serviceName', serviceName);
  formData.append('ownerID', userID);
  formData.append('price', price);
  formData.append('catID', selectedCategory);
  formData.append('thumbnail', {
    uri : fileUri,
    type: 'image/png',
    name: 'thumbnail.jpeg'
   });

  try {
    const response = await fetch('http://192.168.1.29:8000/newService', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data', // This header might be set automatically by FormData
      },
    });

    setModalVisible(true);

} catch (error) {
  console.error('Error:', error);
};
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
            <Text style={styles.modalText}>Listing Successful!</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setCurrentPageListing('4')}>
              <Text style={styles.textStyle}>Ok!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
        <View style={styles.content} onLayout={onLayoutRootView}>
        <Text style={{fontFamily: 'JejuGothic', color: 'white', position: 'relative', top: 100, left: 130, fontSize: 25}}>New Service</Text>
        <Text style={{color: 'white', fontFamily: 'JejuGothic', marginLeft: 10, position: 'relative', top: 140, left: 60}}>Service Title</Text>
        <TextInput placeholder='Name' placeholderTextColor='gray' onChangeText={text => setServiceName(text)}
        style={{height: 50, position: 'relative', top: 150 , color: 'white', backgroundColor: 'darkgreen', borderColor: 'gray', borderRadius: 18, width: '67%', left: '17%', paddingLeft: 10}}></TextInput>
        <Text style={{color: 'white', fontFamily: 'JejuGothic', marginLeft: 10, position: 'relative', top: 170, left: 60}}>Service Price</Text>
        <TextInput placeholder='Price' placeholderTextColor='gray' onChangeText={text => setPrice(text)}
         style={{height: 50, position: 'relative', top: 180, color: 'white', backgroundColor: 'darkgreen', borderColor: 'gray', borderRadius: 18, width: '67%', left: '17%', paddingLeft: 10}}></TextInput>
        <View style={{left: 70, top: 190,backgroundColor: 'green', width: 200, borderRadius: 18}}>
        <RNPickerSelect
        onValueChange={(value) => setSelectedCategory(value)}
        items={categories}
        placeholder={{ label: 'Select a Category', value: null }}
      /></View>
        <Text style={{color: 'white', fontFamily: 'JejuGothic', marginLeft: 10, position: 'relative', top: 200, left: 90, fontSize: 20}}>Upload Thumbnail</Text>
        <TouchableOpacity onPress={selectFile} style={{backgroundColor: 'green', position: 'relative', 
          width: 120, left: 130, top: 210, height: 40, borderRadius: 10
          }} ><Text style={{color: 'white', fontSize: 12, fontFamily: 'JejuGothic', position: 'relative', top: 15, left: 22}}>Upload Image</Text>
        </TouchableOpacity>
        {thumbReq === true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: 230, left: 90, fontSize: 20}}>Thumbnail Required!</Text>}
        {number === true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: 230, left: 130, fontSize: 20}}>Invalid Price!</Text>}
        {pickCat === true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: 230, left: 90, fontSize: 20}}>Please Pick a Category!</Text>}
        {name === true && <Text style={{fontFamily: 'JejuGothic', color: 'red', position: 'relative', top: 230, left: 60, fontSize: 20}}>Please Input a Service Name!</Text>}
        {fileUri && <Image source={{ uri: fileUri }} style={{ left: 25, top: 200, width: 350, height: 200, borderRadius: 10 }} />}
        <TouchableOpacity onPress={passToServer} style={{backgroundColor: 'white', position: 'relative', 
          width: '60%', left: '20%', top: 250, height: '6%', borderRadius: 10
          }}><Text style={{color: 'black', fontSize: parseFloat('20'), fontFamily: 'JejuGothic', position: 'relative', top: '25%', left: 80}}>Confirm</Text></TouchableOpacity>
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
  picker: {
    backgroundColor: 'green',
    left: 500
  },  centeredView: {
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

export default Listing;
