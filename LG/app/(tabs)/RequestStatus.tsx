import React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Modal, StyleSheet, Image, Text, TouchableOpacity, TextInput, Pressable, ScrollView } from 'react-native';
import Icon from "@expo/vector-icons/FontAwesome"
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

interface RequestStatusProps {
  ownerID: string
  userID: string
  setCurrentPageReqStatus: (page:string) => void
  setProfileIDReqStatus: (page: string) => void
  orderID: string
  username: string
}


const RequestStatus: React.FC<RequestStatusProps> = ({ownerID, setCurrentPageReqStatus, setProfileIDReqStatus, orderID, userID, username}) => {
  const [date, setDate] = useState(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const[orderDetails, setOrderDetails]= useState<any[]>([]);
  const[userDetails, setUserDetails] = useState<any[]>([]);
  const [stars, setStars] = useState<JSX.Element[]>([]);
  const[orderText, setOrderText] = useState('');
  const[serviceRating, setServiceRating] = useState('');
  const[lancerRating, setLancerRating] = useState('');
  const[reviewText, setreviewText] = useState('');
  const[serviceID, setServiceID] = useState('');
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalRateVisible, setModalRateVisible] = useState(false);
  const[rated, setRated]  = useState<any>(null);

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
    {getUserProfile();getOrderDetails()};
  }, []);


  const getUserProfile = async () => { 
    const requestData = {
      userID: ownerID
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

  const getOrderDetails = async () => { 
    const requestData = {
      orderID: orderID,
    };
  
    try {
      const response = await fetch('http://192.168.1.29:8000/getOrderDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });
      
      const jsonData = await response.json();
      setOrderDetails(jsonData.message);
      setOrderText(jsonData.message[0].details)
      setServiceID(jsonData.message[0].serviceID)
      setRated(jsonData.message[0].rated)
    } catch (error) {
      console.error('Error fetching data:', error);
  }}

  const passToServer = async () => { 

    const formData = new FormData();
    formData.append('lancerRating', lancerRating);
    formData.append('serviceRating', serviceRating );
    formData.append('serviceID', serviceID);
    formData.append('userID', userID );
    formData.append('ownerID', ownerID );
    formData.append('reviewText', reviewText);
    formData.append('username', username);
    formData.append('rated', 'Rated');
    formData.append('orderID', orderID);
  
    try {
      const response = await fetch('http://192.168.1.29:8000/reviewRequest', {
        method: 'POST',
        body: formData,
      })
      
      setModalRateVisible(true);
      
  
  } catch (error) {
    console.error('Error signing up:', error);
  };
  };
  
  const editOrder = async () => { 
    const requestData = {
      deadline: formatDate(date),
      details: orderText,
      orderID: orderID
    };
  
    try {
      console.log(modalEditVisible)
      const response = await fetch('http://192.168.1.29:8000/editOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
      });
      
      setModalEditVisible(true);
      
    } catch (error) {
      console.error('Error fetching data:', error);
  }}

  const handleDatePickerToggle = () => {
    setShowDatePicker(!showDatePicker); // Toggles the visibility of the date picker
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  

  const loadImage = (bytes: any) => {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
  };
  
  return (
    <SafeAreaProvider>
        <Modal
        animationType="slide"
        transparent={true}
        visible={modalEditVisible}
        onRequestClose={() => {
          setModalEditVisible(!modalEditVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Order Edited!</Text>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalRateVisible}
        onRequestClose={() => {
          setModalRateVisible(!modalRateVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Rating Complete!</Text>
          </View>
        </View>
      </Modal>
       <ScrollView>
        {userDetails.map((user: any) =>
        <View style={styles.content} onLayout={onLayoutRootView}>
          {orderDetails.map((order: any) =>
          <>
          <Image source={{uri:`data:image/png;base64,${loadImage(user.img.data)}`}} style={{width: 500, height: 120 , position: 'relative', left: '0%', top: 30,
            borderColor: 'white'}}></Image>
          <Image source={{uri:`data:image/png;base64,${loadImage(user.img.data)}`}} style={{width: 80, height: 80 , position: 'relative', left: '40%', top: -15, borderRadius: 50, borderColor: 'white', borderWidth: 3, 
            marginBottom: 50
          }}></Image>
            <View style={{flexDirection: 'row', left: 160, top: -50}}>
            <Text>{stars}</Text>
            </View>
          <TouchableOpacity  onPress={() => {setProfileIDReqStatus(ownerID); setCurrentPageReqStatus('6')}}><Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 25, left: 147, top: -35}}>{user.username}</Text></TouchableOpacity>
          <Text style={{fontFamily: 'JejuGothic', color: 'gray', fontSize: 15, left: 120, top: -35}}>{user.email}</Text>
          <Image source={{uri:`data:image/png;base64,${loadImage(order.img.data)}`}} style={{width: 340, height: 200 , left: 27, top: -20,
            borderColor: 'white'}}></Image>
          <Text style={{color: 'white', fontFamily: 'JejuGothic', marginTop: 10, marginBottom: 5, left: 140}}>Status: {order.status}</Text>
          {order.status === 'Pending' ? (
            <>
            {/* Button to open date picker */}
            <Text style={{color: 'white', fontFamily: 'JejuGothic', marginTop: 10, marginBottom: 5, left: 100}}>Current Deadline: {order.deadline}</Text>
            <TouchableOpacity onPress={handleDatePickerToggle} style={{backgroundColor: 'teal', width: 150, height: 30, borderRadius: 10, left: 120}}>
              <Text style={{color: 'white', fontFamily: 'JejuGothic', marginLeft: 10, position: 'relative', top: 8}}>Edit Deadline</Text>
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
              <TextInput multiline value={orderText} style={{height: 120, color: 'white', borderWidth: 5,
                top: '0%', backgroundColor: 'lightblue', borderColor:
              'teal', borderRadius: 18, width: '80%', left: 0, paddingLeft: 10}} onChangeText={text => setOrderText(text)}></TextInput>
            </View>
            <TouchableOpacity style={{backgroundColor: 'white', width: 180, height: 35, borderRadius: 10, left: 110, marginTop: 10}} onPress={editOrder}>
              <Text style={{color: 'black', fontFamily: 'JejuGothic', textAlign: 'center', position: 'relative', top: 12, }}>Edit Request</Text>
            </TouchableOpacity>
            </>
          ) : rated === null ? (
            <>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', marginLeft: 10, top: 8, left: 110, fontSize: 20}}>Rate This Service</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: 25, left: 133, fontSize: 20 }}>1</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: 2, left: 162, fontSize: 20 }}>2</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: -20, left: 190, fontSize: 20 }}>3</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: -42, left: 216, fontSize: 20 }}>4</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: -64, left: 245, fontSize: 20 }}>5</Text>
            <View style={{flexDirection: 'row', left: 125, top: -60}}>
            <TouchableOpacity onPress={() => setServiceRating('1')}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setServiceRating('2')} style={parseInt(serviceRating) <2 && {display: 'none'}}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setServiceRating('3')} style={parseInt(serviceRating) <3 && {display: 'none'}}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setServiceRating('4')} style={parseInt(serviceRating) <4 && {display: 'none'}}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setServiceRating('5')} style={parseInt(serviceRating) <5 && {display: 'none'}}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            </View>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', marginLeft: 10, top: -40, left: 110, fontSize: 20}}>Rate This Lancer</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: -25, left: 133, fontSize: 20 }}>1</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: -48, left: 162, fontSize: 20 }}>2</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: -70, left: 190, fontSize: 20 }}>3</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: -92, left: 216, fontSize: 20 }}>4</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', top: -114, left: 245, fontSize: 20 }}>5</Text>
            <View style={{flexDirection: 'row', left: 125, top: -110}}>
            <TouchableOpacity onPress={() => setLancerRating('1')}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setLancerRating('2')} style={parseInt(lancerRating) <2 && {display: 'none'}}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setLancerRating('3')} style={parseInt(lancerRating) <3 && {display: 'none'}}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setLancerRating('4')} style={parseInt(lancerRating) <4 && {display: 'none'}}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setLancerRating('5')} style={parseInt(lancerRating) <5 && {display: 'none'}}><Icon name="star" size={30} color="gold" /></TouchableOpacity>
            </View>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', marginLeft: 10, top: -80, left: 76, fontSize: 20}}>Comment for the Lancer</Text>
            <TextInput multiline onChangeText={(text) => setreviewText(text)} placeholder='Comment here...' style={{height: 120, color: 'white', borderWidth: 5,
                top: -70, backgroundColor: 'lightblue', borderColor:
              'teal', borderRadius: 18, width: '80%', left: 40, paddingLeft: 10}}></TextInput>
            <TouchableOpacity style={{backgroundColor: 'white', width: 180, height: 35, borderRadius: 10, left: 110, marginTop: 10, top: -50}} onPress={() => {passToServer(); setRated('Rated')}}>
              <Text style={{color: 'black', fontFamily: 'JejuGothic', textAlign: 'center', position: 'relative', top: 12, }}>Submit Rating</Text>
            </TouchableOpacity>
            </> ) : (<View/>)}
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
    fontFamily: 'JejuGothic',
    height: '100%'
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

export default RequestStatus;