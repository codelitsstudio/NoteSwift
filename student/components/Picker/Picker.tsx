import {Picker, PickerProps} from '@react-native-picker/picker';
import { Text, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
interface Props extends PickerProps {
    data: {label: string, value: string}[],
    Icon: any;
    iconName: string,
    label: string
}
export default function CustomPicker({data, Icon, iconName, className, label, ...props}: Props){
    return(
            <View className="flex px-6 py-4 flex-row w-full bg-background-700 rounded-3xl items-center">
                <Icon name = {iconName}  size={24} className="text-texts-800 mr-6" />
                <View className="flex-1 gap-y-[0.125rem]">
                    {/* <Text className="text-xs text-texts-500">{label}</Text>
                    <Picker  
                    style={{
                    paddingTop: 0,
                       margin: -16,
                    }}
                    {...props}
                    >
                        {data.map((x, i)=><Picker.Item color='white'  style={{padding: 0}} label={x.label} value={x.value} key={i} />)}
                    </Picker> */}
                    <Text className="text-xs text-texts-500">{label}</Text>
                    <RNPickerSelect
                    items={data}
                    onValueChange={()=>null}
                    style={{
                        viewContainer: {
                            padding: 0,
                            margin: -16,
                            
                        },
                    }}
                  
                    />
                </View>
            </View>
    )
}