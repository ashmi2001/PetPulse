// PetSelector.js
import React, { useEffect, useState } from 'react';
import { getPets } from './petService';

const PetSelector = ({ userId, onSelect }) => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      const data = await getPets(userId);
      setPets(data);
      if (data.length > 0) {
        setSelectedPet(data[0]);
        onSelect(data[0]);
      }
    };
    fetchPets();
  }, [userId, onSelect]);

  return (
    <div>
      <h3>Select a Pet:</h3>
      <select onChange={(e) => {
        const pet = pets.find(p => p.id === e.target.value);
        setSelectedPet(pet);
        onSelect(pet);
      }}>
        {pets.map(pet => (
          <option key={pet.id} value={pet.id}>{pet.name}</option>
        ))}
      </select>
    </div>
  );
};

export default PetSelector;
