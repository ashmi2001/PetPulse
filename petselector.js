import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getPets } from '../firebaseService';

const PetSelector = ({ userId, onSelect }) => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    const data = await getPets(userId);
    setPets(data);
    if (data.length > 0) {
      setSelectedPet(data[0]);
      onSelect(data[0]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select a Pet:</Text>
      <FlatList
        data={pets}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.petButton, selectedPet?.id === item.id && styles.selectedPet]}
            onPress={() => { setSelectedPet(item); onSelect(item); }}
          >
            <Text style={styles.petText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  label: { fontSize: 16, fontWeight: 'bold' },
  petButton: { padding: 10, margin: 5, backgroundColor: '#ccc', borderRadius: 5 },
  selectedPet: { backgroundColor: '#4CAF50' },
  petText: { fontSize: 14, color: '#fff' },
});

export default PetSelector;
