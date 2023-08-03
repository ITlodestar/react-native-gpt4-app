import { Text, View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { DarkTheme } from '../themes/Dark';
import AntDesign from "react-native-vector-icons/AntDesign"
import Feather from "react-native-vector-icons/Feather"
import { useState, useEffect } from 'react';
import { Message, chatCompletion, formatText } from "../util/openAI"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from "./SettingsView";

function MessageItem({ message }: { message: Message & { formattedContent: JSX.Element; }; }) {
    return (
        <View style={[styles.messageItem, {
            backgroundColor: message.role == "user" ? DarkTheme.background : '#362b3b',
        }]}>
            <Text
            style={[styles.messageRole, {
                color: message.role == "user" ? '#E56B6F' : DarkTheme.color
            }]}
            >
            {message.role == "user" ? "You" : "ChatGPT"}
            </Text>
            {message.formattedContent}
        </View>
    );
}

export default function HomeView() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<(Message & { formattedContent: JSX.Element; })[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const settings = useSettings();
    const navigation = useNavigation();

    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        AsyncStorage.getItem("token").then(setToken);
    }, []);

    useEffect(() => {
        if(error == null) return;

        setTimeout(() => {
            setError(null);
        }, 3000);

    }, [error])
    
    const sendMessage = () => {
        if(loading) {
            setLoading(false);
            // TODO: STOP MESSAGE
        }
        else if(message.length > 0){
            setLoading(true);
            const messagesCopy = [...messages];
            messagesCopy.push({
                role: 'user',
                content: message,
                formattedContent: formatText(message, styles.messageText)
            });

            setMessages(messagesCopy);
            setMessage("");
            
            chatCompletion({
                model: settings.engine,
                messages: messagesCopy.map((msg) => {
                    // Remove formattedContent
                    return {
                        content: msg.content,
                        role: msg.role
                    }
                }),
                max_tokens: settings.maxTokens,
                temperature: settings.temperature,
                top_p: settings.topP,
                frequency_penalty: settings.frequencyPenalty,
                presence_penalty: settings.presencePenalty,
            }, token as string)
            .then((resp) => {
                if(resp.error == undefined) {
                    setMessages([...messagesCopy, {
                        role: 'assistant',
                        content: resp.choices[0].message.content,
                        formattedContent: formatText(resp.choices[0].message.content, styles.messageText)
                    }]);

                    setLoading(false);
                }
                else {
                    messagesCopy.pop();

                    setMessages([...messagesCopy]);
                    setError(resp.error.message);

                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error(err);

                setError((err as any).message);
                setLoading(false);
            });
        }
    };

    return (
        <View style={styles.container}>
            <View
            style={styles.topBar}
            >
                <TouchableOpacity
                activeOpacity={0.8}
                style={styles.icon}
                onPress={() => {
                    // @ts-ignore
                    navigation.navigate("Settings");
                }}
                >
                    <Feather
                    name="settings"
                    size={28}
                    color={DarkTheme.color}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                activeOpacity={0.8}
                style={styles.icon}
                onPress={() => {
                    setMessages([]);
                }}
                >
                    <Feather
                    name="trash-2"
                    size={28}
                    color={'#E56B6F'}
                    />
                </TouchableOpacity>
            </View>
            

            {error && (
                <Text
                style={{
                    position: "absolute",
                    top: 10,
                    fontSize: 24,
                    color: 'red',
                }}
                >{error}</Text>
            )}

            {messages.length == 0 && (
                <Text
                style={styles.h1}
                >
                {`ChatGPT ${settings.engine.split("-")[1][0]}.0`}
                </Text>
            )}

            <FlatList
            data={messages}
            style={styles.list}
            renderItem={({item}) => <MessageItem message={item}/>}
            keyExtractor={(item, index) => index.toString()}
            />

            <View style={styles.inputWrap}>
                <TextInput 
                style={styles.textInput}
                placeholder="Message"
                placeholderTextColor={'#d9d9d9'}
                value={message}
                onChangeText={setMessage}
                selectionColor={'#E56B6F'}
                onEndEditing={sendMessage}
                multiline
                />
                <TouchableOpacity
                activeOpacity={0.8}
                onPress={sendMessage}
                >
                    {loading ? (
                        <ActivityIndicator
                        color={DarkTheme.color}
                        size={24}
                        style={{
                            backgroundColor: DarkTheme.secondary,
                            padding: 10,
                            borderRadius: 50
                        }}
                        />
                    ) : (
                        <AntDesign
                        style={{
                            backgroundColor: message ? DarkTheme.special : DarkTheme.secondary,
                            padding: 10,
                            borderRadius: 50
                        }}
                        name="arrowup"
                        size={24}
                        color={message ? DarkTheme.color : '#919090'}
                        />
                    )}
                    
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        zIndex: 1
    },
    icon: {
        borderRadius: 50,
    },
    container: {
        marginTop: 30,
        backgroundColor: DarkTheme.background,
        flex: 1,
        alignItems: 'center',
    },
    list: {  
        width: "100%",
        height: "100%",
        marginBottom: 15,
    },
    inputWrap: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 15,
    },
    textInput: {
        backgroundColor: DarkTheme.primary,
        color: DarkTheme.color,
        width: '85%',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 40,
        fontSize: 18
    },
    text: {
        color: DarkTheme.color,
        fontSize: 24
    },
    messageItem: {
        alignSelf: "flex-start",
        width: "100%",
        padding: 20
    },
    messageText: {
        color: "white",
        fontSize: 19
    },
    messageRole: {
        fontSize: 16,
        color: '#d9d9d9',
        marginBottom: 5
    },
    h1: {
        color: DarkTheme.color,
        fontSize: 48,
        fontWeight: 'bold',
        marginTop: '50%'
    }
});