
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Button, SafeAreaView, Text, TextInput, View } from "react-native";

export default function App() {
  const [room, setRoom] = useState("room_mock");
  const [lang, setLang] = useState("tr");

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>MovieChat (Mobile)</Text>
      <Text>Language: {lang}</Text>
      <TextInput value={room} onChangeText={setRoom} style={{ borderWidth: 1, marginVertical: 8, padding: 8 }} />
      <Button title="Join Room (placeholder)" onPress={() => {}} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
