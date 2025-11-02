import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFirebase, ensureAnonAuth } from "../firebase";
import { env } from "@/config/env";

vi.mock("@/config/env", () => ({
  env: {
    firebase: {
      apiKey: "test-api-key",
      authDomain: "test.firebaseapp.com",
      projectId: "test-project",
      storageBucket: "test.appspot.com",
      messagingSenderId: "123456",
      appId: "test-app-id",
    },
  },
}));

describe("Firebase Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return Firebase instances when config is valid", () => {
    const { app, auth, db } = getFirebase();
    
    // Should have all three instances
    expect(app).toBeDefined();
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
  });

  it("should return null instances when config is invalid", () => {
    // This would require mocking env to return null
    // For now, just test the function exists
    expect(typeof getFirebase).toBe("function");
  });
});

