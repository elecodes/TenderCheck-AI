import { AuthService } from "../src/application/services/AuthService";
import { InMemoryUserRepository } from "../src/infrastructure/repositories/InMemoryUserRepository";

async function main() {
  console.log("Testing AuthService...");

  try {
    const userRepo = new InMemoryUserRepository();
    const authService = new AuthService(userRepo);

    console.log("Attempting register...");
    const user = await authService.register(
      "Test User",
      "test@test.com",
      "password123",
    );
    console.log("Register success:", user);

    console.log("Attempting login...");
    const result = await authService.login("test@test.com", "password123");
    console.log("Login success. Token generated.");
  } catch (error) {
    console.error("CRASH:", error);
  }
}

main();
