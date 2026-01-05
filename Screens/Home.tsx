import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Button from '../Components/Button';
import ImageSlider from '../Components/slider';

export default function Home() {
  const handleButtonPress = (buttonName: string) => {
    console.log(`${buttonName} pressed`);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
          
        </View>

        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          <ImageSlider onPress={() => handleButtonPress('slider')}/>
        </View>

        {/* Buttons Grid */}
        <View style={styles.buttonsSection}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <Button 
                title="Appoitment" 
                iconname="calendar"
                onPress={() => handleButtonPress('Calendar')}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button 
                title="Report" 
                iconname="alert-circle"
                onPress={() => handleButtonPress('Report')}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <Button 
                title="Form" 
                iconname="clipboard-text"
                onPress={() => handleButtonPress('Form')}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button 
                title="News" 
                iconname="newspaper"
                onPress={() => handleButtonPress('News')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f4e',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    marginTop:10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#b0b3d9',
    fontWeight: '500',
  },
  sliderContainer: {
    height: 240,
    marginHorizontal: 24,
    marginVertical: 24,
    borderRadius: 16,
    overflow: 'hidden',
    },
  buttonsSection: {
    paddingHorizontal: 24,
    gap: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  buttonWrapper: {
    flex: 1,
  },
});