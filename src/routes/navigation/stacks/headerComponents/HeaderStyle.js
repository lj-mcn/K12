import React from 'react'
import { View } from 'react-native'
import { colors } from '../../../../theme'

const HeaderStyle = () => (
  <View
    style={{ 
      flex: 1, 
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.black
    }}
  />
)

export default HeaderStyle
