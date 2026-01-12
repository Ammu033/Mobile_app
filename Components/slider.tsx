import React from "react";
import { View, Image, StyleSheet, TouchableOpacity  } from "react-native";
import Swiper from "react-native-swiper";

const imagesData = [
  require("../assets/happy-dussehra-wishing-greeeting-card-with-vector-illustration_632231-1509.jpg"),
  require("../assets/camp.png"),
  require("../assets/panch.png"),
];
interface imageclick {
    onPress?: ()=> void;
}

const ImageSlider = ({onPress}:imageclick) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.container}>
      <Swiper
        loop
        autoplay
        autoplayTimeout={3}
        showsButtons={false}
        paginationStyle={styles.pagination}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {imagesData.map((image, index) => (
          <Image
            key={index}
            source={image}
            style={styles.image}
          />
        ))}
      </Swiper>
    </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    height: 200
  },
  image: { 
    width: "100%",
    height: 200,
    borderRadius: 10
  },
  pagination: {
    bottom: 10
  },
  dot: {
    backgroundColor: "gray",
    width: 8,
    height: 8,
    borderRadius: 4
  },
  activeDot: {
    backgroundColor: "black",
    width: 10,
    height: 10,
    borderRadius: 5
  }
});

export default ImageSlider;