import React from 'react'
import {
  StyleSheet, TouchableOpacity, Text, View,
} from 'react-native'
import { fontSize, colors } from '../theme'

export default function Button(props) {
  const {
    label, onPress, disable, style,
  } = props

  if (disable) {
    return (
      <View style={[styles.button, { opacity: 0.3 }, style]}>
        <Text style={styles.buttonText}>{label}</Text>
      </View>
    )
  }

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.offWhite,
    borderWidth: 2,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.black,
    fontSize: fontSize.large,
    fontWeight: 'bold',
  },
})
