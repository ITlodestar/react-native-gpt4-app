import { useRef, useMemo, useEffect, useState } from "react";
import { Animated } from "react-native";

type ColorAnimationProps = {
  color: string;
  easing?: ((value: number) => number) | undefined;
  animationConfig?: 
    Omit<Omit<Animated.SpringAnimationConfig, "useNativeDriver">, "toValue"> | undefined;
}

export default function useColorAnimation({
  color,
  easing,
  animationConfig
}: ColorAnimationProps):
[Animated.AnimatedInterpolation<string | number>, boolean] 
{
  const anim = useMemo(() => new Animated.Value(0), [color]);
  const [finished, setFinished] = useState(true)
  const currentColor = useRef(color);
  const nextColor = useMemo(()=> color, [color]);

  const animColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [currentColor.current, nextColor],
    easing
  });

  useEffect(() => {
    setFinished(false);

    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: false,
      ...animationConfig
    }).start(() => {
      currentColor.current = nextColor;
      setFinished(true)
    });

  }, [color]);

  return [animColor, finished];
};