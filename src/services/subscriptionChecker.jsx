import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

const checkSubscriptionStatus = async (uid) => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        unsubscribe();
        resolve({ isValid: false, message: "No user logged in" });
        return;
      }

      const deviceId = localStorage.getItem("deviceId");
      const userDocRef = doc(db, "users", user.uid);

      try {
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          unsubscribe();
          resolve({ isValid: false, message: "User document not found" });
          return;
        }

        const userData = userSnap.data();
        const { previousDeviceId } = userData;

        if (previousDeviceId === deviceId) {
          console.log(
            "✅ Previous device matched current device. Forcing sign-out."
          );
          alert("Session terminated: Account logged in on another device.");

          await setDoc(userDocRef, { previousDeviceId: null }, { merge: true });
          await signOut(auth);
          resolve({
            isValid: false,
            message: "Session terminated: Account logged in on another device",
          });
          return;
        }

        // Query the subscriptions collection for active subscription
        const subscriptionQuery = query(
          collection(db, "subscriptions"),
          where("uid", "==", user.uid),
          where("subscriptionStatus", "==", "active")
        );
        const subscriptionSnapshot = await getDocs(subscriptionQuery);

        if (subscriptionSnapshot.empty) {
          console.log("No active subscription found for this user.");
          unsubscribe();
          resolve({ isValid: false, message: "No active subscription found" });
          return;
        }

        // Get the first matching subscription (same as index page)
        const subscriptionDoc = subscriptionSnapshot.docs[0];
        const subscriptionData = subscriptionDoc.data();
        const subscriptionRef = subscriptionDoc.ref;

        const now = new Date();
        const endingDate = new Date(subscriptionData.endingDate);

        if (isNaN(endingDate.getTime())) {
          throw new Error("Invalid endingDate in subscription.");
        }

        if (endingDate < now) {
          console.log("❌ Subscription expired. Updating Firestore...");
  // 1. Update subscription status
  await updateDoc(subscriptionRef, { subscriptionStatus: "expired" });

  // Prepare update object for user document
  const updates = { subscriptionStatus: "expired" };

  // Expire free trial if it was in use
  if (userData.freeTrialStatus === "inuse") {
    updates.freeTrialStatus = "expired";
    console.log("🕓 Free trial expired. Status set to 'expired'.");
  }

  // 2. Update user document with subscriptionStatus and possibly freeTrialStatus
  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, updates);

  // 3. Update billingAddress document where uid == user.uid
  const billingQuery = query(
    collection(db, "billingAddress"),
    where("uid", "==", user.uid)
  );





          const billingSnapshot = await getDocs(billingQuery);

          if (!billingSnapshot.empty) {
            const billingRef = billingSnapshot.docs[0].ref;
            await updateDoc(billingRef, { paymentMethod: "expired" });
            console.log("📦 Billing address payment method set to 'expired'.");
          } else {
            console.log("No billingAddress document found for this user.");
          }

          console.log(
            "✔ Subscription and related documents updated to 'expired'."
          );
          resolve({ isValid: false, message: "Subscription has expired" });
        } else {
          const daysLeft = Math.ceil(
            (endingDate - now) / (1000 * 60 * 60 * 24)
          );
          resolve({
            isValid: true,
            message: `Active subscription (${daysLeft} days remaining)`,
          });
          console.log(
            `✅ Subscription is still active. Days remaining: ${daysLeft}`
          );
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        unsubscribe();
        reject(error);
      }
    });
  });
};

export default checkSubscriptionStatus;