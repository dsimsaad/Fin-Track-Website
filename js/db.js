import { db, doc, setDoc, getDoc, updateDoc, onSnapshot } from "./firebase.js";

class DataManager {
    constructor() {
        this.cache = {
            budgetData: [],
            expenseData: [],
            incomeData: [],
            savingsData: [],
            savingsGoals: [],
            investments: [],
            debtData: { lent: [], borrowed: [] } // Added for Debt Module
        };
        this.userId = null;
        this.unsubscribe = null;
    }

    init(userId, onUpdateCallback) {
        this.userId = userId;
        console.log(`Initializing DataManager for user: ${userId}`);

        // Listen for real-time updates
        const docRef = doc(db, "users", userId);

        this.unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Merge with cache, ensuring arrays exist
                this.cache = {
                    budgetData: data.budgetData || [],
                    expenseData: data.expenseData || [],
                    incomeData: data.incomeData || [],
                    savingsData: data.savingsData || [],
                    savingsGoals: data.savingsGoals || [],
                    investments: data.investments || [],
                    debtData: data.debtData || { lent: [], borrowed: [] }
                };
            } else {
                // Initialize empty doc if it doesn't exist
                this.saveAll();
            }
            if (onUpdateCallback) onUpdateCallback(this.cache);
        });
    }

    stop() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.userId = null;
        this.cache = this.getEmptyState();
    }

    getEmptyState() {
        return {
            budgetData: [],
            expenseData: [],
            incomeData: [],
            savingsData: [],
            savingsGoals: [],
            investments: [],
            debtData: { lent: [], borrowed: [] }
        };
    }

    getData() {
        return this.cache;
    }

    async saveAll() {
        if (!this.userId) return;
        try {
            await setDoc(doc(db, "users", this.userId), this.cache);
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to save data. Please check your connection.");
        }
    }

    // Helper to push to array and save
    addItem(collectionName, item) {
        if (!this.cache[collectionName]) {
            this.cache[collectionName] = [];
        }
        this.cache[collectionName].push(item);
        this.saveAll();
    }

    // Helper to update item in array
    updateItem(collectionName, index, newItem) {
        if (this.cache[collectionName] && this.cache[collectionName][index]) {
            this.cache[collectionName][index] = newItem;
            this.saveAll();
        }
    }

    // Helper to remove item
    removeItem(collectionName, index) {
        if (this.cache[collectionName]) {
            this.cache[collectionName].splice(index, 1);
            this.saveAll();
        }
    }

    // Debt specific helpers
    addDebtItem(type, item) {
        // type is 'lent' or 'borrowed'
        if (!this.cache.debtData) this.cache.debtData = { lent: [], borrowed: [] };
        if (!this.cache.debtData[type]) this.cache.debtData[type] = [];

        this.cache.debtData[type].push(item);
        this.saveAll();
    }

    updateDebtItem(type, index, newItem) {
        if (this.cache.debtData && this.cache.debtData[type] && this.cache.debtData[type][index]) {
            this.cache.debtData[type][index] = newItem;
            this.saveAll();
        }
    }

    removeDebtItem(type, index) {
        if (this.cache.debtData && this.cache.debtData[type]) {
            this.cache.debtData[type].splice(index, 1);
            this.saveAll();
        }
    }
}

export const dataManager = new DataManager();
