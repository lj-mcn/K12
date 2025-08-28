import React, {
  useContext,
} from 'react'
import {
  Text, View, ScrollView, StyleSheet, TouchableOpacity, ImageBackground,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { colors } from '../../theme'
import { ColorSchemeContext } from '../../context/ColorSchemeContext'

export default function Home() {
  const navigation = useNavigation()
  const { scheme } = useContext(ColorSchemeContext)
  const isDark = scheme === 'dark'
  const colorScheme = {
    background: isDark ? colors.black : colors.white,
    text: isDark ? colors.white : colors.primaryText,
  }

  const handleOptionPress = (option) => {
    console.log(`Selected option: ${option}`)
    switch (option) {
      case '语文':
        navigation.navigate('Teaching', { subject: '语文' })
        break
      case '数学':
        navigation.navigate('Teaching', { subject: '数学' })
        break
      case '英语':
        navigation.navigate('Teaching', { subject: '英语' })
        break
      case '看故事':
        navigation.navigate('Story')
        break
      case '聊天':
        navigation.navigate('Chat')
        break
      default:
        break
    }
  }

  const options = [
    { id: 1, title: '语文', icon: '📝' },
    { id: 2, title: '数学', icon: '🔢' },
    { id: 3, title: '英语', icon: '🔤' },
    { id: 4, title: '看故事', icon: '📚' },
    { id: 5, title: '聊天', icon: '💬' },
  ]

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <Text style={[styles.titleText, { color: colorScheme.text }]}>
          选择你想要的学习内容
        </Text>
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionButton}
              onPress={() => handleOptionPress(option.title)}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={styles.optionText}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 40,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    marginHorizontal: 60,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.offWhite,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  optionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },
})
