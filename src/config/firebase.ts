// Mock Firebase implementation
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: () => () => {}
};

const mockDb = {};
const mockStorage = {};

export const auth = mockAuth;
export const db = mockDb;
export const storage = mockStorage;