import { cn } from "@/lib/cn";

import { Text, TouchableHighlight, TouchableHighlightProps } from "react-native";


interface Props extends TouchableHighlightProps{
color?: "primary"|"accent"|"secondary" 
}
export function FilledButton({className, children, color, ...otherProps}: Props){
    return(
        <TouchableHighlight className={cn("bg-primary-900 px-6 py-4 rounded-full",{"bg-texts-800": color === "secondary"} ,className)} {...otherProps} >
            <Text className={cn("text-white text-center text-xl font-medium",{"text-texts-800": color === "secondary"})}>{children}</Text>
        </TouchableHighlight>
    )
}

export function OutlinedButton({color,className, children, ...otherProps}: Props){
    return(
        <TouchableHighlight className={cn("border-primary-900 border-[1px] px-6 py-4 rounded-full", {"border-texts-800": color === "secondary"}, className)} {...otherProps} >
            <Text className={cn("text-center text-primary-900 font-medium text-xl", {"text-texts-800": color === "secondary"})}>{children}</Text>
        </TouchableHighlight>
    )
}