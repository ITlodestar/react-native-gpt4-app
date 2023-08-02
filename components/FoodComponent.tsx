import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { COLORS, numberToKc } from "../utils/utils";
import { ObjednaniType } from "../backend/src/api";
import { useState } from "react";
import { JidelnaAPI } from "../api/api";
import { formatDate } from "../utils/utils";
import Modal from "react-native-modal";

import { MaterialIcons } from '@expo/vector-icons';

import { useNavigation } from "@react-navigation/native";
import { ErrorModal } from "./modal/ErrorModal";

export enum FoodType {
    SNIDANE = "Snídaně",
    OBED = "Oběd",
    VECERE = "Večeře",
    UNKNOWN = "Neznámý"
}

function getDescriptionIndexes(jidlo: Jidlo): [number, number] {
    if (jidlo.foodType === FoodType.SNIDANE) return [0, 0];
  
    if (jidlo.foodType === FoodType.VECERE) {
      if (jidlo.description.includes(",")) {
        return [0, jidlo.description.lastIndexOf(",")];
      } 
      else if (jidlo.description.includes("nápoj")) {
        return [0, jidlo.description.lastIndexOf("nápoj")];
      }
      else {
        return [0, 0];
      }
    } 
    else {
      // if (foodType === FoodType.OBED)
      const strings: string[] = jidlo.description.split(",");
  
      if (strings.length < 3) {
        return [0, strings[0].length];
      } 
      else {
        const index1: number = jidlo.description.indexOf(",");
        const index2: number = jidlo.description.indexOf(",", index1 + 1);
  
        return [index1 + 1, index2 + strings[2].length + 1];
      }
    }
  }

function boldenText(str: string, [start, end]: [number, number]) {
    
    const text1 = str.substring(0, start);
    const text2 = str.substring(start, end);
    const text3 = str.substring(end);

    return (
        <Text style={styles.text}>
            {text1}
            <Text style={[styles.text, {
                fontWeight: 'bold'
            }]}>{text2}</Text>
            {text3}
        </Text>
    )
}

function getObjednaniButton(
    jidlo: Jidlo, 
    loading: boolean, 
    onPress: (() => void | Promise<void>)
) {
    if(jidlo.type === ObjednaniType.NELZE) {
        return <Text style={[styles.nelze, styles.button]}>{jidlo.type}</Text>
    }

    let backgroundColor = "white";
    switch(jidlo.type) {
        case ObjednaniType.NELZE:
            backgroundColor = "red";
            break;
        case ObjednaniType.OBJEDNAT:
        case ObjednaniType.PREOBJEDNAT:
            backgroundColor = "#2eb347";
            break;
        case ObjednaniType.ZRUSIT:
            backgroundColor = "#349beb";
    }

    return (
        <TouchableOpacity 
        style={[styles.button, {
            backgroundColor
        }]}
        activeOpacity={0.8}
        onPress={onPress}>
            {loading ? (
                <ActivityIndicator 
                color="black"
                />
            ) : (
                <Text style={{
                    color: 'white',
                    textAlign: 'center'
                }}>{jidlo.type}</Text>
            )}	
        </TouchableOpacity>
    )
}

function Food({ jidlo, onPress, loading }: { 
    jidlo: Jidlo, 
    onPress: () => void | Promise<void>,
    loading: boolean
}) {
    return (
        <View style={styles.jidlo}>
            <Text style={styles.text}>{jidlo.title}</Text>
            {boldenText(jidlo.description, getDescriptionIndexes(jidlo))}
            <Text style={styles.text}>Cena {numberToKc(jidlo.price)}</Text>
            {getObjednaniButton(jidlo, loading, onPress)}
        </View>
    );
}

export default function FoodComponent({ dateJidlo }: { dateJidlo: DateJidlo }) {
    const [jidla, setJidla] = useState<Jidlo[]>(dateJidlo.jidla);
    const [loadingIndex, setLoadingIndex] = useState(-1);

    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation();

    return (
        <View>
            <ErrorModal
            isVisible={error != null}
            error={error as string}
            onClose={() => {
                // @ts-ignore 
                navigation.navigate("Login");
            }}
            onClosePress={() => {
                setError(null);
            }}
            />

            <Text style={styles.h1}>{formatDate(dateJidlo.date)}</Text>
            {jidla.map((jidlo, i) => 
                <Food
                key={i} 
                jidlo={jidlo} 
                loading={loadingIndex == i}
                onPress={async () => {
                    setLoadingIndex(i);

                    try {
                        const update = await JidelnaAPI.get().updateJidlo(jidlo);
                        setJidla(update.jidla);
                    }
                    catch(e) {
                        console.error(e);
                        setError((e as any).message);
                    }
                    
                    setLoadingIndex(-1);
                }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    jidlo: {
        width: '100%',
        justifyContent: 'center',
        justifySelf: 'center',
        marginVertical: 10,
        backgroundColor: '#222222',
        padding: 10,
        borderRadius: 4,
    },
    text: {
        color: 'white',
        marginVertical: 2
    },
    nelze: {
        backgroundColor: '#a60d02',
        color: 'white'
    },
    button: {
        textAlign: 'center',
        borderRadius: 4,
        paddingVertical: 5,
    },
    h1: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white'
    }
});