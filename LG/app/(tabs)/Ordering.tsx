import React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Modal, StyleSheet, Image, Text, TouchableOpacity, TextInput, Pressable, ScrollView } from 'react-native';
import Icon from "@expo/vector-icons/FontAwesome"
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

interface OrderingProps {
  setCurrentPageOrdering: (page: string) => void;
  setProfileID: (page: string) => void;
  serviceOwnerID: string;
  customerID: string;
  serviceID: string;
  username: string;
}


const Ordering: React.FC<OrderingProps> = ({ setCurrentPageOrdering, serviceOwnerID, serviceID, customerID, setProfileID, username }) => {
  const [date, setDate] = useState(dayjs());
  const[orderDetails, setOrderDetails] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const[userDetails, setUserDetails] = useState<any[]>([]);
  const[serviceDetails, setServiceDetails] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [stars, setStars] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Fetch image data from your API endpoint
   {getServiceOwner(); getServiceDetails()};
  }, []);

  const getServiceOwner = async () => { 
    const requestData = {
      userID: serviceOwnerID,
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
    
  const getServiceDetails = async () => { 
    const requestData = {
      serveID: serviceID,
    };
  
    try {
      const response = await fetch('http://192.168.1.29:8000/getServiceDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });
      
      const jsonData = await response.json();
      setServiceDetails(jsonData.message);
    } catch (error) {
      console.error('Error fetching data:', error);
  }}

  const confirmOrder = async () => { 
    const requestData = {
      custID: customerID,
      lancerID: serviceOwnerID,
      deadline: formatDate(date),
      details: orderDetails,
      serviceID: serviceID,
      title: serviceDetails[0].serviceName,
      custName: username,
      lancerName: userDetails[0].username,
      price: serviceDetails[0].price,
      status: 'Pending',
    };
  
    try {
      const response = await fetch('http://192.168.1.29:8000/confirmOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });

      setModalVisible(true);
      
    } catch (error) {
      console.error('Error fetching data:', error);
  }}

  const DeleteService = async () => { 
    const requestData = {
      serviceID: serviceID,
    };
  
    try {
      const response = await fetch('http://192.168.1.29:8000/DeleteService', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });

      setModalVisible(true);
      
    } catch (error) {
      console.error('Error fetching data:', error);
  }}

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  

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

  const handleDatePickerToggle = () => {
    setShowDatePicker(!showDatePicker); // Toggles the visibility of the date picker
  };

  const loadImage = (bytes: any) => {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
  };
  
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
            <Text style={styles.modalText}>Processing Complete!</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setCurrentPageOrdering('8')}>
              <Text style={styles.textStyle}>Ok!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <ScrollView>
        {userDetails.map((user: any) => 
        <View style={styles.content} onLayout={onLayoutRootView}>
          {serviceDetails.map((serv: any) =>
          <>
          <Image source={{uri: `data:image/png;base64,${loadImage(user.img.data)}`}} style={{width: 500, height: 120 , position: 'relative', left: '0%', top: 30,
            borderColor: 'white'}}></Image>
          <Image source={{uri: `data:image/png;base64,${loadImage(user.img.data)}`}} style={{width: 80, height: 80 , position: 'relative', left: '40%', top: -15, borderRadius: 50, borderColor: 'white', borderWidth: 3,
            marginBottom: 50
          }}></Image>
            <View style={{flexDirection: 'row', left: 160, top: -50}}>
              <Text>{stars}</Text>
            </View>
          <TouchableOpacity onPress={() => {setProfileID(serviceOwnerID); setCurrentPageOrdering('6')}}><Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 25, left: 147, top: -35}}>{user.username}</Text></TouchableOpacity>
          <Text style={{fontFamily: 'JejuGothic', color: 'gray', fontSize: 15, left: 120, top: -35}}>{user.email}</Text>
          <Image source={{uri: `data:image/png;base64,${loadImage(serv.img.data)}`}}  style={{width: 340, height: 200 , left: 27, top: -20,
            borderColor: 'white'}}></Image>
          {serv.ownerID !== customerID ? (
          <>
          {/* Button to open date picker */}
          <TouchableOpacity onPress={handleDatePickerToggle} style={{backgroundColor: 'teal', width: 150, height: 30, borderRadius: 10, left: 120}}>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', marginLeft: 10, position: 'relative', top: 8}}>Select Deadline</Text>
            <Icon name="calendar" size={20} color='white' style={{position: 'relative', left: 120, top: -12}}></Icon>
          </TouchableOpacity>

          {/* Date Picker */}
          {showDatePicker && (
            <View style={{flex: 1}}>
              <DateTimePicker
                mode="single"
                date={date}
                onChange={(params) => {
                  setDate(params.date);
                  setShowDatePicker(false); // Close date picker after selecting date
                }}
              /> 
            </View>
          )}
          <View style={{alignItems: 'center'}}>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', marginTop: 10, marginBottom: 5}}>Explain Your Request</Text>
            <TextInput multiline placeholder='Explain here...' style={{height: 120, color: 'white', borderWidth: 5,
              top: '0%', backgroundColor: 'lightblue', borderColor:
             'teal', borderRadius: 18, width: '80%', left: 0, paddingLeft: 10}} onChangeText={text => setOrderDetails(text)}></TextInput>
          </View>
          <TouchableOpacity onPress={confirmOrder} style={{backgroundColor: 'white', width: 180, height: 35, borderRadius: 10, left: 110, marginTop: 10}}>
            <Text style={{color: 'black', fontFamily: 'JejuGothic', textAlign: 'center', position: 'relative', top: 12, }}>Confirm Order</Text>
          </TouchableOpacity>
          </>) :(
            <TouchableOpacity onPress={DeleteService} style={{backgroundColor: 'white', width: 180, height: 35, borderRadius: 10, left: 110, marginTop: 10}}>
              <Text style={{color: 'black', fontFamily: 'JejuGothic', textAlign: 'center', position: 'relative', top: 12, }}>Delete Service</Text>
            </TouchableOpacity>
          )}
          </>
          )}
        </View>
        )}
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

export default Ordering;