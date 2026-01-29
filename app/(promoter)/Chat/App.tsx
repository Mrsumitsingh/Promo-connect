import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChatScreen from "./chat";
import IndividualChatScreen from "./individualChat";

export type RootStackParamList = {
  Chat: undefined;
  IndividualChat: {
    chatId: string;
    brandName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="IndividualChat" component={IndividualChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
