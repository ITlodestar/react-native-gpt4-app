import { Keyboard, View, StyleSheet, Text, TextInput, TouchableOpacity, Animated, ActivityIndicator } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorModal } from "../components/modal/ErrorModal";
import useColorAnimation from '../util/useColorAnimation';
import { chatCompletion, listEngines } from "../util/openAI";
import DismissKeyboardView from "../components/DismissKeyboardView";

const splashScreenTexts = [
    "ChatGPT 4.0", 
    "Let's explore", 
    "School sucks",
    "Let's collaborate", 
    "Insert your fucking token already",
    "Let's cheat a little",
    "Made by Notch!"
];

type SplashScreen = {
    bg: string;
    color: string;
}

const splashScreenColors: SplashScreen[] = [{
    bg: "#0D1F2D",
    color: "#FAE1DF"
}, {
    bg: "#546A7B",
    color: "#E4C3AD"
}, {
    bg: '#ED254E',
    color: '#F9DC5C'
}, {
    bg: "#07BEB8",
    color: "#FFEFD3"
}, {
    bg: "#25283D",
    color: "#EFD9CE"
}, {
    bg: '#294C60',
    color: '#FFC49B'
}, {
    bg: '#C2EABD',
    color: '#011936'
}, {
    bg: '#B49FCC',
    color: '#564D4A'
}, {
    bg: '#251351',
    color: '#C97B84'
}];

let splashScreenTextIndex = 0;
let splashScreenColorIndex = 0;

export default function LoginView() {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
    
  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
        if(!token) return;

        // @ts-ignore
        navigation.navigate("Home");
    });
  }, []);

  const handleTokenLogin = async () => {
        if(token === "" || loading) return;
        Keyboard.dismiss();

        if(!/^sk-\w{48}$/gm.test(token)) {
            setError("Token is invalid");
            return;
        }

        try{
            setLoading(true);
            const resp = await listEngines(token);
            setLoading(false);

            if(resp.error == undefined) {
                await AsyncStorage.setItem("token", token);

                setError(null);

                navigation.reset({
                    index: 0,
                    // @ts-ignore
                    routes: [{ name: 'Home' }],
                });


            }
            else {
                setError(resp.error.message);
            }
        }
        catch(err) {
            console.error(err);

            setError((err as any).message);
            setLoading(false);
        }
  };

  const [splashScreenText, setSplashScreenText] = useState(splashScreenTexts[splashScreenTextIndex]);
  const [splashScreenColor, setSplashScreenColor] = useState(splashScreenColors[splashScreenColorIndex]);
  
  useEffect(() => {
      const id = setInterval(() => {
        splashScreenTextIndex++;
        splashScreenColorIndex++;

        if(splashScreenTextIndex >= splashScreenTexts.length) {
            splashScreenTextIndex = 0;
        }

        if(splashScreenColorIndex >= splashScreenColors.length) {
            splashScreenColorIndex = 0;
        }

        setSplashScreenColor(splashScreenColors[splashScreenColorIndex]);
        setSplashScreenText(splashScreenTexts[splashScreenTextIndex]);
      }, 5000);

    return () => {
        clearInterval(id);
    }
  }, []);

  const [bgColor, finished] = useColorAnimation({
    color: splashScreenColor.bg
  });
  const [textColor, finished2] = useColorAnimation({
    color: splashScreenColor.color,  
  });

  return (
    <DismissKeyboardView
    style={{
        flex: 1
    }}
    >
    <Animated.View style={[styles.container, {
        backgroundColor: bgColor
    }]}>
        <Animated.Text
        style={[styles.h1, {
            color: textColor
        }]}
        >{splashScreenText}</Animated.Text>

        <View style={styles.bottomContainer}>
            <TextInput
            style={[styles.textInput, {
                borderColor: error ? '#ff0000' : 'black',
                borderWidth: error ? 2 : 1
            }]}
            value={token}
            placeholder="Token" 
            placeholderTextColor="#5c5c5c"
            cursorColor='black'
            selectionColor='#376cbf'
            onChangeText={(text) => {
                setToken(text);
                setError(null);
            }}
            onEndEditing={handleTokenLogin}
            />
            
            <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.button} 
            onPress={handleTokenLogin}>
                {loading ? (
                    <ActivityIndicator color="white" size={24}/>
                ) : (
                    <Text style={styles.text}>Login</Text>
                )}
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    </Animated.View>
    </DismissKeyboardView>
  );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        flex: 1,
        backgroundColor: '#282c34',
        justifyContent: 'flex-end'
    },
    bottomContainer: {
        width: '100%',
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#F3F3F4',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingVertical: 30,
        gap: 15,
    },
    h1: {
        fontSize: 42,
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: '65%',
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 0
        }
    },
    text: {
        fontSize: 18,
        color: 'white',
        textAlign: "center",
        fontWeight: 'bold'
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: 10,
        borderRadius: 50,
        width: '90%',
    },
    textInput: {
        borderWidth: 1,
        borderColor: "black",
        paddingHorizontal: 15,
        paddingVertical: 10,
        width: '90%',
        fontSize: 18,
        color: 'black',
        borderRadius: 40
    },
    error: {
        color: 'red',
        fontSize: 18,
        fontWeight: "500",
        textAlign: 'center',
        width: '90%'
    }
});