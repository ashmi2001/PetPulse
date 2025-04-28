import firestore from '@react-native-firebase/firestore';

// Fetch all pets for a user
export const getPets = async (userId) => {
  const userDoc = await firestore().collection('users').doc(userId).get();
  return userDoc.data()?.pets ? Object.entries(userDoc.data().pets).map(([id, data]) => ({ id, ...data })) : [];
};

// Fetch a single pet’s location in real-time
export const trackPetLocation = (userId, petId, setLocation) => {
  return firestore()
    .collection('users')
    .doc(userId)
    .onSnapshot((doc) => {
      const pet = doc.data()?.pets[petId];
      if (pet) setLocation(pet.location);
    });
};

// Update pet’s location
export const updatePetLocation = async (userId, petId, lat, lng) => {
  await firestore()
    .collection('users')
    .doc(userId)
    .update({
      [`pets.${petId}.location`]: { lat, lng },
    });
};
