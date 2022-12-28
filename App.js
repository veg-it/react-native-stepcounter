import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share
} from 'react-native';
import { Pedometer } from 'expo-sensors';
import * as Progress from 'react-native-progress';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';
import { StatusBar } from 'expo-status-bar';
import ViewShot from 'react-native-view-shot';

export default function App() {
  const { width } = Dimensions.get('window');

  //pedometr
  // const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [pastStepCount, setPastStepCount] = useState(0);
  const [yesterdayStepCount, setYesterdayStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  const subscribe = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    // setIsPedometerAvailable(String(isAvailable));

    if (isAvailable) {
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0);
      // console.log(start);
      // console.log(end);

      const yend = start;
      const ystart = new Date();
      ystart.setHours(yend.getHours() - 24);
      ystart.setMinutes(ystart.getMinutes() - ystart.getMinutes())
      // console.log(ystart);
      // console.log(yend)

      const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
      if (pastStepCountResult) {
        setPastStepCount(pastStepCountResult.steps);
      }
      const yesterdayStepCountResult = await Pedometer.getStepCountAsync(
        ystart,
        yend
      );
      if (yesterdayStepCountResult) {
        setYesterdayStepCount(yesterdayStepCountResult.steps);
      }

      return Pedometer.watchStepCount((result) => {
        setCurrentStepCount(result.steps);
      });
    }
  };

  useEffect(() => {
    const subscription = subscribe();
    return () => subscription && subscription.remove();
  }, []);

  //share
  const ref = useRef();
  onShare = () => {
    ref.current.capture().then((uri) => {
      Share.share(
        {
          message: `Hey look at this screenshot`,
          url: uri,
          title: `Screen Shot`,
        },
        {
          dialogTitle: 'Share your screenshot',
        }
      );
    });
  };

  //goals
  const goals = [{ goal: 1000 }, { goal: 5000 }, { goal: 10000 }];

  return (
    <ViewShot style={styles.container} ref={ref}>
      <LinearGradient
        colors={['#134E5E', '#71B280']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '120%',
        }}
      />
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          display: 'flex',
          flexDirection: 'row',
          paddingHorizontal: 15,
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text style={styles.titleIcon}>👟</Text>
          <Text style={[styles.titleText, { marginVertical: 40 }]}>
            Last 24 hours:
          </Text>
        </View>
        <TouchableOpacity onPress={onShare} style={{ marginRight: 15 }}>
          <Icon color="#fff" name="share" type="font-awesome" size={24} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}>
          {goals.map((goal) => (
            <View
              style={{ width, justifyContent: 'center', alignItems: 'center' }}>
              <Progress.Circle
                size={125}
                style={styles.progress}
                progress={pastStepCount / goal.goal}
                thickness={5}
                color="#fff"
                showsText={true}
              />
              <Text
                style={{
                  color: '#fff',
                  marginVertical: 2,
                  padding: 15,
                  fontSize: 20,
                }}>
                {pastStepCount} / {goal.goal}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* <Text style={styles.textStyle}>Pedometer.isAvailableAsync(): {isPedometerAvailable}</Text> */}

      <View
        style={{
          display: 'flex',
          marginTop: 20,
          alignItems: 'center',
        }}>
        <View style={styles.item}>
          <View
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
              paddingHorizontal: 15,
            }}>
            <Text style={styles.titleIcon}> 📏 </Text>
            <Text style={styles.titleText}> Last 24 hours: </Text>
          </View>
          <Text style={styles.titleDesc}>
            {' '}
            {((pastStepCount * 0.7) / 1000).toFixed(2)} km{' '}
          </Text>
        </View>

        <View style={styles.item}>
          <View
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
              paddingHorizontal: 15,
            }}>
            <Text style={styles.titleIcon}> 📅 </Text>
            <Text style={styles.titleText}> Yesterday steps: </Text>
          </View>
          <Text style={styles.titleDesc}> {yesterdayStepCount} </Text>
        </View>

        <View style={styles.item}>
          <View
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'row',
              paddingHorizontal: 15,
            }}>
            <Text style={styles.titleIcon}> 🔴 </Text>
            <Text style={styles.titleText}> Live steps: </Text>
          </View>
          <Text style={styles.titleDesc}>{currentStepCount}</Text>
        </View>
      </View>
      <StatusBar style="light" />
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313745',
    paddingTop: Constants.statusBarHeight,
  },
  titleIcon: {
    fontSize: 24,
    marginRight: 5,
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
  },
  titleDesc: {
    color: '#fff',
    marginVertical: 15,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  item: {
    paddingVertical: 15,
    width: 200,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
});
