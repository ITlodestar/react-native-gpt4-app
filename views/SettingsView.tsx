import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, TextInput, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { DarkTheme } from "../themes/Dark";
import { Dropdown } from "react-native-element-dropdown";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { Keyboard } from "react-native";
import DismissKeyboardView from "../components/DismissKeyboardView";
import Feather from "react-native-vector-icons/Feather";
import * as Clipboard from "expo-clipboard";

export type Settings = {
    engine: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
};

export const defaultSettings: Settings = {
    engine: "gpt-4",
    temperature: 1,
    maxTokens: 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
};

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    
    useEffect(() => {
        AsyncStorage.getItem("settings").then(settings => {
            settings && setSettings(JSON.parse(settings));
        });
    }, []);

    return settings;
}

type DropDownItem = {
    label: string;
    value: string;
};

const engines: DropDownItem[] = [
    'gpt-4-0613', 'gpt-4-0314', 'gpt-3.5-turbo-16k-0613', 'gpt-3.5-turbo', 'gpt-3.5-turbo-0301', 'gpt-4', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-0613'
].map(engine => ({
    label: engine.toUpperCase(),
    value: engine
}));

export default function SettingsView() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [copied, setCopied] = useState(false);

    const [temperature, setTemperature] = useState(settings.temperature.toString());
    const [maxTokens, setMaxTokens] = useState(settings.maxTokens.toString());
    const [topP, setTopP] = useState(settings.topP.toString());
    const [frequencyPenalty, setFrequencyPenalty] = useState(settings.frequencyPenalty.toString());
    const [presencePenalty, setPresencePenalty] = useState(settings.presencePenalty.toString());

    const navigation = useNavigation();

    useEffect(() => {
        AsyncStorage.getItem("settings").then(settings => {
            if(!settings) return;
            let settings_: Settings = JSON.parse(settings);

            setSettings(settings_);
            
            setMaxTokens(settings_.maxTokens.toString());
            setTemperature(settings_.temperature.toString());
            setTopP(settings_.topP.toString());
            setFrequencyPenalty(settings_.frequencyPenalty.toString());
            setPresencePenalty(settings_.presencePenalty.toString());
        });
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    Keyboard.dismiss();
                    AsyncStorage.setItem("settings", JSON.stringify(settings));
                    navigation.goBack();
                }}
                style={{
                    left: 10,
                    position: 'absolute'
                }}
                >
                    <MaterialCommunityIcons 
                    name="arrow-left" 
                    size={32} 
                    color={DarkTheme.color}
                    />
                </TouchableOpacity>
                
                <Text style={styles.title}>Settings</Text>

                <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    Keyboard.dismiss();
                    AsyncStorage.removeItem("token").then(() => {
                        navigation.reset({
                            index: 0,
                            // @ts-ignore
                            routes: [{ name: 'Login' }],
                        });
                    });
                }}
                style={{
                    right: 10,
                    position: 'absolute'
                }}
                >
                    <MaterialIcons
                    name="logout" 
                    size={32} 
                    color='#E56B6F'
                    />
                </TouchableOpacity>
            </View>
            <DismissKeyboardView
            style={{
                flex: 1
            }}
            >
            <View style={styles.settingsContainer}>
                <Text style={styles.settingsTitle}>Engine</Text>
                <View style={styles.settingsInputContainer}>
                    <Dropdown
                    data={engines}
                    labelField='label'
                    valueField='value'
                    placeholder={'Engine'}
                    value={settings.engine}
                    selectedTextStyle={{
                        color: DarkTheme.color,
                        marginLeft: 8
                    }}
                    onChange={(item) => {
                        setSettings({
                            ...settings,
                            engine: item.value
                        });
                    }}
                    renderLeftIcon={() => (
                        <MaterialCommunityIcons
                        name="engine" 
                        size={24} 
                        color={DarkTheme.color} 
                        />
                    )}
                />
                </View>
                <Text style={styles.settingsTitle}>Temperature</Text>
                <View style={styles.settingsInputContainer}>
                    <TextInput 
                        style={styles.settingsInput}
                        value={temperature}
                        onChangeText={setTemperature}
                        onEndEditing={() => {
                            const temperature_ = parseFloat(temperature);
                            if(!isNaN(temperature_)) {
                                setSettings({
                                    ...settings, 
                                    temperature: Math.min(Math.max(temperature_, 0), 1)
                                });
                            }
                        }}
                    />
                </View>
                <Text style={styles.settingsTitle}>Max Tokens</Text>
                <View style={styles.settingsInputContainer}>
                        <TextInput 
                            style={styles.settingsInput}
                            value={maxTokens}
                            onChangeText={setMaxTokens}
                            onEndEditing={() => {
                                const maxTokens_ = parseInt(maxTokens);
                                if(!isNaN(maxTokens_)) {
                                    setSettings({
                                        ...settings, 
                                        maxTokens: Math.max(maxTokens_, 1)
                                    });
                                }
                            }}
                        />
                </View>
                <Text style={styles.settingsTitle}>Top P</Text>
                <View style={styles.settingsInputContainer}>
                        <TextInput 
                            style={styles.settingsInput}
                            value={topP}
                            onChangeText={setTopP}
                            onEndEditing={() => {
                                const topP_ = parseFloat(topP);
                                if(!isNaN(topP_)) {
                                    setSettings({
                                        ...settings, 
                                        topP: Math.min(Math.max(topP_, 0), 1)
                                    });
                                }
                            }}
                        />
                </View>
                <Text style={styles.settingsTitle}>Frequency Penalty</Text>
                <View style={styles.settingsInputContainer}>
                        <TextInput 
                            style={styles.settingsInput}
                            value={frequencyPenalty}
                            onChangeText={setFrequencyPenalty}
                            onEndEditing={() => {
                                const frequencyPenalty_ = parseFloat(frequencyPenalty);
                                if(!isNaN(frequencyPenalty_)) {
                                    setSettings({
                                        ...settings, 
                                        frequencyPenalty: Math.min(Math.max(frequencyPenalty_, 0), 1)
                                    });
                                }
                            }}
                        />
                </View>
                <Text style={styles.settingsTitle}>Presence Penalty</Text>
                <View style={styles.settingsInputContainer}>
                        <TextInput 
                            style={styles.settingsInput}
                            value={presencePenalty}
                            onChangeText={setPresencePenalty}
                            onEndEditing={() => {
                                const presencePenalty_ = parseFloat(presencePenalty);
                                if(!isNaN(presencePenalty_)) {
                                    setSettings({
                                        ...settings, 
                                        presencePenalty: Math.min(Math.max(presencePenalty_, 0), 1)
                                    });
                                }
                            }}
                            
                        />
                </View>
                <View style={{
                    flex: 1,
                }}>
                    {copied ? (
                        <View
                        style={styles.copyButton}
                        >
                            <Feather
                            name="check"
                            size={24}
                            color={DarkTheme.color}
                            style={styles.textShadow}
                            />
                            <Text
                            style={[styles.buttonText, styles.textShadow]}
                            >
                                Copied!
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            AsyncStorage.getItem("token").then(token => {
                                Clipboard.setStringAsync(token || '').then(() => {
                                    setCopied(true);

                                    setTimeout(() => {
                                        setCopied(false);
                                    }, 3000);
                                })
                            });
                        }}
                        style={styles.copyButton}
                        >
                            <Feather
                            name="copy"
                            size={24}
                            color={DarkTheme.color}
                            style={styles.textShadow}
                            />
                            <Text
                            style={[styles.buttonText, styles.textShadow]}
                            >
                                Copy token
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            </DismissKeyboardView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: DarkTheme.background,
        marginTop: 30,
        flex: 1
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        margin: 10
    },
    settingsContainer: {
        backgroundColor: DarkTheme.primary,
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '100%'
    },
    settingsTitle: {
        color: DarkTheme.color,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    settingsInputContainer: {
        backgroundColor: DarkTheme.background,
        padding: 10,
        borderRadius: 12,
        marginBottom: 10
    },
    settingsInput: {
        color: DarkTheme.color,
        fontSize: 16,
        fontWeight: 'bold'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    copyButton: {
        backgroundColor: DarkTheme.special,
        padding: 10,
        borderRadius: 12,
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: DarkTheme.primary,
        shadowOffset: {
            width: 1,
            height: 1,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        color: DarkTheme.color,
    },
    textShadow: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 1
    }
});