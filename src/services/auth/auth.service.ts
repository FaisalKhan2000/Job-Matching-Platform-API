interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  public static async registerUser(
    userData: UserRegistrationData
  ): Promise<any> {
    // Implementation here - typically would involve database operations
    return userData;
  }
}
