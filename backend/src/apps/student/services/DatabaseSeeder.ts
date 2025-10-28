export class DatabaseSeeder {

  /**
   * Seeds the database with essential data for production
   */
  static async seedDatabase(): Promise<void> {
    try {
      // Production seeding - minimal and safe
      // No automatic data creation in production
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}