import { db } from '../firebase.js';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export const submitSurvey = async (county, responses) => {
  // Debug log to verify data structure before the network call
  console.log("1. Service started with:", { county, responses }); 
  
  try {
    const payload = {
      county,           // String (e.g., "Pinellas")
      responses,        // Map/Object of question IDs and ratings
      submittedAt: serverTimestamp() // Firestore server-side clock
    };
    
    // Save to the surveyResponses collection
    const docRef = await addDoc(collection(db, "surveyResponses"), payload);
    
    console.log("2. Success! ID:", docRef.id); 
    return docRef.id;

  } catch (error) {
    // Log technical error for debugging and pass it to the UI
    console.error("3. Submission Error:", error); 
    throw error;
  }
};

export const fetchAllResults = async () => {
  try {

    const querySnapshot = await getDocs(collection(db, "surveyResponses")); 
    
    const results = [];
    querySnapshot.forEach((doc) => {
      // Package the Firestore document ID with the actual data
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error("Error fetching survey results:", error);
    throw error;
  }
};