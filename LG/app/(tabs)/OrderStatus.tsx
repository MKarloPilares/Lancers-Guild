import React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Modal, StyleSheet, Image, Text, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import Icon from "@expo/vector-icons/FontAwesome"
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import dayjs from 'dayjs';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface OrderStatusProps {
  customerID: string
  setCurrentPageOrderStatus: (page:string) => void
  setProfileIDOrderStatus: (page: string) => void
  orderID: string
}

const OrderStatus: React.FC<OrderStatusProps> = ({customerID, setCurrentPageOrderStatus, setProfileIDOrderStatus, orderID}) => {
  const[orderDetails, setOrderDetails]= useState<any[]>([]);
  const[userDetails, setUserDetails] = useState<any[]>([]);
  const [stars, setStars] = useState<JSX.Element[]>([]);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      userID: customerID
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
    } catch (error) {
      console.error('Error fetching data:', error);
  }}

  
  const passToServer = async () => { 

    const formData = new FormData();
    formData.append('status', 'Completed');
    formData.append('orderID', orderID );
    formData.append('proof', {
      uri : fileUri,
      type: 'image/png',
      name: 'thumbnail.jpeg'
     });
  
    try {
      const response = await fetch('http://192.168.1.29:8000/completeOrder', {
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
            <Text style={styles.modalText}>Order Completed!</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setCurrentPageOrderStatus('9')}>
              <Text style={styles.textStyle}>Ok!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <ScrollView>
      {userDetails.map((item:any) =>
        <View style={styles.content} onLayout={onLayoutRootView}>
          {orderDetails.map((order:any) =>
          <>
          <Image source={{uri:`data:image/png;base64,${loadImage(item.img.data)}`}} style={{width: 500, height: 120 , position: 'relative', left: '0%', top: 30,
            borderColor: 'white'}}></Image>
          <Image source={{uri:`data:image/png;base64,${loadImage(item.img.data)}`}} style={{width: 80, height: 80 , position: 'relative', left: '40%', top: -15, borderRadius: 50, borderColor: 'white', borderWidth: 3
            ,marginBottom: 50
          }}></Image>
            <View style={{flexDirection: 'row', left: 160, top: -45}}>
              <Text>{stars}</Text>
            </View>
          <TouchableOpacity onPress={() => {setProfileIDOrderStatus(customerID); setCurrentPageOrderStatus('6')}}><Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 25, left: 147, top: -35}}>{item.username}</Text></TouchableOpacity>
          <Text style={{fontFamily: 'JejuGothic', color: 'gray', fontSize: 15, left: 120, top: -35}}>{item.email}</Text>
          {order.status === 'Pending' ? (
            <>
            <TouchableOpacity style={{backgroundColor: 'white', width: 180, height: 35, borderRadius: 10, left: 110, marginTop: 10}} onPress={selectFile}>
              <Text style={{color: 'black', fontFamily: 'JejuGothic', textAlign: 'center', position: 'relative', top: 12, }}>Upload Proof</Text>
            </TouchableOpacity>
            {fileUri && <Image source={{ uri: fileUri }} style={{ left: 25, top: 20, width: 350, height: 200, borderRadius: 10, marginBottom: 20 }} />}
            </>
          ) : (
            <Image source={{ uri: `data:image/png;base64,${loadImage(order.img.data)}` }} style={{ left: 25, top: 20, width: 350, height: 200, borderRadius: 10, marginBottom: 20 }} />
          )}
          <View style={{alignItems: 'center'}}>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', marginTop: 10, marginBottom: 5, fontSize: 17}}>Status: {order.status  }</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', marginTop: 10, marginBottom: 5, fontSize: 17}}>Deadline: {order.deadline}</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', marginTop: 10, marginBottom: 5}}>Request</Text>
            <Text style={{color: 'white', fontFamily: 'JejuGothic', width: 300, backgroundColor: 'teal', borderRadius: 10, paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10}}>{order.details}</Text>
          </View>
          {order.status === 'Pending' && 
          <TouchableOpacity style={{backgroundColor: 'white', width: 180, height: 35, borderRadius: 10, left: 110, marginTop: 10}} onPress={passToServer}>
            <Text style={{color: 'black', fontFamily: 'JejuGothic', textAlign: 'center', position: 'relative', top: 12, }}>Finish Order</Text>
          </TouchableOpacity>
          }
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

export default OrderStatus;