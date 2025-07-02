import React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ImageBackground, StyleSheet, Image, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

interface HomeProps {
  setCurrentPageHome: (page: string) => void;
  setMarketCategoryHome: (page: string) => void;
  setProfileIDHome: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ setCurrentPageHome, setMarketCategoryHome, setProfileIDHome }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch image data from your API endpoint
    getCategories();getUsers();
  }, []);

  const getCategories = async () => {
    try {
      const response = await fetch('http://192.168.1.29:8000/getCategories');

      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const jsonData = await response.json();
      setCategories(jsonData.message);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await fetch('http://192.168.1.29:8000/getUsers');

      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const jsonData = await response.json();
      setUsers(jsonData.message);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  type CategoriesProps = {
    title: string,
    image: any,
    catID: string
  };

const Categories = ({title, image, catID}: CategoriesProps) => (
  <View style={{marginHorizontal: 10, width: 200, height: 600}}>
    <TouchableOpacity style={{backgroundColor: 'green', borderRadius: 20, height: 150}} onPress={() => {setCurrentPageHome('4');setMarketCategoryHome(catID)}}>
      <Image source={{uri: `data:image/png;base64,${image}`}} style={{width: 150, height: 100 , position: 'relative', left: 25, top: 15, borderRadius: 20}}></Image>
      <Text style={{color: 'white', fontFamily: 'JejuGothic', bottom: -25, left: 60}}>{title}</Text>
    </TouchableOpacity>
  </View>
);

type FeaturedProps = {
  firstName: string,
  lastName: string,
  user: string,
  img: any
  userID:string
};

const Featured = ({firstName, lastName, user, img, userID}: FeaturedProps) => (
  <View style={{marginHorizontal: 10 ,width: 160, height: 300}}>
    <TouchableOpacity style={{backgroundColor: 'green', borderRadius: 20, height: 180}} onPress={() => {setCurrentPageHome('6');setProfileIDHome(userID)}}>
      <Image source={{uri: `data:image/png;base64,${img}`}} style={{width: 150, height: 110 , position: 'relative', left: 5, top: '5%', borderRadius: 20}}></Image>
      <Text style={{left: 10, color: 'white', fontFamily: 'JejuGothic', bottom: -20}}>Name: {firstName} {lastName}</Text>
      <Text style={{left: 10, color: 'white', fontFamily: 'JejuGothic', bottom: -25}}>User: {user}</Text>
    </TouchableOpacity>
  </View>
);

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
          <Image source={require('../../assets/images/LG_LOGO.png')} style={{left: 125, top: 100, width: 150, height: 150}}></Image>
          <Text style={{left: 50, color: 'white', fontFamily: 'JejuGothic', top: 120}}>CATEGORIES</Text>
          <Text style={{left: 50, color: 'white', fontFamily: 'JejuGothic', top: 320}}>LANCERS</Text>
          <FlatList
            data={categories}
            renderItem={({item}) => <Categories title={item.catName} image={btoa(String.fromCharCode(...new Uint8Array(item.img.data)))} catID={item.catNum} />}
            horizontal={true}
            keyExtractor={item => item.id} style={{position: 'relative', top: 120, left: 10}}
          />
            <FlatList
            data={users}
            renderItem={({item}) => <Featured firstName={item.firstName} lastName={item.lastName} user={item.username} img={btoa(String.fromCharCode(...new Uint8Array(item.img.data)))} userID={item.userID} />}
            numColumns={2}
            keyExtractor={item => item.id} style={{top: -80, left: 15 }}
          />
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

export default Home;