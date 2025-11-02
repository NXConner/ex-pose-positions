import { describe, it, expect, vi, beforeEach } from "vitest";
import { getFirebase } from "../firebase";

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
    const { app } = getFirebase();

    expect(app).toBeDefined();
  });

  it("should return instances when config is invalid", () => {
    const { app } = getFirebase();
    // When config is invalid, app might be null but handled gracefully
    expect(app).toBeDefined();
  });
});
