import Modal from "react-native-modal";
import { COLORS } from "../../utils/utils";
import { MaterialIcons } from "@expo/vector-icons";

import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

type ErrorModalProps = {
    isVisible: boolean;
    error: string;
    onClose?: () => void;
    onClosePress?: () => void;
}

export function ErrorModal({
    isVisible,
    onClose,
    onClosePress,
    error
  } : ErrorModalProps) {
  
    return (
      <Modal
      isVisible={isVisible}
      onModalHide={onClose}
      >
        <View style={styles.content}>
            <MaterialIcons name="error-outline" size={32} color={COLORS.RED} />
            <Text style={styles.text}>{error}</Text>
    
            <TouchableOpacity 
                onPress={onClosePress}
                activeOpacity={0.8}
                style={styles.button}
                >
                <Text>Close</Text>
            </TouchableOpacity>
        </View>
      </Modal>
    );
  }


const styles = StyleSheet.create({
    content: {
        backgroundColor: COLORS.BG_COLOR,
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    contentTitle: {
        fontSize: 20,
        marginBottom: 12,
        color: 'white'
    },
    text: {
        color: 'white',
        marginVertical: 2
    },
    button: {
        backgroundColor: COLORS.purple,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 4,
        marginTop: 10
    }
});