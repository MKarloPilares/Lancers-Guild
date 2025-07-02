import React, { useState, useRef, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Svg, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { View, ImageBackground, StyleSheet, DrawerLayoutAndroid, Text, Image} from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Login from './Login';
import SignUp from './SignUp';
import GetStarted from './GetStarted';
import Home from './Home';
import Market from './Market';
import Ordering from './Ordering';
import Profile from './Profile';
import OrderStatus from './OrderStatus';
import RequestStatus from './RequestStatus';
import Orders from './Orders';
import Requests from './Requests';
import Listing from './Listing';
import EditProf from './EditProf';
import { TouchableOpacity, GestureHandlerRootView} from 'react-native-gesture-handler';
import Icon from "@expo/vector-icons/MaterialIcons";


export default function HomeScreen() {
  const drawer = useRef<DrawerLayoutAndroid>(null);
  const [currentPage, setPage] = useState('0');
  const[marketCategory, setMarketCategory] = useState('0');
  const[username, setUsername] = useState('');
  const[userID, setUserID] = useState('');
  const[profileID, setProfileID] = useState(userID)
  const[email, setEmail] = useState('');
  const[serviceOwnerID, setServiceOwnerID] = useState('');
  const[serviceID, setServiceID] = useState('');
  const[orderID, setorderID] = useState('');
  const[prevPages, setPrevPages] =useState<string[]>([])
  
  const [fontsLoaded, fontError] = useFonts({
    'JejuGothic': require('../../assets/fonts/JejuGothic-Regular.ttf'),
  });

  const setCurrentPage = (page: string) => {
    if (parseInt(currentPage) > 2) {
      prevPages.push(currentPage)
      setPrevPages(prevPages)
    }
    setPage(page)
  }

  const returnPage = () => {
    setPage(prevPages[prevPages.length-1])
    console.log(prevPages[prevPages.length-1])
    prevPages.pop()
    setPrevPages(prevPages)
  }


  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const loadImage = (bytes: any) => {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
  };

  const navigationView = () => (
    <View style={{backgroundColor: 'darkgreen', flex: 1}}>
      <Image source={require('../../assets/images/LG_LOGO.png')} style={{top: 100, width: 100, left: 100, height: 100}}></Image>
      <Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 20, left: 50, top: 140}}>{username}</Text>
      <Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 15, left: 50, top: 150}}>{email}</Text>
      <View>
        <TouchableOpacity style={{top: 200, left: 40, width: 60, height: 40}} onPress={() => setCurrentPage('3')}>
          <Icon name='house' size={30} color='white'></Icon>
          <Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 20, left: 50, top: -25}}>Home</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={{top: 200, left: 40, width: 60, height: 40}} onPress={() => {setProfileID(userID);setCurrentPage('6')}}>
        <Icon name='person' size={30} color='white'></Icon>
        <Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 20, left: 50, top: -25}}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{top: 200, left: 40, width: 70, height: 40}}>
        <Icon name='store' size={30} color='white'></Icon>
        <Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 20, left: 50, top: -25}} onPress={() => {setMarketCategory('0');setCurrentPage('4')}}>Market</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{top: 200, left: 40, width: 70, height: 40}}>
        <Icon name='receipt' size={30} color='white'></Icon>
        <Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 20, left: 50, top: -25}} onPress={() => setCurrentPage('9')}>Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{top: 200, left: 40, width: 85, height: 40}}>
        <Icon name='receipt' size={30} color='white'></Icon>
        <Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 20, left: 50, top: -25}} onPress={() => setCurrentPage('10')}>Requests</Text>
      </TouchableOpacity>
        <View style={{width: 80, height: 40}}>
          <TouchableOpacity style={{top: 420, left: 40}}>
            <Icon name='power-settings-new' size={30} color='white'></Icon>
            <Text style={{fontFamily: 'JejuGothic', color: 'white', fontSize: 20, left: 50, top: -25}} onPress={() => {drawer.current?.closeDrawer();setCurrentPage('0');setUsername('');setEmail('');setUserID('');}}>Log Out</Text>
          </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <DrawerLayoutAndroid 
          ref={drawer}
          drawerWidth={300}
          renderNavigationView={navigationView}
          drawerPosition='right'
        >
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="grad" x1="50%" y1="0%" x2="50%" y2="95%">
                <Stop offset="0%" stopColor="#2de361" stopOpacity="1" />
                <Stop offset="50%" stopColor="#4ee695" stopOpacity="1" />
                <Stop offset="100%" stopColor="teal" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
          </Svg>
          <ImageBackground 
            source={require('../../assets/images/LG_BACKGROUND.png')}
            style={styles.background}
          >
            <View style={{zIndex: 100}}>
            {currentPage !== '0' && currentPage !== '1' && currentPage !== '2' && 
              <>
                {prevPages.length === 0 ? (
                <View style={{top: 50, left: 330, height: 35, width: 40}}>
                <TouchableOpacity onPress={() => drawer.current?.openDrawer()}>
                  <Icon name="menu" size={40} color="white" />
                </TouchableOpacity>
                </View>
                  ) : ( 
                  <>
                  <View style={{top: 50, left: 330, height: 35, width: 40}}>
                    <TouchableOpacity onPress={() => drawer.current?.openDrawer()}>
                      <Icon name="menu" size={40} color="white" />
                    </TouchableOpacity>
                  </View>
                  <View style={{top: 20, left: 20, height: 35, width: 40}}>
                    <TouchableOpacity onPress={returnPage}>
                      <Icon name="arrow-back" size={40} color="white" />
                    </TouchableOpacity>
                  </View>
                  </>
                  )
                }
              </>
              }
            </View>
            <View style={parseInt(currentPage) < 3 ? ({bottom: 20, zIndex: 90, height: '100%'}): ({bottom: 70, zIndex: 90, height: '100%'})} onLayout={onLayoutRootView}>
              {currentPage === '0' && <GetStarted setCurrentPage={setCurrentPage} />}
              {currentPage === '1' && <Login setCurrentPageLogin={setCurrentPage} setLoggedInUsername={setUsername} setLoggedInEmail={setEmail} setLoggedInUserID={setUserID}/>}
              {currentPage === '2' && <SignUp setCurrentPageSignUp={setCurrentPage}/>}
              {currentPage === '3' && <Home setCurrentPageHome={setCurrentPage} setMarketCategoryHome={setMarketCategory} setProfileIDHome={setProfileID}/>}
              {currentPage === '4' && <Market setCurrentPageMarket={setCurrentPage} marketCategory={marketCategory} setServiceOwnerID={setServiceOwnerID} setServiceID={setServiceID}/>}
              {currentPage === '5' && <Ordering setCurrentPageOrdering={setCurrentPage} serviceOwnerID={serviceOwnerID} serviceID={serviceID} customerID={userID} setProfileID={setProfileID} username={username}/>}
              {currentPage === '6' && <Profile userID={profileID} setCurrentPageProfile={setCurrentPage} setServiceIDProfile={setServiceID} setServiceOwnerIDProfile={setServiceOwnerID} loggedinID={userID}/>}
              {currentPage === '7' && <OrderStatus customerID={profileID} setCurrentPageOrderStatus={setCurrentPage} setProfileIDOrderStatus={setProfileID} orderID={orderID}/>} 
              {currentPage === '8' && <RequestStatus ownerID={userID} setCurrentPageReqStatus={setCurrentPage} setProfileIDReqStatus={setProfileID} orderID={orderID} userID={userID} username={username}/>} 
              {currentPage === '9' && <Orders userID={userID} setCurrentPageOrders={setCurrentPage} setProfileIDOrders={setProfileID} setOrderIDOrder={setorderID}/>} 
              {currentPage === '10' && <Requests userID={userID} setCurrentPageRequests={setCurrentPage} setProfileIDrequests={setProfileID} setOrderIDRequests={setorderID}/>} 
              {currentPage === '11' && <Listing userID={userID} setCurrentPageListing={setCurrentPage}/>}
              {currentPage === '12' && <EditProf userID={userID} setCurrentPageEditProf={setCurrentPage}/>}
            </View>
          </ImageBackground>
        </DrawerLayoutAndroid>
      </GestureHandlerRootView>
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
    fontFamily: 'JejuGothic',
    bottom: 70,
    zIndex: 99,
    height: '100%'
  },
  mainText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
