import { Keyboard, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

type DismissKeyboardViewProps = {
    children: React.ReactNode;
    style?: any;
}

export default function DismissKeyboardView ({ children, style }: DismissKeyboardViewProps) {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View
            style={style}
            >
            {children}
            </View>
        </TouchableWithoutFeedback>
    );
}