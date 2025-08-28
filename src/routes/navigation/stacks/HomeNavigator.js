import React, { useState, useContext } from 'react'
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'
import { Easing } from 'react-native'
import { HomeTitleContext } from '../../../context/HomeTitleContext'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import { lightProps, darkProps } from './navigationProps/navigationProps'
import HeaderStyle from './headerComponents/HeaderStyle'

// 自定义随机方向覆盖动画
const forRandomOverlay = ({ current, next, layouts }) => {
  const directions = [
    [layouts.screen.width, 0], // 从右往左
    [-layouts.screen.width, 0], // 从左往右
    [0, layouts.screen.height], // 从下往上
    [0, -layouts.screen.height], // 从上往下
  ]
  
  const randomDirection = directions[Math.floor(Math.random() * directions.length)]
  
  return {
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [randomDirection[0], 0],
          }),
        },
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [randomDirection[1], 0],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.1],
      }),
    },
  }
}

import Home from '../../../scenes/home'
import Teaching from '../../../scenes/teaching'
import Story from '../../../scenes/story'
import Chat from '../../../scenes/chat'

const Stack = createStackNavigator()

export const HomeNavigator = () => {
  const { scheme } = useContext(ColorSchemeContext)
  const navigationProps = scheme === 'dark' ? darkProps : lightProps
  const [title, setTitle] = useState('default title')
  return (
    <HomeTitleContext.Provider
      value={{
        title,
        setTitle,
      }}
    >
      <HomeTitleContext.Consumer>
        {(ctx) => (
          <Stack.Navigator screenOptions={navigationProps}>
            <Stack.Screen
              name="Home"
              component={Home}
              options={({ navigation }) => ({
                title: '幼教学习',
                headerBackground: scheme === 'dark' ? null : () => <HeaderStyle />,
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
                headerMode: 'screen',
                headerTitleAlign: 'left',
                transitionSpec: {
                  open: {
                    animation: 'timing',
                    config: {
                      duration: 300,
                      easing: Easing.out(Easing.ease),
                      useNativeDriver: true,
                    },
                  },
                  close: {
                    animation: 'timing',
                    config: {
                      duration: 200,
                      easing: Easing.in(Easing.ease),
                      useNativeDriver: true,
                    },
                  },
                },
              })}
            />
            <Stack.Screen
              name="Teaching"
              component={Teaching}
              options={{
                title: '对话教学',
                headerShown: false,
                cardStyleInterpolator: forRandomOverlay,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                transitionSpec: {
                  open: {
                    animation: 'timing',
                    config: {
                      duration: 350,
                      easing: Easing.out(Easing.quad),
                      useNativeDriver: true,
                    },
                  },
                  close: {
                    animation: 'timing',
                    config: {
                      duration: 250,
                      easing: Easing.in(Easing.quad),
                      useNativeDriver: true,
                    },
                  },
                },
              }}
            />
            <Stack.Screen
              name="Story"
              component={Story}
              options={{
                title: '故事时间',
                headerShown: false,
                cardStyleInterpolator: forRandomOverlay,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                transitionSpec: {
                  open: {
                    animation: 'timing',
                    config: {
                      duration: 350,
                      easing: Easing.out(Easing.quad),
                      useNativeDriver: true,
                    },
                  },
                  close: {
                    animation: 'timing',
                    config: {
                      duration: 250,
                      easing: Easing.in(Easing.quad),
                      useNativeDriver: true,
                    },
                  },
                },
              }}
            />
            <Stack.Screen
              name="Chat"
              component={Chat}
              options={{
                title: '智能聊天',
                headerShown: false,
                cardStyleInterpolator: forRandomOverlay,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                transitionSpec: {
                  open: {
                    animation: 'timing',
                    config: {
                      duration: 350,
                      easing: Easing.out(Easing.quad),
                      useNativeDriver: true,
                    },
                  },
                  close: {
                    animation: 'timing',
                    config: {
                      duration: 250,
                      easing: Easing.in(Easing.quad),
                      useNativeDriver: true,
                    },
                  },
                },
              }}
            />
          </Stack.Navigator>
        )}
      </HomeTitleContext.Consumer>
    </HomeTitleContext.Provider>
  )
}
